import pandas as pd
import numpy as np
import json
import os

np.random.seed(23)

# Madrid neighborhoods with a base price multiplier and demand (occupancy) profile
neighborhoods = {
    "Centro": {"price": 1.35, "occ": 0.82},
    "Salamanca": {"price": 1.55, "occ": 0.74},
    "Chamberí": {"price": 1.25, "occ": 0.78},
    "Malasaña": {"price": 1.15, "occ": 0.85},
    "Retiro": {"price": 1.3, "occ": 0.7},
    "Chueca": {"price": 1.2, "occ": 0.83},
    "La Latina": {"price": 1.1, "occ": 0.8},
    "Lavapiés": {"price": 0.9, "occ": 0.76},
}
room_types = {
    "Entire home/apt": {"weight": 0.62, "price": 1.0, "occ": 1.0},
    "Private room": {"weight": 0.33, "price": 0.55, "occ": 0.95},
    "Shared room": {"weight": 0.05, "price": 0.3, "occ": 0.88},
}

N = 2200
BASE_PRICE = 85  # € per night baseline

nb_names = list(neighborhoods.keys())
rt_names = list(room_types.keys())
rt_weights = np.array([room_types[r]["weight"] for r in rt_names])
rt_weights = rt_weights / rt_weights.sum()

rows = []
for i in range(N):
    nb = np.random.choice(nb_names)
    rt = np.random.choice(rt_names, p=rt_weights)
    nb_cfg = neighborhoods[nb]
    rt_cfg = room_types[rt]

    price = round(BASE_PRICE * nb_cfg["price"] * rt_cfg["price"] * np.random.uniform(0.7, 1.5), 0)
    occ = float(np.clip(nb_cfg["occ"] * rt_cfg["occ"] * np.random.uniform(0.75, 1.12), 0.2, 0.98))
    occ = round(occ, 3)
    nights_month = int(round(occ * 30))
    est_revenue = round(price * nights_month, 2)
    rating = round(float(np.clip(np.random.normal(4.6, 0.3), 3.4, 5.0)), 2)
    reviews = int(np.random.gamma(shape=2.0, scale=35))
    superhost = bool(rating >= 4.7 and reviews > 40 and np.random.rand() > 0.4)

    rows.append({
        "listing_id": f"lst_{i:04d}",
        "name": f"{rt.split('/')[0]} en {nb}",
        "neighborhood": nb,
        "room_type": rt,
        "price": price,
        "occupancy": occ,
        "nights_month": nights_month,
        "est_revenue": est_revenue,
        "rating": rating,
        "reviews": reviews,
        "superhost": superhost,
    })

df = pd.DataFrame(rows)
os.makedirs("public/data", exist_ok=True)
df.to_csv("public/data/real_estate_raw.csv", index=False)

# ---- Totals ----
totals = {
    "listings": int(len(df)),
    "avg_price": round(float(df["price"].mean()), 2),
    "avg_occupancy": round(float(df["occupancy"].mean()) * 100, 1),
    "est_monthly_revenue": round(float(df["est_revenue"].sum()), 2),
    "avg_rating": round(float(df["rating"].mean()), 2),
    "superhost_rate": round(float(df["superhost"].mean()) * 100, 1),
    "neighborhoods": int(df["neighborhood"].nunique()),
}

# ---- By neighborhood ----
by_neighborhood = df.groupby("neighborhood").agg(
    listings=("listing_id", "count"),
    avg_price=("price", "mean"),
    occupancy=("occupancy", "mean"),
    est_revenue=("est_revenue", "sum"),
    avg_rating=("rating", "mean"),
).reset_index()
by_neighborhood["avg_price"] = by_neighborhood["avg_price"].round(0)
by_neighborhood["occupancy"] = (by_neighborhood["occupancy"] * 100).round(1)
by_neighborhood["est_revenue"] = by_neighborhood["est_revenue"].round(2)
by_neighborhood["avg_rating"] = by_neighborhood["avg_rating"].round(2)
by_neighborhood = by_neighborhood.sort_values("est_revenue", ascending=False)

# ---- By room type ----
by_room_type = df.groupby("room_type").agg(
    listings=("listing_id", "count"),
    avg_price=("price", "mean"),
    occupancy=("occupancy", "mean"),
).reset_index()
by_room_type["avg_price"] = by_room_type["avg_price"].round(0)
by_room_type["occupancy"] = (by_room_type["occupancy"] * 100).round(1)
by_room_type = by_room_type.sort_values("listings", ascending=False)

# ---- Scatter sample: price vs occupancy (downsampled for the chart) ----
sample = df.sample(n=220, random_state=1)
scatter = [
    {
        "price": float(r.price),
        "occupancy": round(float(r.occupancy) * 100, 1),
        "neighborhood": r.neighborhood,
        "room_type": r.room_type,
    }
    for r in sample.itertuples()
]

# ---- Top listings by estimated revenue ----
top_listings = df.sort_values("est_revenue", ascending=False).head(10)[
    ["name", "neighborhood", "room_type", "price", "occupancy", "est_revenue", "rating"]
].copy()
top_listings["occupancy"] = (top_listings["occupancy"] * 100).round(1)

output = {
    "totals": totals,
    "by_neighborhood": by_neighborhood.to_dict(orient="records"),
    "by_room_type": by_room_type.to_dict(orient="records"),
    "scatter": scatter,
    "top_listings": top_listings.to_dict(orient="records"),
}

with open("public/data/real_estate.json", "w") as f:
    json.dump(output, f, indent=2)

print("Real estate dataset generado:")
print(f"  Listings: {totals['listings']:,} en {totals['neighborhoods']} zonas")
print(f"  Precio medio: €{totals['avg_price']}/noche | Ocupación media: {totals['avg_occupancy']}%")
print(f"  Revenue mensual estimado: €{totals['est_monthly_revenue']:,.2f}")
print(f"  Rating medio: {totals['avg_rating']} | Superhosts: {totals['superhost_rate']}%")
print("Archivos guardados en public/data/")
