
import numpy as np
import pickle
import os

"""
LEARNING OBJECTIVE: Inference
Inference is just taking the 'Weights' we learned during training 
and applying them to a new day's weather and events.
"""

def get_prediction(temp_input, is_festival):
    model_path = 'model/water_demand_model.pkl'
    
    # 1. Load the learned weights
    if not os.path.exists(model_path):
        from ml.train_model import train_demand_model
        weights = train_demand_model()
    else:
        with open(model_path, 'rb') as f:
            weights = pickle.load(f)
            
    # 2. Apply the Weights (The Math)
    # weights[0] = Baseline
    # weights[1] = Temperature Multiplier
    # weights[2] = Festival Multiplier
    
    base_mld = weights[0]
    heat_impact_mld = weights[1] * temp_input
    festival_impact_mld = weights[2] * (1 if is_festival else 0)
    
    # Total = Base + HeatEffect + FestivalEffect
    total_prediction = base_mld + heat_impact_mld + festival_impact_mld
    
    return {
        "total_mld": float(total_prediction),
        "breakdown": {
            "base_mld": float(base_mld),
            "temp_mld": float(heat_impact_mld),
            "fest_mld": float(festival_impact_mld)
        }
    }
