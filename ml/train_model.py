
import pandas as pd
import numpy as np
import pickle
import os

def train_demand_model():
    csv_path = 'data/andheri_water_data.csv'
    if not os.path.exists(csv_path):
        from data.create_dataset import generate_historical_data
        generate_historical_data()
        
    df = pd.read_csv(csv_path)
    
    # Features: [Temperature, Festival, Industrial_Activity]
    features = df[['temperature', 'festival_active', 'industrial_activity']].values
    
    # Add Intercept
    X = np.hstack([np.ones((features.shape[0], 1)), features])
    y = df['water_demand_mld'].values
    
    # Normal Equation: theta = (X^T * X)^-1 * X^T * y
    weights = np.linalg.inv(X.T @ X) @ X.T @ y
    
    os.makedirs('model', exist_ok=True)
    with open('model/water_demand_model.pkl', 'wb') as f:
        pickle.dump(weights, f)
    
    print(f"--- ML TRAINED --- Weights: {weights}")
    return weights

if __name__ == "__main__":
    train_demand_model()
