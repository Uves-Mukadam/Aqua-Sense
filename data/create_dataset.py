
import pandas as pd
import numpy as np
import os

def generate_historical_data():
    np.random.seed(42)
    n_days = 730 # 2 years of data for better seasonality
    
    dates = pd.date_range(start='2022-01-01', periods=n_days)
    temps = np.random.uniform(25, 40, n_days) # Mumbai Temp Range
    festivals = np.random.choice([0, 1], size=n_days, p=[0.92, 0.08])
    
    # INDUSTRIAL ACTIVITY: High on weekdays (0.8-1.0), Low on Sundays (0.3-0.5)
    industrial_activity = []
    for d in dates:
        if d.weekday() == 6: # Sunday
            industrial_activity.append(np.random.uniform(0.3, 0.5))
        else:
            industrial_activity.append(np.random.uniform(0.8, 1.0))
    industrial_activity = np.array(industrial_activity)

    # Base Demand = 202.5 MLD
    # Formula: Base + TempEffect + FestEffect + IndustrialEffect + Growth + Noise
    # Industrial weight: +25 MLD at peak activity
    demand = 202.5 + (temps - 28) * 4.8 + (festivals * 40.0) + (industrial_activity * 25.0) + np.random.normal(0, 3, n_days)
    
    df = pd.DataFrame({
        'date': dates,
        'temperature': temps,
        'festival_active': festivals,
        'industrial_activity': industrial_activity,
        'water_demand_mld': demand
    })
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/andheri_water_data.csv', index=False)
    print("Dataset created with Industrial features: data/andheri_water_data.csv")

if __name__ == "__main__":
    generate_historical_data()
