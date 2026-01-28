
from flask import Flask, request, jsonify
from ml.predict_model import get_prediction
from data.city_data import CITY_DATA
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
app.config["WEATHER_API_KEY"] = os.getenv("WEATHER_API_KEY")


@app.route('/api/predict', methods=['POST'])
def handle_prediction():
    # 1. Received Gemini Context
    data = request.json
    temp = float(data.get('avgMonthlyTemp', 30))
    festivals = data.get('festivals', [])
    
    # 2. Logic Check: Major Festivals active?
    is_festival = any(f['impactLevel'] in ['high', 'medium'] for f in festivals)
    
    # 3. Run Sahil's Prediction Model
    result = get_prediction(temp, is_festival)
    
    # 4. Success Response
    return jsonify({
        "status": "success",
        "city": "Andheri",
        "population": CITY_DATA["Andheri"]["population"],
        **result
    })

if __name__ == '__main__':
    if not os.path.exists('model/water_demand_model.pkl'):
        from ml.train_model import train_demand_model
        train_demand_model()
        
    print("TAHA'S BACKEND SERVER: Running on http://localhost:5000")
    app.run(port=5000)
