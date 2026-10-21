# Handoff Guide — Google AntiGravity IDE

## Overview
MarketBridge AI has been architected to smoothly export from Google AI Studio into Google AntiGravity IDE, sync with GitHub, and deploy to Vercel and container runtimes.

## Local Execution in AntiGravity IDE
1. Open the exported workspace in AntiGravity IDE.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the full-stack development server on port 3000:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:3000`.

## Python ML Environment (Optional)
```bash
cd services/ml
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Production Verification Checklist
- [x] Landing page with 3 luxury workspace selection cards
- [x] Merchant Workspace CRUD, Inventory ledger, POS checkout & Gemini copilot
- [x] Customer Workspace storefront, recommendations, cart & checkout
- [x] ML Research Lab with K-Means clustering, 90-day churn targets & 9 model configurations (TASC-90)
- [x] Zero console errors and clean TypeScript build compilation
