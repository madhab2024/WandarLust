import pandas as pd
import random

# Load CSV
df = pd.read_csv("listings.csv")

# Drop completely empty rows
df = df.dropna(how="all")

# Fill missing values
df["name"] = df["name"].fillna("Beautiful Stay")
df["neighbourhood"] = df["neighbourhood"].fillna("Unknown City")
df["neighbourhood_group"] = df["neighbourhood_group"].fillna("Unknown Country")
df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(1000).astype(int)

# Generate random emails based on host_name
df["email"] = df["host_name"].fillna("host").apply(
    lambda x: f"{str(x).lower().replace(' ', '_')}@example.com"
)

# Generate random image URLs
def random_image():
    return {
        "filename": "random.jpg",
        "url": f"https://picsum.photos/seed/{random.randint(1,10000)}/600/400"
    }

df["image"] = [random_image() for _ in range(len(df))]

# Build description (combine room_type + host)
df["description"] = df.apply(
    lambda row: f"A cozy {row['room_type']} hosted by {row['host_name']}. Located in {row['neighbourhood']}.",
    axis=1
)

# Map to schema
cleaned = []
for _, row in df.iterrows():
    cleaned.append({
        "title": row["name"],
        "description": row["description"],
        "image": row["image"],
        "price": row["price"],
        "location": row["neighbourhood"],
        "country": row["neighbourhood_group"],
        "email": row["email"],
        "reviews": []   # empty for now
    })

# Save as JSON
import json
with open("listings_clean.json", "w") as f:
    json.dump(cleaned, f, indent=2)

print("✅ Cleaned and transformed JSON saved as listings_clean.json")
