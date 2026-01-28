
import os
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
app.config["WEATHER_API_KEY"] = os.getenv("WEATHER_API_KEY")

def train_model():
    # Synthetic historical data for Andheri (Past 100 days)
    # Features: [Population_Scaled, Avg_Temp, Festival_Impact_Binary]
    # Target: Water Demand in MLD (Millions of Liters per Day)
    
    np.random.seed(42)
    n_days = 365
    
    # Generate synthetic features
    population = np.full(n_days, 1.5) # 1.5M population (fixed for simplicity in training)
    temps = np.random.uniform(25, 38, n_days) # Mumbai temp range
    festivals = np.random.choice([0, 1], size=n_days, p=[0.9, 0.1]) # 10% days are festivals
    
    # Create the target variable with some noise
    # Base: 135L per person * 1.5M = ~202 MLD
    # Temp effect: ~5 MLD per degree above 28
    # Festival effect: ~30 MLD surge
    base_demand = 202.5
    demand = base_demand + (temps - 28) * 5.2 + (festivals * 35) + np.random.normal(0, 5, n_days)
    
    df = pd.DataFrame({
        'population': population,
        'temp': temps,
        'festival': festivals,
        'demand': demand
    })
    
    # Linear Regression using Normal Equation: theta = (X^T * X)^-1 * X^T * y
    X = df[['population', 'temp', 'festival']].values
    # Add intercept
    X = np.hstack([np.ones((X.shape[0], 1)), X])
    y = df['demand'].values
    
    # Solve for coefficients
    theta = np.linalg.inv(X.T @ X) @ X.T @ y
    return theta

# Global variable to store trained coefficients
MODEL_COEFFICIENTS = train_model()

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    # Extract features from request
    # Since it's restricted to Andheri, population is constant 1.5M
    temp = float(data.get('avgMonthlyTemp', 30))
    # Calculate festival binary (1 if any high/med impact festivals exist)
    festivals_list = data.get('festivals', [])
    has_major_festival = 1 if any(f['impactLevel'] in ['high', 'medium'] for f in festivals_list) else 0
    
    # Predict using trained coefficients
    # features: [1 (intercept), population, temp, festival]
    features = np.array([1, 1.5, temp, has_major_festival])
    prediction_mld = np.dot(MODEL_COEFFICIENTS, features)
    
    # Decompose for UI visualization (estimates based on weights)
    intercept, w_pop, w_temp, w_fest = MODEL_COEFFICIENTS
    base_calc = (intercept + w_pop * 1.5) 
    temp_calc = w_temp * temp
    fest_calc = w_fest * has_major_festival
    
    return jsonify({
        "status": "success",
        "total_mld": float(prediction_mld),
        "breakdown": {
            "base_mld": float(base_calc),
            "temp_mld": float(temp_calc),
            "fest_mld": float(fest_calc)
        },
        "coefficients": MODEL_COEFFICIENTS.tolist()
    })

if __name__ == '__main__':
    app.run(port=5000)
