import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

np.random.seed(42)

campaigns = [
    {"id": "camp_001", "name": "Leads - Formulario Contacto", "objective": "LEAD_GENERATION"},
    {"id": "camp_002", "name": "Trafico - Blog Posts", "objective": "TRAFFIC"},
    {"id": "camp_003", "name": "Conversion - Compra Directa", "objective": "CONVERSIONS"},
]

adsets = [
    {"id": "adset_001", "campaign_id": "camp_001", "name": "Audiencia - Interes Legal 25-45"},
    {"id": "adset_002", "campaign_id": "camp_001", "name": "Audiencia - Lookalike Clientes"},
    {"id": "adset_003", "campaign_id": "camp_002", "name": "Retargeting - Visitantes Web"},
    {"id": "adset_004", "campaign_id": "camp_003", "name": "Audiencia - Compradores Previos"},
    {"id": "adset_005", "campaign_id": "camp_003", "name": "Audiencia - Interes Producto"},
]

start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 3, 31)
days = (end_date - start_date).days + 1

rows = []
for adset in adsets:
    camp = next(c for c in campaigns if c["id"] == adset["campaign_id"])
    base_spend = np.random.uniform(80, 250)
    base_ctr = np.random.uniform(0.01, 0.04)
    base_cpm = np.random.uniform(8, 25)

    for day_offset in range(days):
        date = start_date + timedelta(days=day_offset)
        weekday = date.weekday()
        weekend_factor = 0.75 if weekday >= 5 else 1.0
        trend_factor = 1 + (day_offset / days) * 0.2
        noise = np.random.uniform(0.8, 1.2)

        spend = round(base_spend * weekend_factor * trend_factor * noise, 2)
        impressions = int(spend / base_cpm * 1000 * np.random.uniform(0.9, 1.1))
        clicks = int(impressions * base_ctr * np.random.uniform(0.85, 1.15))
        ctr = round(clicks / impressions * 100, 4) if impressions > 0 else 0
        cpc = round(spend / clicks, 4) if clicks > 0 else 0
        cpm = round(spend / impressions * 1000, 4) if impressions > 0 else 0

        if camp["objective"] == "LEAD_GENERATION":
            conv_rate = np.random.uniform(0.05, 0.15)
            leads = int(clicks * conv_rate)
            purchases = 0
            revenue = 0
        elif camp["objective"] == "CONVERSIONS":
            conv_rate = np.random.uniform(0.02, 0.08)
            leads = 0
            purchases = int(clicks * conv_rate)
            revenue = round(purchases * np.random.uniform(80, 300), 2)
        else:
            leads = 0
            purchases = 0
            revenue = 0

        cpl = round(spend / leads, 2) if leads > 0 else 0
        roas = round(revenue / spend, 2) if spend > 0 and revenue > 0 else 0

        rows.append({
            "date": date.strftime("%Y-%m-%d"),
            "campaign_id": camp["id"],
            "campaign_name": camp["name"],
            "campaign_objective": camp["objective"],
            "adset_id": adset["id"],
            "adset_name": adset["name"],
            "spend": spend,
            "impressions": impressions,
            "clicks": clicks,
            "ctr": ctr,
            "cpc": cpc,
            "cpm": cpm,
            "leads": leads,
            "purchases": purchases,
            "revenue": revenue,
            "cpl": cpl,
            "roas": roas,
        })

df = pd.DataFrame(rows)

os.makedirs("public/data", exist_ok=True)

df.to_csv("public/data/meta_ads_raw.csv", index=False)

summary_by_day = df.groupby("date").agg(
    spend=("spend", "sum"),
    impressions=("impressions", "sum"),
    clicks=("clicks", "sum"),
    leads=("leads", "sum"),
    purchases=("purchases", "sum"),
    revenue=("revenue", "sum"),
).reset_index()
summary_by_day["cpl"] = (summary_by_day["spend"] / summary_by_day["leads"].replace(0, float("nan"))).round(2)
summary_by_day["roas"] = (summary_by_day["revenue"] / summary_by_day["spend"].replace(0, float("nan"))).round(2)
summary_by_day["ctr"] = (summary_by_day["clicks"] / summary_by_day["impressions"] * 100).round(4)

by_campaign = df.groupby(["campaign_id", "campaign_name", "campaign_objective"]).agg(
    spend=("spend", "sum"),
    impressions=("impressions", "sum"),
    clicks=("clicks", "sum"),
    leads=("leads", "sum"),
    purchases=("purchases", "sum"),
    revenue=("revenue", "sum"),
).reset_index()
by_campaign["cpl"] = (by_campaign["spend"] / by_campaign["leads"].replace(0, float("nan"))).round(2)
by_campaign["roas"] = (by_campaign["revenue"] / by_campaign["spend"].replace(0, float("nan"))).round(2)
by_campaign["ctr"] = (by_campaign["clicks"] / by_campaign["impressions"] * 100).round(4)

by_adset = df.groupby(["adset_id", "adset_name", "campaign_name"]).agg(
    spend=("spend", "sum"),
    impressions=("impressions", "sum"),
    clicks=("clicks", "sum"),
    leads=("leads", "sum"),
    purchases=("purchases", "sum"),
    revenue=("revenue", "sum"),
).reset_index()
by_adset["cpl"] = (by_adset["spend"] / by_adset["leads"].replace(0, float("nan"))).round(2)
by_adset["ctr"] = (by_adset["clicks"] / by_adset["impressions"] * 100).round(4)

totals = {
    "spend": round(df["spend"].sum(), 2),
    "impressions": int(df["impressions"].sum()),
    "clicks": int(df["clicks"].sum()),
    "leads": int(df["leads"].sum()),
    "purchases": int(df["purchases"].sum()),
    "revenue": round(df["revenue"].sum(), 2),
    "cpl": round(df["spend"].sum() / df["leads"].sum(), 2) if df["leads"].sum() > 0 else 0,
    "roas": round(df["revenue"].sum() / df["spend"].sum(), 2) if df["spend"].sum() > 0 else 0,
    "ctr": round(df["clicks"].sum() / df["impressions"].sum() * 100, 4) if df["impressions"].sum() > 0 else 0,
    "date_range": {"start": "2024-01-01", "end": "2024-03-31"},
}

output = {
    "totals": totals,
    "by_day": summary_by_day.fillna(0).to_dict(orient="records"),
    "by_campaign": by_campaign.fillna(0).to_dict(orient="records"),
    "by_adset": by_adset.fillna(0).to_dict(orient="records"),
}

with open("public/data/meta_ads.json", "w") as f:
    json.dump(output, f, indent=2)

print("Dataset generado:")
print(f"  Dias: {days}")
print(f"  Filas totales: {len(df)}")
print(f"  Spend total: ${totals['spend']:,.2f}")
print(f"  Leads totales: {totals['leads']}")
print(f"  CPL promedio: ${totals['cpl']}")
print(f"  ROAS: {totals['roas']}")
print("Archivos guardados en public/data/")
