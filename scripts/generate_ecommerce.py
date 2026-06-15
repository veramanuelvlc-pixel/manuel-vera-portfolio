import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import os

np.random.seed(7)

N_ORDERS = 100_000
start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 12, 31)
total_days = (end_date - start_date).days + 1

categories = {
    "Electronics": {"weight": 0.22, "price": (60, 900)},
    "Clothing": {"weight": 0.28, "price": (15, 180)},
    "Home": {"weight": 0.18, "price": (20, 400)},
    "Beauty": {"weight": 0.15, "price": (8, 90)},
    "Sports": {"weight": 0.10, "price": (25, 350)},
    "Books": {"weight": 0.07, "price": (6, 45)},
}
products = {
    "Electronics": ["Wireless Earbuds", "4K Monitor", "Mechanical Keyboard", "Smart Watch", "USB-C Hub"],
    "Clothing": ["Slim Jeans", "Cotton Tee", "Running Hoodie", "Wool Coat", "Sneakers"],
    "Home": ["Ceramic Mug Set", "LED Desk Lamp", "Throw Blanket", "Knife Set", "Air Purifier"],
    "Beauty": ["Vitamin C Serum", "Matte Lipstick", "Face Cleanser", "Hair Oil", "SPF 50 Cream"],
    "Sports": ["Yoga Mat", "Dumbbell Set", "Running Shoes", "Foam Roller", "Cycling Gloves"],
    "Books": ["Data Science 101", "The Lean Startup", "Atomic Habits", "Deep Work", "SQL Cookbook"],
}

cat_names = list(categories.keys())
cat_weights = np.array([categories[c]["weight"] for c in cat_names])
cat_weights = cat_weights / cat_weights.sum()

# Customer base with heterogeneous purchase frequency (drives LTV / repeat / churn)
N_CUSTOMERS = 24_000
cust_ids = np.array([f"cust_{i:05d}" for i in range(N_CUSTOMERS)])
# A minority of loyal customers place most of the orders (Pareto-ish)
cust_propensity = np.random.gamma(shape=1.4, scale=1.0, size=N_CUSTOMERS)
cust_propensity = cust_propensity / cust_propensity.sum()

# Seasonal weight per day: ramp toward Q4, weekend dip, November/December peak
day_weights = []
for d in range(total_days):
    date = start_date + timedelta(days=d)
    trend = 1 + (d / total_days) * 0.4
    season = 1.0
    if date.month in (11, 12):
        season = 1.6
    if date.month == 7:
        season = 1.15
    weekend = 0.85 if date.weekday() >= 5 else 1.0
    day_weights.append(trend * season * weekend)
day_weights = np.array(day_weights)
day_probs = day_weights / day_weights.sum()

order_cust = np.random.choice(cust_ids, size=N_ORDERS, p=cust_propensity)
order_day = np.random.choice(total_days, size=N_ORDERS, p=day_probs)
order_cat = np.random.choice(cat_names, size=N_ORDERS, p=cat_weights)

rows = []
for i in range(N_ORDERS):
    cat = order_cat[i]
    lo, hi = categories[cat]["price"]
    unit = round(float(np.random.uniform(lo, hi)), 2)
    qty = int(np.random.choice([1, 1, 1, 2, 2, 3], p=[0.5, 0.2, 0.1, 0.1, 0.06, 0.04]))
    revenue = round(unit * qty, 2)
    date = start_date + timedelta(days=int(order_day[i]))
    rows.append({
        "order_id": f"ord_{i:06d}",
        "customer_id": order_cust[i],
        "date": date.strftime("%Y-%m-%d"),
        "month": date.strftime("%Y-%m"),
        "category": cat,
        "product": np.random.choice(products[cat]),
        "quantity": qty,
        "unit_price": unit,
        "revenue": revenue,
    })

df = pd.DataFrame(rows)
df["date"] = pd.to_datetime(df["date"])

os.makedirs("public/data", exist_ok=True)
df.to_csv("public/data/ecommerce_raw.csv", index=False)

# ---- Totals ----
revenue_total = round(float(df["revenue"].sum()), 2)
orders_total = int(len(df))
customers_total = int(df["customer_id"].nunique())
aov = round(revenue_total / orders_total, 2)
ltv = round(revenue_total / customers_total, 2)

orders_per_cust = df.groupby("customer_id").size()
repeat_customers = int((orders_per_cust > 1).sum())
repeat_rate = round(repeat_customers / customers_total * 100, 1)

# Churn: customers whose last order is >90 days before the dataset end
last_order = df.groupby("customer_id")["date"].max()
cutoff = pd.Timestamp(end_date) - pd.Timedelta(days=90)
churned = int((last_order < cutoff).sum())
churn_rate = round(churned / customers_total * 100, 1)

# ---- By month ----
by_month = df.groupby("month").agg(
    revenue=("revenue", "sum"),
    orders=("order_id", "count"),
    customers=("customer_id", "nunique"),
).reset_index().sort_values("month")
by_month["revenue"] = by_month["revenue"].round(2)
by_month["aov"] = (by_month["revenue"] / by_month["orders"]).round(2)

# ---- By category ----
by_category = df.groupby("category").agg(
    revenue=("revenue", "sum"),
    orders=("order_id", "count"),
).reset_index().sort_values("revenue", ascending=False)
by_category["revenue"] = by_category["revenue"].round(2)
by_category["aov"] = (by_category["revenue"] / by_category["orders"]).round(2)

# ---- Top products ----
top_products = df.groupby(["product", "category"]).agg(
    revenue=("revenue", "sum"),
    orders=("order_id", "count"),
).reset_index().sort_values("revenue", ascending=False).head(10)
top_products["revenue"] = top_products["revenue"].round(2)
top_products["aov"] = (top_products["revenue"] / top_products["orders"]).round(2)

# ---- Conversion funnel (derived from purchases upward) ----
purchases = orders_total
checkout = int(purchases / 0.71)
add_to_cart = int(checkout / 0.64)
product_views = int(add_to_cart / 0.43)
sessions = int(product_views / 0.55)
funnel_stages = [
    ("sessions", sessions),
    ("product_views", product_views),
    ("add_to_cart", add_to_cart),
    ("checkout", checkout),
    ("purchase", purchases),
]
funnel = [
    {"stage": name, "count": count, "rate": round(count / sessions * 100, 1)}
    for name, count in funnel_stages
]

# ---- LTV by acquisition cohort (first-purchase month) ----
first_month = df.groupby("customer_id")["month"].min().rename("cohort")
cust_rev = df.groupby("customer_id")["revenue"].sum()
cohort_df = pd.concat([first_month, cust_rev.rename("revenue")], axis=1)
ltv_by_cohort = cohort_df.groupby("cohort").agg(
    customers=("revenue", "size"),
    ltv=("revenue", "mean"),
).reset_index().sort_values("cohort")
ltv_by_cohort["ltv"] = ltv_by_cohort["ltv"].round(2)

totals = {
    "revenue": revenue_total,
    "orders": orders_total,
    "customers": customers_total,
    "aov": aov,
    "ltv": ltv,
    "repeat_rate": repeat_rate,
    "churn_rate": churn_rate,
    "date_range": {"start": "2024-01-01", "end": "2024-12-31"},
}

output = {
    "totals": totals,
    "by_month": by_month.to_dict(orient="records"),
    "by_category": by_category.to_dict(orient="records"),
    "top_products": top_products.to_dict(orient="records"),
    "funnel": funnel,
    "ltv_by_cohort": ltv_by_cohort.to_dict(orient="records"),
}

with open("public/data/ecommerce.json", "w") as f:
    json.dump(output, f, indent=2)

print("E-commerce dataset generado:")
print(f"  Ordenes: {orders_total:,}")
print(f"  Revenue total: ${revenue_total:,.2f}")
print(f"  Clientes: {customers_total:,}")
print(f"  AOV: ${aov} | LTV: ${ltv}")
print(f"  Repeat rate: {repeat_rate}% | Churn: {churn_rate}%")
print("Archivos guardados en public/data/")
