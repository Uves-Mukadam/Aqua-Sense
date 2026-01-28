
import pandas as pd
import numpy as np
import pickle
import os

def train_demand_model():
    # 1. Load data
    csv_path = 'data/andheri_water_data.csv'
    if not os.path.exists(csv_path):
        from data.create_dataset import generate_historical_data
        generate_historical_data()
        
    df = pd.read_csv(csv_path)
    
    # 2. Prepare features (X) and target (y)
    # Target: demand = w0 + w1*temp + w2*festival
    X = df[['temperature', 'festival_active']].values
    # Add intercept column
    X = np.hstack([np.ones((X.shape[0], 1)), X])
    y = df['water_demand_mld'].values
    
    # 3. Solve using Normal Equation: theta = (X^T * X)^-1 * X^T * y
    theta = np.linalg.inv(X.T @ X) @ X.T @ y
    
    # 4. Save model
    os.makedirs('model', exist_ok=True)
    with open('model/water_demand_model.pkl', 'wb') as f:
        pickle.dump(theta, f)
    
    print(f"Model trained. Coefficients: Intercept={theta[0]:.2f}, TempWeight={theta[1]:.2f}, FestWeight={theta[2]:.2f}")
    return theta

if __name__ == "__main__":
    train_demand_model()
