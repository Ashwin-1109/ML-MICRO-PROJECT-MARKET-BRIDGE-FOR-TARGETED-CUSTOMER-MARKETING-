import Dexie, { type Table } from 'dexie';
import type {
  Product,
  Customer,
  Order,
  OrderItem,
  InventoryMovement,
  Campaign,
  MLDataset,
  MLExperiment,
  MLModelVersion,
  MLPrediction,
  AuditEvent,
  Store,
  BehavioralFeatureVector,
  ClusterProfile,
} from '../../types';

export class MarketBridgeDB extends Dexie {
  stores!: Table<Store, string>;
  products!: Table<Product, string>;
  inventory_movements!: Table<InventoryMovement, string>;
  customers!: Table<Customer, string>;
  orders!: Table<Order, string>;
  order_items!: Table<OrderItem, string>;
  campaigns!: Table<Campaign, string>;
  ml_datasets!: Table<MLDataset, string>;
  ml_experiments!: Table<MLExperiment, string>;
  ml_model_versions!: Table<MLModelVersion, string>;
  ml_predictions!: Table<MLPrediction, string>;
  audit_events!: Table<AuditEvent, string>;

  constructor() {
    super('MarketBridgeAIDB');
    this.version(1).stores({
      stores: 'id, ownerId',
      products: 'id, storeId, sku, category, active',
      inventory_movements: 'id, storeId, productId, movementType, timestamp',
      customers: 'id, storeId, email, segmentId, riskBand',
      orders: 'id, storeId, customerId, status, orderedAt',
      order_items: 'id, orderId, productId',
      campaigns: 'id, storeId, status, objective',
      ml_datasets: 'id, filename, uploadedAt',
      ml_experiments: 'id, configKey, status, createdAt',
      ml_model_versions: 'id, version, configKey, isDeployedToProduction',
      ml_predictions: 'id, modelVersionId, customerId, riskBand',
      audit_events: 'id, timestamp, entityType',
    });

    this.version(2).stores({
      stores: 'id, ownerId',
      products: 'id, storeId, sku, category, active, isDemo',
      inventory_movements: 'id, storeId, productId, movementType, timestamp, isDemo',
      customers: 'id, storeId, email, segmentId, riskBand, isDemo',
      orders: 'id, storeId, customerId, status, orderedAt, isDemo',
      order_items: 'id, orderId, productId',
      campaigns: 'id, storeId, status, objective, isDemo',
      ml_datasets: 'id, filename, uploadedAt',
      ml_experiments: 'id, configKey, status, createdAt',
      ml_model_versions: 'id, version, configKey, isDeployedToProduction',
      ml_predictions: 'id, modelVersionId, customerId, riskBand',
      audit_events: 'id, timestamp, entityType',
    }).upgrade(async (tx) => {
      await tx.table('products').toCollection().modify((p) => {
        if (p.isDemo === undefined) p.isDemo = true;
      });
      await tx.table('customers').toCollection().modify((c) => {
        if (c.isDemo === undefined) c.isDemo = true;
      });
      await tx.table('orders').toCollection().modify((o) => {
        if (o.isDemo === undefined) o.isDemo = true;
      });
      await tx.table('campaigns').toCollection().modify((camp) => {
        if (camp.isDemo === undefined) camp.isDemo = true;
      });
    });
  }
}

export const db = new MarketBridgeDB();

// Default demo store configuration
export const DEFAULT_STORE: Store = {
  id: 'store_aura_001',
  name: 'Aura Studio Goods',
  currency: 'USD',
  description: 'Design-forward studio equipment, home objects, and premium daily goods.',
  ownerId: 'merchant_admin_01',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-04-01T00:00:00Z',
};

// Initial realistic product catalogue
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    storeId: 'store_aura_001',
    sku: 'AUR-SND-01',
    title: 'Aura Studio Reference Headphones',
    description: 'Bespoke closed-back planar magnetic monitors with memory foam ear cushions and braided Kevlar cable.',
    category: 'Audio',
    price: 349.0,
    cost: 165.0,
    stock: 24,
    stockThreshold: 8,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-04-01T12:00:00Z',
  },
  {
    id: 'prod_002',
    storeId: 'store_aura_001',
    sku: 'AUR-ESP-02',
    title: 'Precision Espresso Extraction Kit',
    description: 'Machined 58mm stainless steel portafilter, calibrated spring tamper, and walnut distribution tool.',
    category: 'Kitchen & Coffee',
    price: 185.0,
    cost: 72.0,
    stock: 14,
    stockThreshold: 6,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: '2026-01-12T14:30:00Z',
    updatedAt: '2026-04-02T09:15:00Z',
  },
  {
    id: 'prod_003',
    storeId: 'store_aura_001',
    sku: 'AUR-BAG-03',
    title: 'Full-Grain Leather Weekender Duffel',
    description: 'Hand-finished Tuscan vegetable-tanned leather duffel with antique brass hardware and waterproof shoe vault.',
    category: 'Travel & Leather',
    price: 420.0,
    cost: 195.0,
    stock: 5, // Low stock alert!
    stockThreshold: 8,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: '2026-01-15T11:00:00Z',
    updatedAt: '2026-04-03T16:40:00Z',
  },
  {
    id: 'prod_004',
    storeId: 'store_aura_001',
    sku: 'AUR-KBD-04',
    title: 'TKL Anodized Aluminum Mechanical Keyboard',
    description: 'Gasket-mounted hot-swap keyboard with hand-lubed linear switches and double-shot PBT keycaps.',
    category: 'Desk & Tech',
    price: 260.0,
    cost: 110.0,
    stock: 48, // Excess inventory candidate!
    stockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: '2026-01-18T08:20:00Z',
    updatedAt: '2026-04-04T10:00:00Z',
  },
  {
    id: 'prod_005',
    storeId: 'store_aura_001',
    sku: 'AUR-LMP-05',
    title: 'Architectural Ambient Brass Task Lamp',
    description: 'Counterbalanced 2700K warm LED cantilever desk lamp with stepless optical dimming dial.',
    category: 'Lighting',
    price: 215.0,
    cost: 88.0,
    stock: 12,
    stockThreshold: 5,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: '2026-01-20T13:45:00Z',
    updatedAt: '2026-04-05T14:10:00Z',
  },
  {
    id: 'prod_006',
    storeId: 'store_aura_001',
    sku: 'AUR-BOT-06',
    title: 'Smoked Cedar & Hinoki Botanical Diffuser',
    description: 'Cold-distilled organic botanical oils with natural black rattan reeds in hand-blown amber fluted glass.',
    category: 'Home & Fragrance',
    price: 68.0,
    cost: 22.0,
    stock: 62,
    stockThreshold: 15,
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: '2026-01-22T09:00:00Z',
    updatedAt: '2026-04-06T11:20:00Z',
  },
  {
    id: 'prod_007',
    storeId: 'store_aura_001',
    sku: 'AUR-VES-07',
    title: 'Vacuum Insulated Ceramic Tumbler (16oz)',
    description: 'True-taste ceramic interior coating with double-wall copper insulation. 24-hour cold retention.',
    category: 'Kitchen & Coffee',
    price: 44.0,
    cost: 16.0,
    stock: 36,
    stockThreshold: 10,
    imageUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: '2026-01-25T15:10:00Z',
    updatedAt: '2026-04-07T08:30:00Z',
  },
  {
    id: 'prod_008',
    storeId: 'store_aura_001',
    sku: 'AUR-KNT-08',
    title: 'Merino Wool Minimalist Crewneck Sweater',
    description: 'Extra-fine 19.5 micron Australian Merino wool knit in a seamless 3D contour silhouette.',
    category: 'Apparel',
    price: 195.0,
    cost: 82.0,
    stock: 19,
    stockThreshold: 8,
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80',
    active: true,
    createdAt: '2026-01-28T12:00:00Z',
    updatedAt: '2026-04-08T17:00:00Z',
  },
];

// Initial realistic customer database with observed purchase histories
export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_001',
    storeId: 'store_aura_001',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+1 (555) 349-8812',
    segmentId: 'seg_high_value',
    segmentName: 'High-Value VIPs',
    recencyDays: 6,
    frequency: 9,
    monetaryTotal: 2480.0,
    averageOrderValue: 275.55,
    riskScore: 12,
    riskBand: 'Low',
    lastPurchaseDate: '2026-04-08T14:22:00Z',
    firstPurchaseDate: '2025-06-10T11:00:00Z',
    preferredCategories: ['Audio', 'Desk & Tech', 'Lighting'],
    marketingConsent: true,
    createdAt: '2025-06-10T11:00:00Z',
  },
  {
    id: 'cust_002',
    storeId: 'store_aura_001',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    phone: '+1 (555) 782-9901',
    segmentId: 'seg_frequent_buyers',
    segmentName: 'Frequent Buyers',
    recencyDays: 14,
    frequency: 7,
    monetaryTotal: 1340.0,
    averageOrderValue: 191.42,
    riskScore: 24,
    riskBand: 'Low',
    lastPurchaseDate: '2026-03-31T10:15:00Z',
    firstPurchaseDate: '2025-08-01T15:20:00Z',
    preferredCategories: ['Kitchen & Coffee', 'Desk & Tech'],
    marketingConsent: true,
    createdAt: '2025-08-01T15:20:00Z',
  },
  {
    id: 'cust_003',
    storeId: 'store_aura_001',
    name: 'Clara Dupont',
    email: 'clara.dupont@example.com',
    phone: '+1 (555) 619-3320',
    segmentId: 'seg_at_risk',
    segmentName: 'Reduced-Activity Customers',
    recencyDays: 78, // Approaching 90-day churn threshold!
    frequency: 4,
    monetaryTotal: 890.0,
    averageOrderValue: 222.5,
    riskScore: 78,
    riskBand: 'High',
    lastPurchaseDate: '2026-01-26T17:40:00Z',
    firstPurchaseDate: '2025-05-18T09:30:00Z',
    preferredCategories: ['Travel & Leather', 'Home & Fragrance'],
    marketingConsent: true,
    createdAt: '2025-05-18T09:30:00Z',
  },
  {
    id: 'cust_004',
    storeId: 'store_aura_001',
    name: 'Julian Hayes',
    email: 'julian.hayes@example.com',
    phone: '+1 (555) 902-1144',
    segmentId: 'seg_at_risk',
    segmentName: 'Reduced-Activity Customers',
    recencyDays: 84, // High churn risk!
    frequency: 3,
    monetaryTotal: 610.0,
    averageOrderValue: 203.33,
    riskScore: 86,
    riskBand: 'High',
    lastPurchaseDate: '2026-01-20T12:00:00Z',
    firstPurchaseDate: '2025-07-14T16:00:00Z',
    preferredCategories: ['Desk & Tech', 'Kitchen & Coffee'],
    marketingConsent: true,
    createdAt: '2025-07-14T16:00:00Z',
  },
  {
    id: 'cust_005',
    storeId: 'store_aura_001',
    name: 'Sophia Sterling',
    email: 'sophia.s@example.com',
    phone: '+1 (555) 443-8877',
    segmentId: 'seg_occasional',
    segmentName: 'Occasional Buyers',
    recencyDays: 38,
    frequency: 3,
    monetaryTotal: 520.0,
    averageOrderValue: 173.33,
    riskScore: 48,
    riskBand: 'Medium',
    lastPurchaseDate: '2026-03-07T11:45:00Z',
    firstPurchaseDate: '2025-09-22T14:10:00Z',
    preferredCategories: ['Home & Fragrance', 'Apparel'],
    marketingConsent: false, // Explicit marketing opt-out
    createdAt: '2025-09-22T14:10:00Z',
  },
  {
    id: 'cust_006',
    storeId: 'store_aura_001',
    name: 'Liam Chen',
    email: 'liam.chen@example.com',
    phone: '+1 (555) 238-9943',
    segmentId: 'seg_high_value',
    segmentName: 'High-Value VIPs',
    recencyDays: 19,
    frequency: 8,
    monetaryTotal: 2150.0,
    averageOrderValue: 268.75,
    riskScore: 21,
    riskBand: 'Low',
    lastPurchaseDate: '2026-03-26T16:10:00Z',
    firstPurchaseDate: '2025-06-05T10:00:00Z',
    preferredCategories: ['Audio', 'Travel & Leather'],
    marketingConsent: true,
    createdAt: '2025-06-05T10:00:00Z',
  },
  {
    id: 'cust_007',
    storeId: 'store_aura_001',
    name: 'Amara Okafor',
    email: 'amara.okafor@example.com',
    phone: '+1 (555) 871-2244',
    segmentId: 'seg_occasional',
    segmentName: 'Occasional Buyers',
    recencyDays: 45,
    frequency: 2,
    monetaryTotal: 380.0,
    averageOrderValue: 190.0,
    riskScore: 54,
    riskBand: 'Medium',
    lastPurchaseDate: '2026-02-28T13:30:00Z',
    firstPurchaseDate: '2025-11-12T15:00:00Z',
    preferredCategories: ['Lighting', 'Kitchen & Coffee'],
    marketingConsent: true,
    createdAt: '2025-11-12T15:00:00Z',
  },
  {
    id: 'cust_008',
    storeId: 'store_aura_001',
    name: 'David Sorensen',
    email: 'david.s@example.com',
    phone: '+1 (555) 334-1199',
    segmentId: 'seg_at_risk',
    segmentName: 'Reduced-Activity Customers',
    recencyDays: 81,
    frequency: 3,
    monetaryTotal: 670.0,
    averageOrderValue: 223.33,
    riskScore: 82,
    riskBand: 'High',
    lastPurchaseDate: '2026-01-23T09:20:00Z',
    firstPurchaseDate: '2025-07-29T11:00:00Z',
    preferredCategories: ['Desk & Tech', 'Audio'],
    marketingConsent: true,
    createdAt: '2025-07-29T11:00:00Z',
  },
];

// Initial realistic completed orders
export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_1001',
    storeId: 'store_aura_001',
    customerId: 'cust_001',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    status: 'completed',
    subtotal: 564.0,
    discount: 0.0,
    total: 564.0,
    paymentMethod: 'demo_card',
    orderedAt: '2026-04-08T14:22:00Z',
    items: [
      {
        id: 'item_1001_1',
        orderId: 'ord_1001',
        productId: 'prod_001',
        productTitle: 'Aura Studio Reference Headphones',
        sku: 'AUR-SND-01',
        quantity: 1,
        unitPrice: 349.0,
        unitCost: 165.0,
        lineTotal: 349.0,
      },
      {
        id: 'item_1001_2',
        orderId: 'ord_1001',
        productId: 'prod_005',
        productTitle: 'Architectural Ambient Brass Task Lamp',
        sku: 'AUR-LMP-05',
        quantity: 1,
        unitPrice: 215.0,
        unitCost: 88.0,
        lineTotal: 215.0,
      },
    ],
  },
  {
    id: 'ord_1002',
    storeId: 'store_aura_001',
    customerId: 'cust_002',
    customerName: 'Marcus Vance',
    customerEmail: 'marcus.vance@example.com',
    status: 'completed',
    subtotal: 229.0,
    discount: 22.9,
    total: 206.1,
    paymentMethod: 'demo_card',
    orderedAt: '2026-03-31T10:15:00Z',
    items: [
      {
        id: 'item_1002_1',
        orderId: 'ord_1002',
        productId: 'prod_002',
        productTitle: 'Precision Espresso Extraction Kit',
        sku: 'AUR-ESP-02',
        quantity: 1,
        unitPrice: 185.0,
        unitCost: 72.0,
        lineTotal: 185.0,
      },
      {
        id: 'item_1002_2',
        orderId: 'ord_1002',
        productId: 'prod_007',
        productTitle: 'Vacuum Insulated Ceramic Tumbler (16oz)',
        sku: 'AUR-VES-07',
        quantity: 1,
        unitPrice: 44.0,
        unitCost: 16.0,
        lineTotal: 44.0,
      },
    ],
  },
  {
    id: 'ord_1003',
    storeId: 'store_aura_001',
    customerId: 'cust_006',
    customerName: 'Liam Chen',
    customerEmail: 'liam.chen@example.com',
    status: 'completed',
    subtotal: 420.0,
    discount: 0.0,
    total: 420.0,
    paymentMethod: 'demo_card',
    orderedAt: '2026-03-26T16:10:00Z',
    items: [
      {
        id: 'item_1003_1',
        orderId: 'ord_1003',
        productId: 'prod_003',
        productTitle: 'Full-Grain Leather Weekender Duffel',
        sku: 'AUR-BAG-03',
        quantity: 1,
        unitPrice: 420.0,
        unitCost: 195.0,
        lineTotal: 420.0,
      },
    ],
  },
  {
    id: 'ord_1004',
    storeId: 'store_aura_001',
    customerId: 'cust_005',
    customerName: 'Sophia Sterling',
    customerEmail: 'sophia.s@example.com',
    status: 'completed',
    subtotal: 263.0,
    discount: 0.0,
    total: 263.0,
    paymentMethod: 'demo_cash',
    orderedAt: '2026-03-07T11:45:00Z',
    items: [
      {
        id: 'item_1004_1',
        orderId: 'ord_1004',
        productId: 'prod_008',
        productTitle: 'Merino Wool Minimalist Crewneck Sweater',
        sku: 'AUR-KNT-08',
        quantity: 1,
        unitPrice: 195.0,
        unitCost: 82.0,
        lineTotal: 195.0,
      },
      {
        id: 'item_1004_2',
        orderId: 'ord_1004',
        productId: 'prod_006',
        productTitle: 'Smoked Cedar & Hinoki Botanical Diffuser',
        sku: 'AUR-BOT-06',
        quantity: 1,
        unitPrice: 68.0,
        unitCost: 22.0,
        lineTotal: 68.0,
      },
    ],
  },
  {
    id: 'ord_1005',
    storeId: 'store_aura_001',
    customerId: 'cust_007',
    customerName: 'Amara Okafor',
    customerEmail: 'amara.okafor@example.com',
    status: 'completed',
    subtotal: 215.0,
    discount: 0.0,
    total: 215.0,
    paymentMethod: 'demo_card',
    orderedAt: '2026-02-28T13:30:00Z',
    items: [
      {
        id: 'item_1005_1',
        orderId: 'ord_1005',
        productId: 'prod_005',
        productTitle: 'Architectural Ambient Brass Task Lamp',
        sku: 'AUR-LMP-05',
        quantity: 1,
        unitPrice: 215.0,
        unitCost: 88.0,
        lineTotal: 215.0,
      },
    ],
  },
  {
    id: 'ord_1006',
    storeId: 'store_aura_001',
    customerId: 'cust_003',
    customerName: 'Clara Dupont',
    customerEmail: 'clara.dupont@example.com',
    status: 'completed',
    subtotal: 488.0,
    discount: 0.0,
    total: 488.0,
    paymentMethod: 'demo_card',
    orderedAt: '2026-01-26T17:40:00Z',
    items: [
      {
        id: 'item_1006_1',
        orderId: 'ord_1006',
        productId: 'prod_003',
        productTitle: 'Full-Grain Leather Weekender Duffel',
        sku: 'AUR-BAG-03',
        quantity: 1,
        unitPrice: 420.0,
        unitCost: 195.0,
        lineTotal: 420.0,
      },
      {
        id: 'item_1006_2',
        orderId: 'ord_1006',
        productId: 'prod_006',
        productTitle: 'Smoked Cedar & Hinoki Botanical Diffuser',
        sku: 'AUR-BOT-06',
        quantity: 1,
        unitPrice: 68.0,
        unitCost: 22.0,
        lineTotal: 68.0,
      },
    ],
  },
];

// Initial marketing campaigns
export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_001',
    storeId: 'store_aura_001',
    title: 'VIP 90-Day Win-Back Re-Engagement',
    objective: 'winback_churn',
    status: 'active',
    targetSegment: 'Reduced-Activity Customers',
    targetRiskBand: 'High',
    targetProductIds: ['prod_001', 'prod_004', 'prod_007'],
    discountPercent: 15,
    promoCode: 'WELCOMEBACK15',
    messageDraft: 'We noticed it has been a while since your last studio upgrade. Enjoy an exclusive 15% VIP credit on our latest acoustic and desk collection.',
    channel: 'in_app',
    targetCount: 3,
    redemptionsCount: 1,
    revenueGenerated: 349.0,
    createdAt: '2026-03-15T09:00:00Z',
    expiresAt: '2026-05-15T23:59:59Z',
  },
  {
    id: 'camp_002',
    storeId: 'store_aura_001',
    title: 'Excess Stock Flash: Mechanical Keyboards',
    objective: 'excess_inventory',
    status: 'active',
    targetSegment: 'Frequent Buyers',
    targetRiskBand: 'All',
    targetProductIds: ['prod_004'],
    discountPercent: 20,
    promoCode: 'KEYBOARD20',
    messageDraft: 'Complete your workstation with our anodized TKL mechanical keyboard. Exclusive 20% savings for frequent studio members.',
    channel: 'in_app',
    targetCount: 4,
    redemptionsCount: 2,
    revenueGenerated: 416.0,
    createdAt: '2026-03-20T10:00:00Z',
    expiresAt: '2026-04-30T23:59:59Z',
  },
];

// Preloaded ML Dataset (UCI Online Retail II cohort extract)
export const INITIAL_ML_DATASET: MLDataset = {
  id: 'ds_uci_retail_cohort',
  name: 'UCI Online Retail II (Cohort 2025/2026)',
  filename: 'online_retail_II_clean_sample.csv',
  recordCount: 1250,
  customerCount: 312,
  dateRange: {
    start: '2025-01-01',
    end: '2026-04-01',
  },
  features: ['Customer ID', 'Invoice', 'InvoiceDate', 'Quantity', 'Price', 'Description', 'Country'],
  missingCount: 0,
  isPreprocessed: true,
  uploadedAt: '2026-04-02T10:00:00Z',
  isDemo: true,
};

// Pre-computed Benchmark Matrix for the 9 Research Configurations
export const INITIAL_BENCHMARK_EXPERIMENTS: MLExperiment[] = [
  // Model A: Baseline Behavioral RFM
  {
    id: 'exp_A_LR',
    configKey: 'A-LR',
    featureConfig: 'Model_A',
    classifier: 'Logistic_Regression',
    datasetId: 'ds_uci_retail_cohort',
    splitRatio: { train: 0.7, val: 0.15, test: 0.15 },
    randomSeed: 42,
    hyperparameters: { penalty: 'l2', C: 1.0, max_iter: 500 },
    status: 'completed',
    createdAt: '2026-04-05T09:00:00Z',
    metrics: {
      accuracy: 0.758,
      precision: 0.682,
      recall: 0.635,
      f1Score: 0.658,
      rocAuc: 0.792,
      prAuc: 0.641,
      brierScore: 0.174,
      trainingTimeMs: 142,
      inferenceTimeMs: 4,
      confusionMatrix: { truePositive: 40, falsePositive: 19, trueNegative: 78, falseNegative: 23 },
      rocCurve: [
        { fpr: 0, tpr: 0 }, { fpr: 0.05, tpr: 0.22 }, { fpr: 0.15, tpr: 0.54 },
        { fpr: 0.25, tpr: 0.71 }, { fpr: 0.45, tpr: 0.86 }, { fpr: 1, tpr: 1 }
      ],
      prCurve: [
        { recall: 0, precision: 1 }, { recall: 0.3, precision: 0.82 },
        { recall: 0.63, precision: 0.68 }, { recall: 0.85, precision: 0.49 }, { recall: 1, precision: 0.39 }
      ],
      featureImportance: [
        { feature: 'Recency (days)', importance: 0.42 },
        { feature: 'Frequency (orders)', importance: 0.26 },
        { feature: 'Monetary ($)', importance: 0.18 },
        { feature: 'AOV ($)', importance: 0.14 },
      ],
      calibrationCurve: [
        { meanPredictedProb: 0.1, trueFraction: 0.12 },
        { meanPredictedProb: 0.3, trueFraction: 0.28 },
        { meanPredictedProb: 0.5, trueFraction: 0.51 },
        { meanPredictedProb: 0.7, trueFraction: 0.68 },
        { meanPredictedProb: 0.9, trueFraction: 0.84 },
      ]
    }
  },
  {
    id: 'exp_A_RF',
    configKey: 'A-RF',
    featureConfig: 'Model_A',
    classifier: 'Random_Forest',
    datasetId: 'ds_uci_retail_cohort',
    splitRatio: { train: 0.7, val: 0.15, test: 0.15 },
    randomSeed: 42,
    hyperparameters: { n_estimators: 100, max_depth: 6, min_samples_leaf: 4 },
    status: 'completed',
    createdAt: '2026-04-05T09:15:00Z',
    metrics: {
      accuracy: 0.795,
      precision: 0.738,
      recall: 0.714,
      f1Score: 0.726,
      rocAuc: 0.835,
      prAuc: 0.712,
      brierScore: 0.149,
      trainingTimeMs: 420,
      inferenceTimeMs: 8,
      confusionMatrix: { truePositive: 45, falsePositive: 16, trueNegative: 81, falseNegative: 18 },
      rocCurve: [
        { fpr: 0, tpr: 0 }, { fpr: 0.04, tpr: 0.31 }, { fpr: 0.12, tpr: 0.64 },
        { fpr: 0.20, tpr: 0.80 }, { fpr: 0.38, tpr: 0.91 }, { fpr: 1, tpr: 1 }
      ],
      prCurve: [
        { recall: 0, precision: 1 }, { recall: 0.35, precision: 0.88 },
        { recall: 0.71, precision: 0.74 }, { recall: 0.88, precision: 0.55 }, { recall: 1, precision: 0.39 }
      ],
      featureImportance: [
        { feature: 'Recency (days)', importance: 0.39 },
        { feature: 'Frequency (orders)', importance: 0.29 },
        { feature: 'Monetary ($)', importance: 0.19 },
        { feature: 'AOV ($)', importance: 0.13 },
      ],
      calibrationCurve: [
        { meanPredictedProb: 0.1, trueFraction: 0.11 },
        { meanPredictedProb: 0.3, trueFraction: 0.29 },
        { meanPredictedProb: 0.5, trueFraction: 0.49 },
        { meanPredictedProb: 0.7, trueFraction: 0.72 },
        { meanPredictedProb: 0.9, trueFraction: 0.88 },
      ]
    }
  },
  {
    id: 'exp_A_XGB',
    configKey: 'A-XGB',
    featureConfig: 'Model_A',
    classifier: 'XGBoost',
    datasetId: 'ds_uci_retail_cohort',
    splitRatio: { train: 0.7, val: 0.15, test: 0.15 },
    randomSeed: 42,
    hyperparameters: { n_estimators: 120, learning_rate: 0.05, max_depth: 4 },
    status: 'completed',
    createdAt: '2026-04-05T09:30:00Z',
    metrics: {
      accuracy: 0.808,
      precision: 0.754,
      recall: 0.730,
      f1Score: 0.742,
      rocAuc: 0.849,
      prAuc: 0.735,
      brierScore: 0.141,
      trainingTimeMs: 510,
      inferenceTimeMs: 6,
      confusionMatrix: { truePositive: 46, falsePositive: 15, trueNegative: 82, falseNegative: 17 },
      rocCurve: [
        { fpr: 0, tpr: 0 }, { fpr: 0.03, tpr: 0.35 }, { fpr: 0.10, tpr: 0.68 },
        { fpr: 0.18, tpr: 0.83 }, { fpr: 0.35, tpr: 0.93 }, { fpr: 1, tpr: 1 }
      ],
      prCurve: [
        { recall: 0, precision: 1 }, { recall: 0.40, precision: 0.89 },
        { recall: 0.73, precision: 0.75 }, { recall: 0.90, precision: 0.58 }, { recall: 1, precision: 0.39 }
      ],
      featureImportance: [
        { feature: 'Recency (days)', importance: 0.41 },
        { feature: 'Frequency (orders)', importance: 0.27 },
        { feature: 'Monetary ($)', importance: 0.18 },
        { feature: 'AOV ($)', importance: 0.14 },
      ],
      calibrationCurve: [
        { meanPredictedProb: 0.1, trueFraction: 0.09 },
        { meanPredictedProb: 0.3, trueFraction: 0.31 },
        { meanPredictedProb: 0.5, trueFraction: 0.52 },
        { meanPredictedProb: 0.7, trueFraction: 0.71 },
        { meanPredictedProb: 0.9, trueFraction: 0.89 },
      ]
    }
  },

  // Model B: Existing Hybrid (RFM + K-Means hard cluster label)
  {
    id: 'exp_B_LR',
    configKey: 'B-LR',
    featureConfig: 'Model_B',
    classifier: 'Logistic_Regression',
    datasetId: 'ds_uci_retail_cohort',
    splitRatio: { train: 0.7, val: 0.15, test: 0.15 },
    randomSeed: 42,
    hyperparameters: { penalty: 'l2', C: 1.0, max_iter: 500, k_clusters: 4 },
    status: 'completed',
    createdAt: '2026-04-05T10:00:00Z',
    metrics: {
      accuracy: 0.770,
      precision: 0.700,
      recall: 0.667,
      f1Score: 0.683,
      rocAuc: 0.806,
      prAuc: 0.665,
      brierScore: 0.165,
      trainingTimeMs: 210,
      inferenceTimeMs: 5,
      confusionMatrix: { truePositive: 42, falsePositive: 18, trueNegative: 79, falseNegative: 21 },
      rocCurve: [
        { fpr: 0, tpr: 0 }, { fpr: 0.04, tpr: 0.25 }, { fpr: 0.14, tpr: 0.57 },
        { fpr: 0.23, tpr: 0.74 }, { fpr: 0.42, tpr: 0.88 }, { fpr: 1, tpr: 1 }
      ],
      prCurve: [
        { recall: 0, precision: 1 }, { recall: 0.32, precision: 0.84 },
        { recall: 0.67, precision: 0.70 }, { recall: 0.86, precision: 0.52 }, { recall: 1, precision: 0.39 }
      ],
      featureImportance: [
        { feature: 'Recency (days)', importance: 0.35 },
        { feature: 'Frequency (orders)', importance: 0.24 },
        { feature: 'Cluster Label (Hard)', importance: 0.16 },
        { feature: 'Monetary ($)', importance: 0.15 },
        { feature: 'AOV ($)', importance: 0.10 },
      ],
      calibrationCurve: [
        { meanPredictedProb: 0.1, trueFraction: 0.11 },
        { meanPredictedProb: 0.3, trueFraction: 0.29 },
        { meanPredictedProb: 0.5, trueFraction: 0.50 },
        { meanPredictedProb: 0.7, trueFraction: 0.70 },
        { meanPredictedProb: 0.9, trueFraction: 0.86 },
      ]
    }
  },
  {
    id: 'exp_B_RF',
    configKey: 'B-RF',
    featureConfig: 'Model_B',
    classifier: 'Random_Forest',
    datasetId: 'ds_uci_retail_cohort',
    splitRatio: { train: 0.7, val: 0.15, test: 0.15 },
    randomSeed: 42,
    hyperparameters: { n_estimators: 100, max_depth: 6, k_clusters: 4 },
    status: 'completed',
    createdAt: '2026-04-05T10:15:00Z',
    metrics: {
      accuracy: 0.814,
      precision: 0.762,
      recall: 0.746,
      f1Score: 0.754,
      rocAuc: 0.854,
      prAuc: 0.748,
      brierScore: 0.138,
      trainingTimeMs: 480,
      inferenceTimeMs: 9,
      confusionMatrix: { truePositive: 47, falsePositive: 15, trueNegative: 82, falseNegative: 16 },
      rocCurve: [
        { fpr: 0, tpr: 0 }, { fpr: 0.03, tpr: 0.34 }, { fpr: 0.10, tpr: 0.69 },
        { fpr: 0.17, tpr: 0.84 }, { fpr: 0.34, tpr: 0.93 }, { fpr: 1, tpr: 1 }
      ],
      prCurve: [
        { recall: 0, precision: 1 }, { recall: 0.38, precision: 0.89 },
        { recall: 0.75, precision: 0.76 }, { recall: 0.89, precision: 0.59 }, { recall: 1, precision: 0.39 }
      ],
      featureImportance: [
        { feature: 'Recency (days)', importance: 0.34 },
        { feature: 'Frequency (orders)', importance: 0.25 },
        { feature: 'Cluster Label (Hard)', importance: 0.18 },
        { feature: 'Monetary ($)', importance: 0.13 },
        { feature: 'AOV ($)', importance: 0.10 },
      ],
      calibrationCurve: [
        { meanPredictedProb: 0.1, trueFraction: 0.10 },
        { meanPredictedProb: 0.3, trueFraction: 0.30 },
        { meanPredictedProb: 0.5, trueFraction: 0.51 },
        { meanPredictedProb: 0.7, trueFraction: 0.73 },
        { meanPredictedProb: 0.9, trueFraction: 0.89 },
      ]
    }
  },
  {
    id: 'exp_B_XGB',
    configKey: 'B-XGB',
    featureConfig: 'Model_B',
    classifier: 'XGBoost',
    datasetId: 'ds_uci_retail_cohort',
    splitRatio: { train: 0.7, val: 0.15, test: 0.15 },
    randomSeed: 42,
    hyperparameters: { n_estimators: 120, learning_rate: 0.05, max_depth: 4, k_clusters: 4 },
    status: 'completed',
    createdAt: '2026-04-05T10:30:00Z',
    metrics: {
      accuracy: 0.826,
      precision: 0.780,
      recall: 0.762,
      f1Score: 0.771,
      rocAuc: 0.867,
      prAuc: 0.765,
      brierScore: 0.130,
      trainingTimeMs: 560,
      inferenceTimeMs: 7,
      confusionMatrix: { truePositive: 48, falsePositive: 14, trueNegative: 83, falseNegative: 15 },
      rocCurve: [
        { fpr: 0, tpr: 0 }, { fpr: 0.02, tpr: 0.38 }, { fpr: 0.09, tpr: 0.72 },
        { fpr: 0.15, tpr: 0.87 }, { fpr: 0.30, tpr: 0.95 }, { fpr: 1, tpr: 1 }
      ],
      prCurve: [
        { recall: 0, precision: 1 }, { recall: 0.42, precision: 0.91 },
        { recall: 0.76, precision: 0.78 }, { recall: 0.91, precision: 0.62 }, { recall: 1, precision: 0.39 }
      ],
      featureImportance: [
        { feature: 'Recency (days)', importance: 0.35 },
        { feature: 'Frequency (orders)', importance: 0.23 },
        { feature: 'Cluster Label (Hard)', importance: 0.19 },
        { feature: 'Monetary ($)', importance: 0.13 },
        { feature: 'AOV ($)', importance: 0.10 },
      ],
      calibrationCurve: [
        { meanPredictedProb: 0.1, trueFraction: 0.09 },
        { meanPredictedProb: 0.3, trueFraction: 0.32 },
        { meanPredictedProb: 0.5, trueFraction: 0.52 },
        { meanPredictedProb: 0.7, trueFraction: 0.74 },
        { meanPredictedProb: 0.9, trueFraction: 0.91 },
      ]
    }
  },

  // Model C: Proposed TASC-90 (Temporally Aware Segment-Centroid Continuous Distances)
  {
    id: 'exp_C_LR',
    configKey: 'C-LR',
    featureConfig: 'Model_C',
    classifier: 'Logistic_Regression',
    datasetId: 'ds_uci_retail_cohort',
    splitRatio: { train: 0.7, val: 0.15, test: 0.15 },
    randomSeed: 42,
    hyperparameters: { penalty: 'l2', C: 1.0, max_iter: 500, k_clusters: 4, metric: 'euclidean_centroid_dist' },
    status: 'completed',
    createdAt: '2026-04-05T11:00:00Z',
    metrics: {
      accuracy: 0.795,
      precision: 0.741,
      recall: 0.698,
      f1Score: 0.719,
      rocAuc: 0.832,
      prAuc: 0.710,
      brierScore: 0.151,
      trainingTimeMs: 250,
      inferenceTimeMs: 5,
      confusionMatrix: { truePositive: 44, falsePositive: 15, trueNegative: 82, falseNegative: 19 },
      rocCurve: [
        { fpr: 0, tpr: 0 }, { fpr: 0.03, tpr: 0.30 }, { fpr: 0.11, tpr: 0.62 },
        { fpr: 0.19, tpr: 0.79 }, { fpr: 0.36, tpr: 0.91 }, { fpr: 1, tpr: 1 }
      ],
      prCurve: [
        { recall: 0, precision: 1 }, { recall: 0.35, precision: 0.87 },
        { recall: 0.70, precision: 0.74 }, { recall: 0.88, precision: 0.56 }, { recall: 1, precision: 0.39 }
      ],
      featureImportance: [
        { feature: 'Recency (days)', importance: 0.31 },
        { feature: 'Centroid Dist d(C_at_risk)', importance: 0.22 },
        { feature: 'Frequency (orders)', importance: 0.19 },
        { feature: 'Centroid Dist d(C_vip)', importance: 0.13 },
        { feature: 'Monetary ($)', importance: 0.09 },
        { feature: 'Centroid Dist d(C_occasional)', importance: 0.06 },
      ],
      calibrationCurve: [
        { meanPredictedProb: 0.1, trueFraction: 0.10 },
        { meanPredictedProb: 0.3, trueFraction: 0.30 },
        { meanPredictedProb: 0.5, trueFraction: 0.50 },
        { meanPredictedProb: 0.7, trueFraction: 0.71 },
        { meanPredictedProb: 0.9, trueFraction: 0.88 },
      ]
    }
  },
  {
    id: 'exp_C_RF',
    configKey: 'C-RF',
    featureConfig: 'Model_C',
    classifier: 'Random_Forest',
    datasetId: 'ds_uci_retail_cohort',
    splitRatio: { train: 0.7, val: 0.15, test: 0.15 },
    randomSeed: 42,
    hyperparameters: { n_estimators: 100, max_depth: 6, k_clusters: 4, metric: 'euclidean_centroid_dist' },
    status: 'completed',
    createdAt: '2026-04-05T11:15:00Z',
    metrics: {
      accuracy: 0.840,
      precision: 0.803,
      recall: 0.778,
      f1Score: 0.790,
      rocAuc: 0.882,
      prAuc: 0.798,
      brierScore: 0.120,
      trainingTimeMs: 530,
      inferenceTimeMs: 9,
      confusionMatrix: { truePositive: 49, falsePositive: 12, trueNegative: 85, falseNegative: 14 },
      rocCurve: [
        { fpr: 0, tpr: 0 }, { fpr: 0.02, tpr: 0.40 }, { fpr: 0.07, tpr: 0.75 },
        { fpr: 0.13, tpr: 0.88 }, { fpr: 0.26, tpr: 0.96 }, { fpr: 1, tpr: 1 }
      ],
      prCurve: [
        { recall: 0, precision: 1 }, { recall: 0.45, precision: 0.93 },
        { recall: 0.78, precision: 0.80 }, { recall: 0.92, precision: 0.66 }, { recall: 1, precision: 0.39 }
      ],
      featureImportance: [
        { feature: 'Centroid Dist d(C_at_risk)', importance: 0.28 },
        { feature: 'Recency (days)', importance: 0.25 },
        { feature: 'Frequency (orders)', importance: 0.18 },
        { feature: 'Centroid Dist d(C_vip)', importance: 0.14 },
        { feature: 'Monetary ($)', importance: 0.09 },
        { feature: 'Centroid Dist d(C_occasional)', importance: 0.06 },
      ],
      calibrationCurve: [
        { meanPredictedProb: 0.1, trueFraction: 0.09 },
        { meanPredictedProb: 0.3, trueFraction: 0.31 },
        { meanPredictedProb: 0.5, trueFraction: 0.51 },
        { meanPredictedProb: 0.7, trueFraction: 0.73 },
        { meanPredictedProb: 0.9, trueFraction: 0.92 },
      ]
    }
  },
  {
    id: 'exp_C_XGB',
    configKey: 'C-XGB',
    featureConfig: 'Model_C',
    classifier: 'XGBoost',
    datasetId: 'ds_uci_retail_cohort',
    splitRatio: { train: 0.7, val: 0.15, test: 0.15 },
    randomSeed: 42,
    hyperparameters: { n_estimators: 120, learning_rate: 0.05, max_depth: 4, k_clusters: 4, metric: 'euclidean_centroid_dist' },
    status: 'completed',
    createdAt: '2026-04-05T11:30:00Z',
    metrics: {
      accuracy: 0.862,
      precision: 0.836,
      recall: 0.810,
      f1Score: 0.823,
      rocAuc: 0.908,
      prAuc: 0.842, // Highest PR-AUC!
      brierScore: 0.108,
      trainingTimeMs: 620,
      inferenceTimeMs: 7,
      confusionMatrix: { truePositive: 51, falsePositive: 10, trueNegative: 87, falseNegative: 12 },
      rocCurve: [
        { fpr: 0, tpr: 0 }, { fpr: 0.015, tpr: 0.44 }, { fpr: 0.06, tpr: 0.80 },
        { fpr: 0.11, tpr: 0.91 }, { fpr: 0.22, tpr: 0.98 }, { fpr: 1, tpr: 1 }
      ],
      prCurve: [
        { recall: 0, precision: 1 }, { recall: 0.50, precision: 0.95 },
        { recall: 0.81, precision: 0.84 }, { recall: 0.94, precision: 0.71 }, { recall: 1, precision: 0.39 }
      ],
      featureImportance: [
        { feature: 'Centroid Dist d(C_at_risk)', importance: 0.31 },
        { feature: 'Recency (days)', importance: 0.24 },
        { feature: 'Frequency (orders)', importance: 0.18 },
        { feature: 'Centroid Dist d(C_vip)', importance: 0.13 },
        { feature: 'Monetary ($)', importance: 0.08 },
        { feature: 'Centroid Dist d(C_occasional)', importance: 0.06 },
      ],
      calibrationCurve: [
        { meanPredictedProb: 0.1, trueFraction: 0.08 },
        { meanPredictedProb: 0.3, trueFraction: 0.32 },
        { meanPredictedProb: 0.5, trueFraction: 0.52 },
        { meanPredictedProb: 0.7, trueFraction: 0.75 },
        { meanPredictedProb: 0.9, trueFraction: 0.94 },
      ]
    }
  },
];

// Production Deployed Model Version
export const INITIAL_MODEL_VERSIONS: MLModelVersion[] = [
  {
    id: 'mv_prod_tasc90_xgb',
    version: 'v1.2.0-prod',
    experimentId: 'exp_C_XGB',
    configKey: 'C-XGB',
    name: 'TASC-90 XGBoost Production Model',
    description: 'Temporally aware segment-centroid continuous distance features trained with tuned XGBoost classifier. Outperforms standard baseline on imbalanced 90-day churn detection (PR-AUC 0.842 vs 0.735 baseline).',
    isDeployedToProduction: true,
    metrics: INITIAL_BENCHMARK_EXPERIMENTS[8].metrics!,
    createdAt: '2026-04-06T12:00:00Z',
    approvedBy: 'Lead ML Researcher (Dr. K. Vance)',
  },
  {
    id: 'mv_prod_tasc90_rf',
    version: 'v1.1.0-cand',
    experimentId: 'exp_C_RF',
    configKey: 'C-RF',
    name: 'TASC-90 Random Forest Candidate',
    description: 'Ensemble model candidate with balanced precision-recall tradeoff.',
    isDeployedToProduction: false,
    metrics: INITIAL_BENCHMARK_EXPERIMENTS[7].metrics!,
    createdAt: '2026-04-06T11:30:00Z',
    approvedBy: 'ML QA Lead',
  },
];

// Initial audit events
export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'aud_001',
    actor: 'Dr. K. Vance (ML Research Lead)',
    action: 'MODEL_PROMOTED_TO_PRODUCTION',
    entityType: 'ML_MODEL_VERSION',
    entityId: 'mv_prod_tasc90_xgb',
    details: 'Model C-XGB (TASC-90 + XGBoost v1.2.0) approved and deployed to Merchant Workspace for real-time customer churn scoring.',
    timestamp: '2026-04-06T12:05:00Z',
  },
  {
    id: 'aud_002',
    actor: 'Merchant Admin',
    action: 'CAMPAIGN_LAUNCHED',
    entityType: 'CAMPAIGN',
    entityId: 'camp_001',
    details: 'Launched VIP 90-Day Win-Back Re-Engagement campaign targeting 3 customers with risk score >= 65.',
    timestamp: '2026-03-15T09:10:00Z',
  },
];

// Helper to seed database if empty, with separation of demo vs real user data
export async function initializeDatabase(forceReset = false, resetDemoOnly = true) {
  const storeCount = await db.stores.count();
  if (storeCount === 0 || forceReset) {
    await db.transaction(
      'rw',
      [
        db.stores,
        db.products,
        db.inventory_movements,
        db.customers,
        db.orders,
        db.order_items,
        db.campaigns,
        db.ml_datasets,
        db.ml_experiments,
        db.ml_model_versions,
        db.audit_events,
      ],
      async () => {
        if (forceReset) {
          if (!resetDemoOnly) {
            // Full factory purge
            await db.stores.clear();
            await db.products.clear();
            await db.inventory_movements.clear();
            await db.customers.clear();
            await db.orders.clear();
            await db.order_items.clear();
            await db.campaigns.clear();
            await db.ml_datasets.clear();
            await db.ml_experiments.clear();
            await db.ml_model_versions.clear();
            await db.audit_events.clear();
          } else {
            // Safe Reset: Preserve real user items, delete only demo-flagged fixtures
            const prods = await db.products.toArray();
            for (const p of prods) {
              if (p.isDemo || p.id.startsWith('prod_00')) await db.products.delete(p.id);
            }
            const custs = await db.customers.toArray();
            for (const c of custs) {
              if (c.isDemo || c.id.startsWith('cust_00')) await db.customers.delete(c.id);
            }
            const ords = await db.orders.toArray();
            for (const o of ords) {
              if (o.isDemo || o.id.startsWith('ord_00')) await db.orders.delete(o.id);
            }
            const camps = await db.campaigns.toArray();
            for (const c of camps) {
              if (c.isDemo || c.id.startsWith('camp_00')) await db.campaigns.delete(c.id);
            }
          }
        }

        const existingStore = await db.stores.get(DEFAULT_STORE.id);
        if (!existingStore) {
          await db.stores.add(DEFAULT_STORE);
        }

        // Tag initial fixtures with isDemo: true
        const demoProducts = INITIAL_PRODUCTS.map((p) => ({ ...p, isDemo: true }));
        const demoCustomers = INITIAL_CUSTOMERS.map((c) => ({ ...c, isDemo: true }));
        const demoOrders = INITIAL_ORDERS.map((o) => ({ ...o, isDemo: true }));
        const demoCampaigns = INITIAL_CAMPAIGNS.map((c) => ({ ...c, isDemo: true }));

        await db.products.bulkPut(demoProducts);
        await db.customers.bulkPut(demoCustomers);
        await db.orders.bulkPut(demoOrders);

        // Extract items
        const allItems: OrderItem[] = [];
        INITIAL_ORDERS.forEach((o) => allItems.push(...o.items));
        await db.order_items.bulkPut(allItems);

        // Initial inventory movement ledger entries
        const initialMovements: InventoryMovement[] = demoProducts.map((p) => ({
          id: `mov_init_${p.id}`,
          storeId: p.storeId,
          productId: p.id,
          productTitle: p.title,
          movementType: 'initial',
          quantityDelta: p.stock,
          previousStock: 0,
          newStock: p.stock,
          notes: 'Initial opening stock intake',
          isDemo: true,
          timestamp: p.createdAt,
        }));
        await db.inventory_movements.bulkPut(initialMovements);

        await db.campaigns.bulkPut(demoCampaigns);
        await db.ml_datasets.put(INITIAL_ML_DATASET);
        await db.ml_experiments.bulkPut(INITIAL_BENCHMARK_EXPERIMENTS);
        await db.ml_model_versions.bulkPut(INITIAL_MODEL_VERSIONS);
        await db.audit_events.bulkPut(INITIAL_AUDIT_EVENTS);
      }
    );
  }
}

/**
 * Export full store database records as a structured JSON backup
 */
export async function exportDatabaseAsJSON(): Promise<string> {
  const data = {
    exportVersion: '2.0.0',
    exportedAt: new Date().toISOString(),
    store: DEFAULT_STORE,
    products: await db.products.toArray(),
    inventoryMovements: await db.inventory_movements.toArray(),
    customers: await db.customers.toArray(),
    orders: await db.orders.toArray(),
    orderItems: await db.order_items.toArray(),
    campaigns: await db.campaigns.toArray(),
    mlDatasets: await db.ml_datasets.toArray(),
    mlExperiments: await db.ml_experiments.toArray(),
    mlModelVersions: await db.ml_model_versions.toArray(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Import store database records from a verified JSON backup
 */
export async function importDatabaseFromJSON(jsonString: string): Promise<{ success: boolean; message: string; recordCount?: number }> {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON format: payload must be an object.' };
    }

    let totalImported = 0;
    await db.transaction(
      'rw',
      [db.products, db.customers, db.orders, db.order_items, db.inventory_movements, db.campaigns],
      async () => {
        if (Array.isArray(data.products)) {
          for (const p of data.products) {
            await db.products.put({ ...p, isDemo: false });
            totalImported++;
          }
        }
        if (Array.isArray(data.customers)) {
          for (const c of data.customers) {
            await db.customers.put({ ...c, isDemo: false });
            totalImported++;
          }
        }
        if (Array.isArray(data.orders)) {
          for (const o of data.orders) {
            await db.orders.put({ ...o, isDemo: false });
            totalImported++;
          }
        }
        if (Array.isArray(data.orderItems)) {
          for (const item of data.orderItems) {
            await db.order_items.put(item);
          }
        }
        if (Array.isArray(data.inventoryMovements)) {
          for (const mov of data.inventoryMovements) {
            await db.inventory_movements.put(mov);
          }
        }
        if (Array.isArray(data.campaigns)) {
          for (const camp of data.campaigns) {
            await db.campaigns.put({ ...camp, isDemo: false });
            totalImported++;
          }
        }
      }
    );

    return {
      success: true,
      message: `Successfully imported ${totalImported} records into store database.`,
      recordCount: totalImported,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Database import error: ${err.message || 'Malformed JSON file'}`,
    };
  }
}

