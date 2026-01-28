# Aqua Sense AI 💧

Smart water demand forecasting for Andheri, Mumbai. A hybrid project combining **Python Machine Learning** and **Generative AI (Gemini)**.

## 🚀 Local Setup Instructions

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.8+)

### 2. Frontend Setup (Terminal 1)
```bash
# Install Node dependencies
npm install

# IMPORTANT: Create/Update .env file in the project root
# Replace the placeholder with your REAL Gemini API Key
# API_KEY=AIzaSy...

# Start the dev server
npm run dev
```

### 3. Backend & ML Setup (Terminal 2)
```bash
# Install Python dependencies (includes flask-cors)
pip install -r requirements.txt

# Start the Flask API
python main.py
```

## 🛠️ Troubleshooting the "API Connection" Error
If you see a red error bar in the dashboard:
1. **Check the Console**: Press F12 in your browser. Look for red text.
2. **API Key**: Ensure your `.env` file is named exactly `.env` (not `.env.txt`) and your key is valid.
3. **Restart Vite**: After editing `.env`, you MUST stop and restart `npm run dev` for the key to be injected.

## 📈 Team Aqua
- **Sahil**: ML & Data Engineer
- **Taha**: Backend Integration
- **Affan**: Frontend UI & UX
- **Uves**: AI Reasoning & Prompting
