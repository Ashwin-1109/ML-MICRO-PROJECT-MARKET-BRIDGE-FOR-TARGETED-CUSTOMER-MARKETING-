# Deployment Guide — MarketBridge AI

## 1. Web Application Deployment (Vercel)
1. Fork or push the repository to GitHub.
2. In Vercel, import the repository with Framework Preset: **Vite**.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variables in Vercel project settings:
   - `GEMINI_API_KEY`: Server-side Gemini API Key
   - `VITE_SUPABASE_URL`: (Optional) Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: (Optional) Supabase publishable key
   - `ML_SERVICE_URL`: (Optional) Optional external Python FastAPI service (In-browser ML engine works out-of-the-box with no token or password needed)

---

## 2. Python ML Microservice Deployment (FastAPI)
The Python ML service in `services/ml/` can be deployed on Cloud Run, Render, or Railway:
```bash
cd services/ml
docker build -t marketbridge-ml .
docker run -p 8000:8000 marketbridge-ml
```
Or with uvicorn directly:
```bash
cd services/ml
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 3. Database Deployment (Supabase PostgreSQL)
1. In your Supabase project SQL Editor, run `supabase/migrations/20260401_init.sql`.
2. Tables, foreign keys, indexes, and Row Level Security isolation policies are provisioned automatically.
3. The local-first IndexedDB database functions immediately in any browser without requiring external database initialization.
