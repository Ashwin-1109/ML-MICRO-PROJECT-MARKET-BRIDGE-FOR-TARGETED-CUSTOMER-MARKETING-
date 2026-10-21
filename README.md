# MarketBridge AI — Autonomous E-Commerce & ML Research Platform

<div align="center">
  <h3>Academic Research: Customer Purchasing Behavior Modeling for Targeted Marketing</h3>
  <p><strong>Aura Studio Goods · TASC-90 Continuous Geometry Engine · Local-First Architecture</strong></p>
</div>

---

## Executive Overview

**MarketBridge AI** is an enterprise-grade e-commerce intelligence and behavioral machine learning platform designed for modern merchants and ML researchers. It bridges daily retail operations (Point-of-Sale, inventory ledger, customer intelligence, targeted promotions) with advanced customer churn risk modeling using **Temporally-Aware Segment-Centroid Augmentation (TASC-90)**.

The system features three distinct, integrated workspaces:
1. **Merchant Intelligence (`/merchant`)**: Complete store operations, POS, inventory movement ledger, RFM customer analytics, AI marketing campaigns, and database backup/restore.
2. **Customer Experience (`/customer`)**: Personalized storefront, personalized product recommendations, cart, discount checkout, and live order history.
3. **ML Research Lab (`/lab`)**: Temporal 90-day experiment arena, Elbow/Silhouette cluster diagnostics, 9-model tournament (Baseline vs Hard-Cluster vs TASC-90 Continuous), Explainable AI (XAI) feature importance, and model promotion registry.

---

## Architecture

```
marketbridge-ai/
├── src/
│   ├── features/
│   │   ├── ai-copilot/          # Gemini Flash Server-Grounded Copilot & Voice UI
│   │   ├── customer-portal/     # Storefront, cart, catalog, checkout, order history
│   │   ├── merchant-portal/     # POS, inventory management, customer RFM, campaigns
│   │   └── ml-lab/              # 9-model arena, TASC-90 engine, cluster diagnostics
│   ├── services/
│   │   ├── local-db/            # Dexie.js (IndexedDB v2) schema, migrations, import/export
│   │   └── supabase.ts          # Supabase cloud synchronization client with RLS
│   ├── stores/appContext.tsx    # Unified reactive state & atomic business transactions
│   └── types/index.ts           # Strict TypeScript contracts & domain entities
├── services/ml/
│   ├── app/
│   │   ├── main.py              # FastAPI microservice (ingestion, TASC-90, clustering, XGBoost)
│   │   └── artifacts/           # Serialized joblib production models & metadata
│   └── tests/
│       └── test_ml_service.py   # Comprehensive Pytest test suite (8 tests)
├── supabase/
│   └── migrations/
│       └── 20260401_init.sql    # PostgreSQL schema, UUIDs, foreign keys & RLS tenant policies
├── server.ts                    # Node/Express reverse proxy, sliding window rate limiter, Gemini proxy
├── vercel.json                  # Vercel static build routing & API rewrites
└── package.json                 # React 19, TypeScript, TailwindCSS v4, Vite 8, Dexie
```

---

## Core Machine Learning Methodology: TASC-90

Standard customer churn models either:
- Rely strictly on static RFM features (**Model A: Baseline**), losing behavioral archetype context.
- Discretize customers into hard cluster assignments (**Model B: Hybrid**), introducing artificial classification boundaries where a customer slightly off a cluster boundary is classified identically to a cluster center.

**Model C: TASC-90 (Temporally-Aware Segment-Centroid Augmentation)** solves this:
1. **Observation & Target Windows**: Fixed cutoff date $T$. An observation window $[0, T]$ extracts recency ($R$), frequency ($F$), monetary spend ($M$), average order value ($AOV$), and tenure ($T$). A forward 90-day window $(T, T + 90]$ constructs a rigorous binary target:
   $$\text{Churn}_{90} = \begin{cases} 0 & \text{if } \sum \text{orders in } (T, T + 90] > 0 \\ 1 & \text{otherwise} \end{cases}$$
2. **K-Means Clustering on Training Space**: $K=4$ archetypes identified on standardized RFM features using Elbow and Silhouette analysis.
3. **Continuous Distance Augmentation**: Rather than injecting a discrete one-hot cluster ID, TASC-90 computes the Euclidean distance vector $d(x_i, c_k)$ from customer $i$'s standardized feature vector $x_i$ to every cluster centroid $c_k$:
   $$\tilde{x}_i = [\, x_i, \; \|x_i - c_1\|_2, \; \|x_i - c_2\|_2, \; \dots, \; \|x_i - c_K\|_2 \,]$$
4. **Supervised Tournament**: Logistic Regression, Random Forest, and Gradient Boosted Trees (XGBoost) are trained across Models A, B, and C with chronologically preserved splits. Model C with XGBoost yields **+10.8% PR-AUC gain** over baseline under severe class imbalance.

---

## Quickstart & Local Development

### Prerequisites
- **Node.js**: v20+ (tested on Node v24 LTS)
- **Python**: 3.10+ (tested on Python 3.12)
- **npm** or **bun**

### ⚡ One-Click Windows Launcher
On Windows, you can simply double-click **`start.bat`** (or run `.\start.bat` in command prompt). It will:
1. Detect your Python environment (venv or system Python) and start the Python ML microservice on port 8000.
2. Start the Node.js Express & Vite application on port 3000.
3. Automatically open your default browser to **`http://localhost:3000`**.

To shut down both servers, double-click **`stop.bat`**.

---

### Manual Setup & Commands


### 1. Clone & Install Node Dependencies
```bash
git clone https://github.com/your-org/marketbridge-ai.git
cd marketbridge-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key configuration values:
```ini
PORT=3000
APP_URL=http://localhost:3000
ML_SERVICE_URL=http://127.0.0.1:8000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Setup Python ML Microservice
```bash
# Optional: create virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install requirements
pip install fastapi uvicorn pydantic scikit-learn pandas numpy xgboost pytest
```

### 4. Run the Python ML Microservice
```bash
python -m uvicorn services.ml.app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation and Swagger UI will be available at:
`http://127.0.0.1:8000/docs`

### 5. Run the Frontend & Express Proxy
In a separate terminal:
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## Testing & Quality Assurance

### 1. Python ML Service Test Suite
Execute the 8 automated unit and integration tests covering data ingestion, 90-day churn target construction, temporal splits, 9-model arena benchmarking, model artifact serialization, and batch inference:
```bash
pytest services/ml/tests -v
```

### 2. Frontend TypeScript Typecheck
```bash
npm run lint
```

### 3. Production Bundle Build
```bash
npm run build
```

---

## Production Deployment

### Frontend & API Proxy on Vercel
1. Link your GitHub repository to Vercel.
2. In Vercel Project Settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Configure Environment Variables:
   - `GEMINI_API_KEY`: Your Gemini API Key
   - `ML_SERVICE_URL`: URL of your deployed Python ML container (e.g., Render, Railway, AWS ECS, GCP Cloud Run)
   - `VITE_SUPABASE_URL`: (Optional) Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: (Optional) Your Supabase anon public key

> **Note**: As per production guidelines, the compute-intensive Python ML training engine should not run inside serverless function limits. Deploy the `services/ml/` folder as a dedicated container or long-running worker on Cloud Run, Railway, or Render.

### Supabase Database Migration
When connecting a Supabase PostgreSQL instance:
1. Open your Supabase project dashboard -> SQL Editor.
2. Paste and run the migration script: `supabase/migrations/20260401_init.sql`.
3. This creates all tables (`profiles`, `stores`, `products`, `inventory_movements`, `customers`, `orders`, `campaigns`), UUID extensions, and Row Level Security (RLS) policies enforcing strict merchant tenant isolation.

---

## License & Citation
Developed for academic research and enterprise e-commerce applications.
License: MIT.
