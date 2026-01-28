import pandas as pd
import numpy as np
import os

def generate_historical_data():
    np.random.seed(42)
    n_days = 365
    
    # Generate synthetic features for Andheri
    dates = pd.date_range(start='2023-01-01', periods=n_days)
    temps = np.random.uniform(25, 40, n_days) # Mumbai Temp Range
    festivals = np.random.choice([0, 1], size=n_days, p=[0.92, 0.08]) # ~30 festival days/year
    
    # Base Demand = 1.5M people * 135L = 202.5 MLD
    # Demand = Base + (TempEffect * (Temp-28)) + (FestEffect * Festival) + Noise
    demand = 202.5 + (temps - 28) * 4.8 + (festivals * 40.0) + np.random.normal(0, 5, n_days)
    
    df = pd.DataFrame({
        'date': dates,
        'temperature': temps,
        'festival_active': festivals,
        'water_demand_mld': demand
    })
    
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/andheri_water_data.csv', index=False)
    print("Dataset created: data/andheri_water_data.csv")

if __name__ == "__main__":
    generate_historical_data()

