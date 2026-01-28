from flask import Flask, request, jsonify
from flask_cors import CORS
from ml.predict_model import get_prediction
from data.city_data import CITY_DATA
import os

app = Flask(__name__)
# Enable CORS so the React app can communicate with this Python server
CORS(app)

@app.route('/api/predict', methods=['POST'])
def handle_prediction():
    try:
        data = request.json
        print(f"Backend received request: {data}")
        
        temp = float(data.get('avgMonthlyTemp', 30))
        festivals = data.get('festivals', [])
        
        # Check for festival impact
        is_festival = any(f.get('impactLevel') in ['high', 'medium'] for f in festivals)
        
        # Calculate prediction using Sahil's ML weights
        result = get_prediction(temp, is_festival)
        
        return jsonify({
            "status": "success",
            "city": "Andheri",
            "population": CITY_DATA["Andheri"]["population"],
            **result
        })
    except Exception as e:
        print(f"Error in prediction handler: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    # Automatically trigger training if Sahil's model file is missing
    if not os.path.exists('model/water_demand_model.pkl'):
        print("Initializing model... Running Sahil's trainer.")
        from ml.train_model import train_demand_model
        train_demand_model()
        
    print("SERVER ONLINE: http://localhost:5000")
    app.run(port=5000, debug=True)
