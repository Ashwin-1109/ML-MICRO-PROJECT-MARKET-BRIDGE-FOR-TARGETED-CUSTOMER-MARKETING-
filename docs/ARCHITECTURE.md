# MarketBridge AI — Architecture Overview

## 1. System Vision
MarketBridge AI bridges commerce operations with empirical machine learning research. It provides three unified workspaces backed by a single local-first IndexedDB database with Supabase PostgreSQL cloud sync readiness.

1. **Merchant Workspace**: Inventory management, product CRUD, POS transaction processing, customer RFM intelligence, K-Means behavioral segmentation, 90-day churn mitigation, AI marketing studio, and Gemini copilot.
2. **Customer Workspace**: Curated luxury storefront, catalogue search, transparent content-based recommendations, coupon application, and shopping assistant.
3. **ML Research Lab**: Dataset studio (UCI Online Retail II cohort extract), deterministic preprocessing, 90-day binary churn target construction, K-Means elbow/silhouette diagnostics, 9-model benchmark arena (A-LR through C-XGB / TASC-90), What-If prediction simulator, and model registry.

---

## 2. Directory Layout
```text
marketbridge-ai/
├── src/
│   ├── components/navigation/TopBar.tsx   # Strict 1-row, 3-zone top navigation
│   ├── features/ml-lab/engine/            # Mathematical ML engine (K-Means, TASC-90, RF, XGB, PR-AUC)
│   ├── pages/
│   │   ├── landing/                       # 3 luxury workspace selector cards
│   │   ├── merchant/                      # Merchant operations, POS, Churn Risk & Copilot
│   │   ├── customer/                      # Storefront, cart, checkout & AI concierge
│   │   └── lab/                           # Scientific ML lab, benchmarking & simulator
│   ├── services/
│   │   └── local-db/                      # Dexie.js IndexedDB schema, seeds & persistence
│   ├── stores/appContext.tsx              # Unified application state & reactivity
│   ├── types/index.ts                     # TypeScript data models & contracts
│   ├── App.tsx                            # Root application router
│   ├── index.css                          # Design tokens, fonts & glassmorphism
│   └── main.tsx                           # React 19 entry point
├── services/ml/
│   ├── app/main.py                        # Python FastAPI ML microservice
│   ├── requirements.txt                   # FastAPI, scikit-learn, XGBoost
│   └── Dockerfile                         # Container specification
├── server.ts                              # Express full-stack server & Gemini API endpoints
├── supabase/migrations/                   # PostgreSQL tables & RLS security policies
└── docs/                                  # Comprehensive architecture, data, and ML guides
```

---

## 3. Communication Patterns
- **Database**: Local-first IndexedDB via `Dexie.js`. Changes to catalog, stock, and orders persist across refreshes without requiring external database initialization.
- **AI Endpoints**: Server-side proxy in `server.ts` calling `@google/genai` with `gemini-3.8-flash`. API keys are accessed on the server via `process.env.GEMINI_API_KEY`.
- **Python ML Service**: Independently containerized in `services/ml/` for scalable cloud training. For local prototyping, the in-browser TypeScript engine performs mathematically identical computations.
