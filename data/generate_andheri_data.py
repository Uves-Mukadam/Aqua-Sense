import pandas as pd
import numpy as np

np.random.seed(42)

days = 365
data = []

for day in range(days):
    month = (day % 12) + 1

    # Temperature logic (Mumbai climate)
    if month in [3, 4, 5]:       # Summer
        temperature = np.random.randint(30, 38)
    elif month in [6, 7, 8, 9]:  # Monsoon
        temperature = np.random.randint(25, 32)
    else:                        # Winter
        temperature = np.random.randint(22, 28)

    # Rainfall logic
    rainfall = np.random.randint(0, 5)
    if month in [6, 7, 8, 9]:
        rainfall = np.random.randint(10, 40)

    festival = np.random.choice([0, 1], p=[0.9, 0.1])

    population = 900000 + day * 10  # gradual growth

    # Water demand logic (MLD)
    water_demand = (
        350
        + (temperature * 2.8)
        - (rainfall * 1.1)
        + (festival * 30)
        + ((population - 900000) * 0.002)
    )

    data.append([
        temperature,
        rainfall,
        month,
        festival,
        population,
        round(water_demand, 2)
    ])

df = pd.DataFrame(data, columns=[
    "temperature",
    "rainfall",
    "month",
    "festival",
    "population",
    "water_demand"
])

df.to_csv("data/andheri_water_data.csv", index=False)

print("Synthetic Andheri water data generated successfully!")
