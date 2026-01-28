import numpy as np
import pickle
import os

def get_prediction(temp, festival_active):
    model_path = 'model/water_demand_model.pkl'
    
    # Auto-train if model doesn't exist
    if not os.path.exists(model_path):
        from ml.train_model import train_demand_model
        theta = train_demand_model()
    else:
        with open(model_path, 'rb') as f:
            theta = pickle.load(f)
            
    # features: [1, temp, festival_active]
    features = np.array([1, temp, 1 if festival_active else 0])
    prediction_mld = np.dot(theta, features)
    
    # Decompose for visualization
    base_contribution = theta[0] # Fixed baseline + inherent city factors
    temp_contribution = theta[1] * temp
    fest_contribution = theta[2] * (1 if festival_active else 0)
    
    return {
        "total_mld": float(prediction_mld),
        "breakdown": {
            "base_mld": float(base_contribution),
            "temp_mld": float(temp_contribution),
            "fest_mld": float(fest_contribution)
        }
    }
