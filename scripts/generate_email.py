import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

np.random.seed(11)

start_date = datetime(2024, 1, 1)
weeks = 12

# Campaign archetypes with characteristic performance
archetypes = {
    "Newsletter": {"open": (0.32, 0.46), "click": (0.018, 0.04), "conv": (0.02, 0.05), "aov": (60, 140)},
    "Promo": {"open": (0.22, 0.34), "click": (0.03, 0.07), "conv": (0.04, 0.09), "aov": (45, 120)},
    "Welcome": {"open": (0.5, 0.68), "click": (0.08, 0.16), "conv": (0.06, 0.12), "aov": (70, 160)},
    "Abandoned Cart": {"open": (0.4, 0.55), "click": (0.1, 0.2), "conv": (0.1, 0.22), "aov": (90, 220)},
    "Win-back": {"open": (0.18, 0.3), "click": (0.02, 0.05), "conv": (0.015, 0.04), "aov": (55, 130)},
}

campaign_names = {
    "Newsletter": ["Semanal #{0}", "Novedades #{0}", "Insider #{0}"],
    "Promo": ["Flash Sale {0}", "Descuento {0}", "Oferta Limitada {0}"],
    "Welcome": ["Bienvenida {0}", "Hola, soy parte de {0}"],
    "Abandoned Cart": ["¿Olvidaste algo? {0}", "Tu carrito te espera {0}"],
    "Win-back": ["Te extrañamos {0}", "Vuelve y ahorra {0}"],
}

rows = []
cid = 0
for w in range(weeks):
    week_start = start_date + timedelta(weeks=w)
    # 2-3 campaigns per week, weighted toward newsletter/promo
    n_camp = np.random.choice([2, 3], p=[0.4, 0.6])
    types = np.random.choice(
        list(archetypes.keys()),
        size=n_camp,
        p=[0.35, 0.3, 0.12, 0.13, 0.10],
        replace=True,
    )
    for ctype in types:
        cid += 1
        a = archetypes[ctype]
        name_tpl = campaign_names[ctype][np.random.randint(len(campaign_names[ctype]))]
        name = name_tpl.format(cid)

        sent = int(np.random.uniform(8000, 60000))
        delivered = int(sent * np.random.uniform(0.965, 0.99))
        open_rate = float(np.random.uniform(*a["open"]))
        opens = int(delivered * open_rate)
        click_rate = float(np.random.uniform(*a["click"]))
        clicks = int(delivered * click_rate)
        conv = float(np.random.uniform(*a["conv"]))
        orders = int(clicks * conv * np.random.uniform(0.8, 1.2))
        aov = float(np.random.uniform(*a["aov"]))
        revenue = round(orders * aov, 2)
        unsubs = int(delivered * np.random.uniform(0.0008, 0.004))

        rows.append({
            "campaign_id": f"cmp_{cid:03d}",
            "campaign_name": name,
            "type": ctype,
            "send_date": week_start.strftime("%Y-%m-%d"),
            "week": f"W{w + 1:02d}",
            "sent": sent,
            "delivered": delivered,
            "opens": opens,
            "clicks": clicks,
            "orders": orders,
            "revenue": revenue,
            "unsubscribes": unsubs,
            "open_rate": round(opens / delivered * 100, 2),
            "click_rate": round(clicks / delivered * 100, 2),
        })

df = pd.DataFrame(rows)
os.makedirs("public/data", exist_ok=True)
df.to_csv("public/data/email_raw.csv", index=False)

# ---- Totals ----
sent = int(df["sent"].sum())
delivered = int(df["delivered"].sum())
opens = int(df["opens"].sum())
clicks = int(df["clicks"].sum())
orders = int(df["orders"].sum())
revenue = round(float(df["revenue"].sum()), 2)
unsubs = int(df["unsubscribes"].sum())

totals = {
    "sent": sent,
    "delivered": delivered,
    "open_rate": round(opens / delivered * 100, 2),
    "click_rate": round(clicks / delivered * 100, 2),
    "revenue": revenue,
    "orders": orders,
    "conv_rate": round(orders / clicks * 100, 2),
    "unsub_rate": round(unsubs / delivered * 100, 3),
    "rpe": round(revenue / delivered, 3),
    "date_range": {"start": "2024-01-01", "end": (start_date + timedelta(weeks=weeks) - timedelta(days=1)).strftime("%Y-%m-%d")},
}

# ---- By week ----
by_week = df.groupby("week").agg(
    sent=("sent", "sum"),
    delivered=("delivered", "sum"),
    opens=("opens", "sum"),
    clicks=("clicks", "sum"),
    revenue=("revenue", "sum"),
    orders=("orders", "sum"),
).reset_index().sort_values("week")
by_week["open_rate"] = (by_week["opens"] / by_week["delivered"] * 100).round(2)
by_week["click_rate"] = (by_week["clicks"] / by_week["delivered"] * 100).round(2)
by_week["revenue"] = by_week["revenue"].round(2)
by_week = by_week[["week", "sent", "open_rate", "click_rate", "revenue", "orders"]]

# ---- Top campaigns by revenue ----
top_campaigns = df.sort_values("revenue", ascending=False).head(10)[
    ["campaign_name", "type", "sent", "open_rate", "click_rate", "revenue"]
]

# ---- A/B tests: synthesize subject-line tests across types ----
ab_specs = [
    ("Asunto Promo", "Promo", "20% OFF hoy", "🔥 Tu descuento expira"),
    ("Personalización", "Newsletter", "Novedades de la semana", "{nombre}, esto es para ti"),
    ("Urgencia Carrito", "Abandoned Cart", "Tu carrito te espera", "Últimas horas para completar"),
    ("Emoji Asunto", "Promo", "Nueva colección", "✨ Nueva colección ✨"),
    ("Win-back Oferta", "Win-back", "Te extrañamos", "Vuelve: 15% + envío gratis"),
]
ab_tests = []
for name, ctype, subj_a, subj_b in ab_specs:
    a = archetypes[ctype]
    base_open = float(np.random.uniform(*a["open"]))
    base_click = float(np.random.uniform(*a["click"]))
    lift_open = np.random.uniform(0.05, 0.35)
    lift_click = np.random.uniform(0.05, 0.4)
    a_open = round(base_open * 100, 2)
    b_open = round(base_open * (1 + lift_open) * 100, 2)
    a_click = round(base_click * 100, 2)
    b_click = round(base_click * (1 + lift_click) * 100, 2)
    sent_each = int(np.random.uniform(12000, 30000))
    a_rev = round(sent_each * (base_click) * np.random.uniform(0.04, 0.09) * np.random.uniform(60, 140), 2)
    b_rev = round(sent_each * (base_click * (1 + lift_click)) * np.random.uniform(0.04, 0.09) * np.random.uniform(60, 140), 2)
    winner = "B" if b_rev >= a_rev else "A"
    ab_tests.append({
        "test": name,
        "type": ctype,
        "subject_a": subj_a,
        "subject_b": subj_b,
        "sent_per_variant": sent_each,
        "a_open_rate": a_open,
        "b_open_rate": b_open,
        "a_click_rate": a_click,
        "b_click_rate": b_click,
        "a_revenue": a_rev,
        "b_revenue": b_rev,
        "winner": winner,
    })

output = {
    "totals": totals,
    "by_week": by_week.to_dict(orient="records"),
    "top_campaigns": top_campaigns.to_dict(orient="records"),
    "ab_tests": ab_tests,
}

with open("public/data/email.json", "w") as f:
    json.dump(output, f, indent=2)

print("Email marketing dataset generado:")
print(f"  Campañas: {len(df)}")
print(f"  Enviados: {sent:,} | Open rate: {totals['open_rate']}% | CTR: {totals['click_rate']}%")
print(f"  Revenue atribuido: ${revenue:,.2f} | Órdenes: {orders:,}")
print(f"  A/B tests: {len(ab_tests)}")
print("Archivos guardados en public/data/")
