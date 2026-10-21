import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  db,
  initializeDatabase,
  exportDatabaseAsJSON,
  importDatabaseFromJSON,
  DEFAULT_STORE,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_ORDERS,
  INITIAL_CAMPAIGNS,
  INITIAL_BENCHMARK_EXPERIMENTS,
  INITIAL_MODEL_VERSIONS,
} from '../services/local-db';
import {
  isSupabaseConfigured,
  syncProductToCloud,
  syncOrderToCloud,
  syncInventoryMovementToCloud,
} from '../services/supabase';
import type {
  Product,
  Customer,
  Order,
  InventoryMovement,
  Campaign,
  MLDataset,
  MLExperiment,
  MLModelVersion,
  WorkspaceType,
  UserPreferences,
} from '../types';

interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  workspace: WorkspaceType;
  setWorkspace: (ws: WorkspaceType) => void;
  currentRoute: string;
  navigateTo: (route: string) => void;
  products: Product[];
  customers: Customer[];
  orders: Order[];
  campaigns: Campaign[];
  experiments: MLExperiment[];
  modelVersions: MLModelVersion[];
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  appliedPromo: Campaign | null;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  createProduct: (productData: Partial<Product>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  recordInventoryAdjustment: (productId: string, delta: number, type: any, notes?: string) => Promise<void>;
  createCampaign: (campaignData: Partial<Campaign>) => Promise<Campaign>;
  approveModelForProduction: (modelVersionId: string) => Promise<void>;
  applyModelPredictionsToCustomers: (predictions: { customerId: string; riskScore: number; riskBand: 'Low' | 'Medium' | 'High'; segmentName: string }[]) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  resetDemoData: (resetDemoOnly?: boolean) => Promise<void>;
  factoryResetData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (jsonStr: string) => Promise<{ success: boolean; message: string; recordCount?: number }>;
  isCloudSyncActive: boolean;
  isLoading: boolean;
  isVoiceAIOpen: boolean;
  setIsVoiceAIOpen: (open: boolean) => void;
  openVoiceAI: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspace, setWorkspace] = useState<WorkspaceType>('landing');
  const [currentRoute, setCurrentRoute] = useState<string>('/');
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [experiments, setExperiments] = useState<MLExperiment[]>([]);
  const [modelVersions, setModelVersions] = useState<MLModelVersion[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isVoiceAIOpen, setIsVoiceAIOpen] = useState<boolean>(false);

  const openVoiceAI = () => {
    setIsVoiceAIOpen(true);
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('mb_theme');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mb_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loadDataFromDb = async () => {
    try {
      setIsLoading(true);
      await initializeDatabase();
      const p = await db.products.toArray();
      const c = await db.customers.toArray();
      const o = await db.orders.orderBy('orderedAt').reverse().toArray();
      const camp = await db.campaigns.toArray();
      const exp = await db.ml_experiments.toArray();
      const mv = await db.ml_model_versions.toArray();

      setProducts(p);
      setCustomers(c);
      setOrders(o);
      setCampaigns(camp);
      setExperiments(exp);
      setModelVersions(mv);
    } catch (e) {
      console.error('Error loading data from Dexie IndexedDB:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromDb();
  }, []);

  // Listen to browser popstate for deep links and back/forward navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname || '/';
      setCurrentRoute(path);
      if (path.startsWith('/merchant')) setWorkspace('merchant');
      else if (path.startsWith('/customer')) setWorkspace('customer');
      else if (path.startsWith('/lab')) setWorkspace('lab');
      else setWorkspace('landing');
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (route: string) => {
    window.history.pushState({}, '', route);
    setCurrentRoute(route);
    if (route.startsWith('/merchant')) setWorkspace('merchant');
    else if (route.startsWith('/customer')) setWorkspace('customer');
    else if (route.startsWith('/lab')) setWorkspace('lab');
    else setWorkspace('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Management
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stock, quantity) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const applyPromo = (code: string) => {
    const found = campaigns.find(
      (c) => c.status === 'active' && c.promoCode.toUpperCase() === code.trim().toUpperCase()
    );
    if (found) {
      setAppliedPromo(found);
      return { success: true, message: `Promo code applied! ${found.discountPercent}% discount.` };
    }
    return { success: false, message: 'Invalid or expired promotional code.' };
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  // Atomic Order Creation with Stock Decrement and Movement Ledger
  const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      storeId: DEFAULT_STORE.id,
      customerId: orderData.customerId || 'cust_guest',
      customerName: orderData.customerName || 'Studio Guest',
      customerEmail: orderData.customerEmail || 'guest@example.com',
      status: 'completed',
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'demo_card',
      orderedAt: new Date().toISOString(),
      items: orderData.items || [],
      isDemo: false,
      notes: orderData.notes,
    };

    await db.transaction('rw', [db.orders, db.order_items, db.products, db.inventory_movements, db.customers], async () => {
      // 1. Save order
      await db.orders.add(newOrder);
      await db.order_items.bulkAdd(newOrder.items);

      // 2. Decrement stock atomically and record inventory movement
      for (const item of newOrder.items) {
        const prod = await db.products.get(item.productId);
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await db.products.update(item.productId, {
            stock: newStock,
            updatedAt: new Date().toISOString(),
          });

          const mov: InventoryMovement = {
            id: `mov_sale_${Date.now()}_${item.productId}`,
            storeId: prod.storeId,
            productId: prod.id,
            productTitle: prod.title,
            movementType: 'sale',
            quantityDelta: -item.quantity,
            previousStock: prod.stock,
            newStock,
            referenceId: newOrder.id,
            notes: `Customer Order #${newOrder.id.slice(-6)}`,
            timestamp: new Date().toISOString(),
          };
          await db.inventory_movements.add(mov);
        }
      }

      // 3. Update customer purchasing frequency and recency
      if (newOrder.customerId && newOrder.customerId !== 'cust_guest') {
        const cust = await db.customers.get(newOrder.customerId);
        if (cust) {
          await db.customers.update(newOrder.customerId, {
            frequency: cust.frequency + 1,
            monetaryTotal: cust.monetaryTotal + newOrder.total,
            averageOrderValue: (cust.monetaryTotal + newOrder.total) / (cust.frequency + 1),
            recencyDays: 0,
            riskScore: Math.max(5, cust.riskScore - 25), // Order resets inactivity churn hazard!
            riskBand: 'Low',
            lastPurchaseDate: new Date().toISOString(),
          });
        }
      }
    });

    await loadDataFromDb();
    clearCart();
    // Non-blocking cloud sync if Supabase configured
    syncOrderToCloud(newOrder).catch((err) => console.warn('Cloud sync skipped:', err));
    return newOrder;
  };

  const createProduct = async (productData: Partial<Product>): Promise<Product> => {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      storeId: DEFAULT_STORE.id,
      sku: productData.sku || `SKU-${Date.now().toString().slice(-4)}`,
      title: productData.title || 'Untitled Product',
      description: productData.description || '',
      category: productData.category || 'General',
      price: productData.price || 0,
      cost: productData.cost || 0,
      stock: productData.stock || 0,
      stockThreshold: productData.stockThreshold || 5,
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      active: true,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.products.add(newProduct);
    const mov: InventoryMovement = {
      id: `mov_init_${newProduct.id}`,
      storeId: newProduct.storeId,
      productId: newProduct.id,
      productTitle: newProduct.title,
      movementType: 'initial',
      quantityDelta: newProduct.stock,
      previousStock: 0,
      newStock: newProduct.stock,
      notes: 'Initial product creation intake',
      isDemo: false,
      timestamp: new Date().toISOString(),
    };
    await db.inventory_movements.add(mov);

    await loadDataFromDb();
    syncProductToCloud(newProduct).catch((err) => console.warn('Cloud sync skipped:', err));
    syncInventoryMovementToCloud(mov).catch((err) => console.warn('Cloud sync skipped:', err));
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await db.products.update(id, { ...updates, updatedAt: new Date().toISOString() });
    await loadDataFromDb();
  };

  const deleteProduct = async (id: string) => {
    await db.products.delete(id);
    await loadDataFromDb();
  };

  const recordInventoryAdjustment = async (
    productId: string,
    delta: number,
    type: 'restock' | 'adjustment' | 'damage',
    notes?: string
  ) => {
    const prod = await db.products.get(productId);
    if (!prod) return;

    const newStock = Math.max(0, prod.stock + delta);
    await db.products.update(productId, { stock: newStock, updatedAt: new Date().toISOString() });

    await db.inventory_movements.add({
      id: `mov_${Date.now()}`,
      storeId: prod.storeId,
      productId: prod.id,
      productTitle: prod.title,
      movementType: type,
      quantityDelta: delta,
      previousStock: prod.stock,
      newStock,
      notes: notes || `Manual stock adjustment (${delta > 0 ? '+' : ''}${delta})`,
      timestamp: new Date().toISOString(),
    });

    await loadDataFromDb();
  };

  const createCampaign = async (campaignData: Partial<Campaign>): Promise<Campaign> => {
    const newCamp: Campaign = {
      id: `camp_${Date.now()}`,
      storeId: DEFAULT_STORE.id,
      title: campaignData.title || 'New Targeted Campaign',
      objective: campaignData.objective || 'winback_churn',
      status: 'active',
      targetSegment: campaignData.targetSegment || 'All Segments',
      targetRiskBand: campaignData.targetRiskBand || 'All',
      targetProductIds: campaignData.targetProductIds || [],
      discountPercent: campaignData.discountPercent || 10,
      promoCode: campaignData.promoCode || `PROMO${Math.floor(Math.random() * 900 + 100)}`,
      messageDraft: campaignData.messageDraft || '',
      channel: 'in_app',
      targetCount: campaignData.targetCount || 5,
      redemptionsCount: 0,
      revenueGenerated: 0,
      createdAt: new Date().toISOString(),
      expiresAt: campaignData.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
    };

    await db.campaigns.add(newCamp);
    await loadDataFromDb();
    return newCamp;
  };

  const approveModelForProduction = async (modelVersionId: string) => {
    await db.transaction('rw', [db.ml_model_versions, db.audit_events], async () => {
      const all = await db.ml_model_versions.toArray();
      for (const m of all) {
        await db.ml_model_versions.update(m.id, { isDeployedToProduction: m.id === modelVersionId });
      }

      await db.audit_events.add({
        id: `aud_${Date.now()}`,
        actor: 'ML Lead Researcher',
        action: 'MODEL_PROMOTED_TO_PRODUCTION',
        entityType: 'ML_MODEL_VERSION',
        entityId: modelVersionId,
        details: `Model ${modelVersionId} successfully deployed as authoritative customer churn prediction engine.`,
        timestamp: new Date().toISOString(),
      });
    });

    await loadDataFromDb();
  };

  const applyModelPredictionsToCustomers = async (
    predictions: { customerId: string; riskScore: number; riskBand: 'Low' | 'Medium' | 'High'; segmentName: string }[]
  ) => {
    await db.transaction('rw', [db.customers, db.audit_events], async () => {
      for (const pred of predictions) {
        const existing = await db.customers.get(pred.customerId);
        if (existing) {
          await db.customers.update(pred.customerId, {
            riskScore: pred.riskScore,
            riskBand: pred.riskBand,
            segmentName: pred.segmentName,
          });
        }
      }

      await db.audit_events.add({
        id: `aud_${Date.now()}`,
        actor: 'ML Lead Researcher',
        action: 'BATCH_PREDICTIONS_APPLIED',
        entityType: 'CUSTOMER',
        entityId: 'all_customers',
        details: `Applied model predictions to ${predictions.length} customers for targeted marketing.`,
        timestamp: new Date().toISOString(),
      });
    });

    await loadDataFromDb();
  };

  const resetDemoData = async (resetDemoOnly = true) => {
    await initializeDatabase(true, resetDemoOnly);
    await loadDataFromDb();
  };

  const factoryResetData = async () => {
    await initializeDatabase(true, false);
    await loadDataFromDb();
  };

  const exportData = async () => {
    return await exportDatabaseAsJSON();
  };

  const importData = async (jsonStr: string) => {
    const res = await importDatabaseFromJSON(jsonStr);
    if (res.success) {
      await loadDataFromDb();
    }
    return res;
  };

  return (
    <AppContext.Provider
      value={{
        workspace,
        setWorkspace,
        currentRoute,
        navigateTo,
        products,
        customers,
        orders,
        campaigns,
        experiments,
        modelVersions,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        appliedPromo,
        applyPromo,
        removePromo,
        createOrder,
        createProduct,
        updateProduct,
        deleteProduct,
        recordInventoryAdjustment,
        createCampaign,
        approveModelForProduction,
        applyModelPredictionsToCustomers,
        theme,
        toggleTheme,
        resetDemoData,
        factoryResetData,
        exportData,
        importData,
        isCloudSyncActive: isSupabaseConfigured(),
        isLoading,
        isVoiceAIOpen,
        setIsVoiceAIOpen,
        openVoiceAI,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
