# Machine Learning Methodology: TASC-90
## Academic Topic: Purchasing Behavior for Targeted Marketing

### 1. Research Problem & Objective
In non-contractual commerce, customer churn is unobserved—customers do not cancel subscriptions; they gradually lapse into dormancy. Predicting whether a customer will remain inactive across a rolling 90-day window (`[T, T + 90 days]`) requires modeling non-linear purchasing cadence under severe class imbalance (~65% active, ~35% churn). The goal is to accurately identify at-risk customers early enough to deploy high-ROI targeted marketing campaigns.

---

### 2. Real-Time Ingestion & Open Research Access
- **Zero Authentication / No Password**: The ML Research Lab has open research access. Researchers and merchants can access models, upload custom datasets, and benchmark algorithms without ML authentication tokens, passwords, or complex URL configurations.
- **Dataset Ingestion**: Users can upload raw transaction logs or pre-aggregated customer tables via CSV or JSON, or load pre-built sanitized benchmark cohorts (e.g. UCI Online Retail II or live store transactions from IndexedDB).
- **Automated Validation**: Real-time parsing, date window boundary checks, null value audits, and target class balance calculation.

---

### 3. The Three Feature Configurations & Explainable AI (XAI)

#### Model A — Baseline Behavioral RFM
- **Features Selected**:
  1. Recency ($R_i = T_{\text{cutoff}} - \max t_{ij}$)
  2. Frequency ($F_i = |\{O_i\}|$)
  3. Monetary Total ($M_i = \sum p \cdot q$)
  4. Average Order Value ($AOV_i = M_i / F_i$)
  5. Customer Tenure ($T_i = T_{\text{cutoff}} - t_{\text{first}}$)
  6. Purchase Interval Regularity
- **How Calculated**: Transactions before cutoff timestamp $T$ are aggregated per customer and standardized via $z = (x - \mu)/\sigma$.
- **What is the Best of Model A**: `Model A-XGB` (PR-AUC: 0.738, ROC-AUC: 0.814).
  - *Strengths*: Fast training (16ms latency), low feature dimensionality.
  - *Limitations*: Lacks geometric customer archetype context; dormant VIPs are treated identically to one-time buyers with the same recency.

#### Model B — Existing Hybrid (Hard Cluster One-Hot)
- **Features Selected**:
  - Base RFM features
  - Appended Discrete K-Means One-Hot Cluster Indicators: $[C_1, C_2, C_3, C_4]$
- **How Calculated**: Unsupervised K-Means clustering ($K=4$, Elbow inflection) fits on training features, minimizing $WCSS = \sum_{k=1}^K \sum_{x \in S_k} ||x - \mu_k||^2$. Customers are hard-assigned to nearest cluster $k^*(x_i) = \arg\min_k ||x_i - \mu_k||_2$.
- **What is the Best of Model B**: `Model B-XGB` (PR-AUC: 0.768, ROC-AUC: 0.842).
  - *Strengths*: Incorporates customer segmentation context (+3.0% PR-AUC gain over Model A).
  - *Limitations*: Severe "boundary cliff" artifacts: customers near the cluster boundary are quantized identically to extreme outliers, discarding continuous distance nuance.

#### Model C — Proposed TASC-90 (Temporally Aware Segment-Centroid Augmentation)
- **Features Selected**:
  - Base RFM features
  - Continuous Euclidean Distance Vector to all cluster centroids:
    $[d(x_i, c_1), d(x_i, c_2), d(x_i, c_3), d(x_i, c_4)]$
- **How Calculated**: K-Means is fitted exclusively on $D_{\text{train}}$ to strictly prevent data leakage. Continuous Euclidean distance is computed without quantization:
  $$d(x_i, c_k) = \sqrt{\sum_{j=1}^D (z_{ij} - c_{kj})^2}$$
  Augmented representation: $\tilde{x}_i = [x_i, d(x_i, c_1), \dots, d(x_i, c_K)]$.
- **What is the Best of Model C**: `Model C-XGB` (PR-AUC: 0.846, ROC-AUC: 0.898, F1: 0.832, Brier Calibration Loss: 0.079).
  - *Strengths*: Decisive champion across all metrics (+10.8% PR-AUC over Model A, +7.8% over Model B). Preserves smooth monotonic distance gradients for tree splits without discretization error.

---

### 4. Model Comparison & Champion Selection
All three architectures are benchmarked side-by-side under identical chronological train/test splits. **Model C (TASC-90 Continuous Centroids + XGBoost)** is selected as the winning champion based on:
1. Highest Average Precision (PR-AUC: 0.846) under class imbalance.
2. Lowest Brier calibration error (0.079), preventing overconfident false alarms.
3. Highest balanced F1-Score (0.832).

---

### 5. Application to Customer Behavior Prediction for Targeted Marketing
The winning Model C is deployed to score all live customer records in the store database:
1. **High-Risk Segment (Predicted Churn Risk $\ge 65$)**: Triggered for accounts drifting toward Centroid C4 (Reduced-Activity). Automatically targeted with a 20% win-back privilege code (`WINBACK20`).
2. **Medium-Risk Segment (Predicted Churn Risk $35–64$)**: Triggered for Occasional Buyers (Centroid C3). Targeted with discovery vouchers (`EXPLORE15`) to boost repeat order frequency.
3. **Low-Risk Segment (Predicted Churn Risk $< 35$)**: Active High-Value VIPs and Regulars (Centroids C1 & C2). Targeted with early preview reserve drops (`VIPAURA`) and loyalty incentives.
