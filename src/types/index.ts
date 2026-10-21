// MarketBridge AI - Core Type Definitions & Data Contracts

export type WorkspaceType = 'landing' | 'merchant' | 'customer' | 'lab';

export type UserRole = 'merchant' | 'customer' | 'researcher' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeId?: string;
  avatarUrl?: string;
}

// ---------------------------------------------------------------------------
// Merchant & Store Models
// ---------------------------------------------------------------------------

export interface Store {
  id: string;
  name: string;
  currency: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  sku: string;
  title: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  stockThreshold: number;
  imageUrl: string;
  active: boolean;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InventoryMovementType = 'initial' | 'sale' | 'restock' | 'adjustment' | 'refund' | 'damage';

export interface InventoryMovement {
  id: string;
  storeId: string;
  productId: string;
  productTitle: string;
  movementType: InventoryMovementType;
  quantityDelta: number; // positive or negative
  previousStock: number;
  newStock: number;
  referenceId?: string; // orderId or adjustment note
  notes?: string;
  isDemo?: boolean;
  timestamp: string;
}

export interface Customer {
  id: string;
  storeId: string;
  name: string;
  email: string;
  phone?: string;
  segmentId?: string;
  segmentName?: string;
  recencyDays: number;
  frequency: number;
  monetaryTotal: number;
  averageOrderValue: number;
  riskScore: number; // 0 to 100
  riskBand: 'Low' | 'Medium' | 'High';
  lastPurchaseDate: string;
  firstPurchaseDate: string;
  preferredCategories: string[];
  marketingConsent: boolean;
  isDemo?: boolean;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  storeId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'demo_cash' | 'demo_card' | 'demo_online';
  notes?: string;
  items: OrderItem[];
  isDemo?: boolean;
  orderedAt: string;
}

export interface CustomerEvent {
  id: string;
  storeId: string;
  customerId: string;
  eventType: 'view_product' | 'add_to_cart' | 'checkout_start' | 'purchase' | 'redeem_offer';
  productId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Marketing & Campaigns
// ---------------------------------------------------------------------------

export type CampaignObjective = 'winback_churn' | 'excess_inventory' | 'loyalty_reward' | 'cross_sell';

export interface Campaign {
  id: string;
  storeId: string;
  title: string;
  objective: CampaignObjective;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetSegment?: string;
  targetRiskBand?: 'All' | 'High' | 'Medium' | 'Low';
  targetProductIds: string[];
  discountPercent: number;
  promoCode: string;
  messageDraft: string;
  channel: 'in_app' | 'email_draft' | 'sms_draft';
  targetCount: number;
  redemptionsCount: number;
  revenueGenerated: number;
  isDemo?: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface OfferRedemption {
  id: string;
  campaignId: string;
  customerId: string;
  orderId: string;
  redeemedAt: string;
  discountAmount: number;
}

// ---------------------------------------------------------------------------
// Machine Learning Research Lab Contracts
// ---------------------------------------------------------------------------

export interface MLDataset {
  id: string;
  name: string;
  filename: string;
  recordCount: number;
  customerCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  features: string[];
  missingCount: number;
  isPreprocessed: boolean;
  uploadedAt: string;
  isDemo: boolean;
}

export interface BehavioralFeatureVector {
  customerId: string;
  recency: number; // days since last transaction relative to cutoff
  frequency: number; // total count of transactions in observation period
  monetary: number; // total sum spend
  tenure: number; // days between first purchase and cutoff
  aov: number; // average order value
  purchaseIntervalMean: number; // avg days between orders
  purchaseIntervalStd: number; // regularity of purchase
  categoryDiversity: number; // count of distinct categories
  monthlyFrequencyTrend: number; // trend in last 60d vs first 60d
  clusterId?: number; // for Model B
  centroidDistances?: number[]; // for Model C (TASC-90 continuous Euclidean distances)
  targetChurn90: number; // 1 = churned (no purchase in next 90 days), 0 = active
}

export interface ClusterProfile {
  id: number;
  name: string;
  count: number;
  percentage: number;
  centroid: {
    recency: number;
    frequency: number;
    monetary: number;
    aov: number;
    tenure: number;
  };
  description: string;
  actionRecommendation: string;
}

export type FeatureConfiguration = 'Model_A' | 'Model_B' | 'Model_C';
// Model A = Baseline (Behavioral RFM features only)
// Model B = Existing Hybrid (RFM + K-Means hard cluster label)
// Model C = Proposed TASC-90 (RFM + continuous distances to learned cluster centroids)

export type ClassifierType = 'Logistic_Regression' | 'Random_Forest' | 'XGBoost';

export type ModelConfigKey =
  | 'A-LR'
  | 'A-RF'
  | 'A-XGB'
  | 'B-LR'
  | 'B-RF'
  | 'B-XGB'
  | 'C-LR'
  | 'C-RF'
  | 'C-XGB';

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number; // Average Precision
  brierScore: number; // Calibration loss
  trainingTimeMs: number;
  inferenceTimeMs: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  rocCurve: { fpr: number; tpr: number }[];
  prCurve: { recall: number; precision: number }[];
  featureImportance: { feature: string; importance: number }[];
  calibrationCurve: { meanPredictedProb: number; trueFraction: number }[];
}

export interface MLExperiment {
  id: string;
  configKey: ModelConfigKey;
  featureConfig: FeatureConfiguration;
  classifier: ClassifierType;
  datasetId: string;
  splitRatio: { train: number; val: number; test: number };
  randomSeed: number;
  hyperparameters: Record<string, any>;
  status: 'idle' | 'running' | 'completed' | 'failed';
  metrics?: ModelMetrics;
  createdAt: string;
  completedAt?: string;
}

export interface MLModelVersion {
  id: string;
  version: string;
  experimentId: string;
  configKey: ModelConfigKey;
  name: string;
  description: string;
  isDeployedToProduction: boolean;
  metrics: ModelMetrics;
  createdAt: string;
  approvedBy?: string;
}

export interface MLPrediction {
  id: string;
  modelVersionId: string;
  configKey: ModelConfigKey;
  customerId: string;
  rawProbability: number;
  calibratedProbability: number;
  riskScore: number; // 0 to 100
  riskBand: 'Low' | 'Medium' | 'High';
  contributingFactors: { factor: string; direction: 'increases_risk' | 'decreases_risk'; impact: number }[];
  predictedAt: string;
}

// ---------------------------------------------------------------------------
// Audit & Settings
// ---------------------------------------------------------------------------

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  soundEnabled: boolean;
  notifications: boolean;
  isDemoMode: boolean;
}
