# 🤝 Team Aqua: Project Ownership

This document outlines the specific file ownership for the Hackathon.

## 🧠 Sahil | ML & Data Engineer
*Primary Goal: Ensure the mathematical model is accurate and easy to explain.*
- `ml/train_model.py`: Linear Regression training logic.
- `ml/predict_model.py`: Inference and weight application.
- `data/create_dataset.py`: Synthetic data generation for Andheri.
- `data/city_data.py`: Ward-specific statistics (population, LPCD).

## 🔗 Taha | Backend Integration Engineer
*Primary Goal: Seamless connection between ML and the Frontend.*
- `main.py`: The primary Flask API gateway.
- `app.py`: Alternative legacy server and model testing.
- `services/weather_service.py`: Weather forecasting logic.
- `utils/season.py`: Seasonal categorizations.
- `requirements.txt`: Environment dependencies.

## 🎨 Affan | Frontend UI & UX Engineer
*Primary Goal: High-fidelity, responsive, and interactive dashboard.*
- `App.tsx`: Main dashboard layout and state management.
- `index.html` & `index.tsx`: Entry points and global styles.
- `services/demandModel.ts`: Client-side simulation and charting logic.

## 🤖 Uves | AI Engineer
*Primary Goal: Implementing Gemini intelligence and reasoning.*
- `services/geminiService.ts`: Prompt engineering and API integration.
- `types.ts`: Shared data structures and interfaces.
- `metadata.json`: Project metadata and permissions.

---
**Hackathon Strategy:**
- Use feature branches (`feature/sahil-ml`, `feature/affan-ui`).
- Main branch should always have a working demo.
- Final 2 hours: Integrated testing and presentation prep.