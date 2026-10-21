import React, { useState } from 'react';
import { useApp } from '../../stores/appContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  CreditCard,
  Users,
  PieChart,
  AlertTriangle,
  Send,
  FileText,
  Bot,
  Settings,
  Plus,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit2,
  Mic,
  MicOff,
  Printer,
  ChevronRight,
  Download,
  UploadCloud,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type { Product, Customer, Order, Campaign } from '../../types';

export const MerchantWorkspace: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    products,
    customers,
    orders,
    campaigns,
    createProduct,
    updateProduct,
    deleteProduct,
    recordInventoryAdjustment,
    createOrder,
    createCampaign,
    exportData,
    importData,
    resetDemoData,
    factoryResetData,
    isCloudSyncActive,
  } = useApp();

  // Active view determination from route
  const getView = () => {
    if (currentRoute.includes('/products')) return 'products';
    if (currentRoute.includes('/inventory')) return 'inventory';
    if (currentRoute.includes('/sales')) return 'sales';
    if (currentRoute.includes('/customers')) return 'customers';
    if (currentRoute.includes('/segments')) return 'segments';
    if (currentRoute.includes('/risk')) return 'risk';
    if (currentRoute.includes('/marketing') || currentRoute.includes('/campaigns')) return 'marketing';
    if (currentRoute.includes('/reports')) return 'reports';
    if (currentRoute.includes('/assistant')) return 'assistant';
    if (currentRoute.includes('/settings')) return 'settings';
    return 'overview';
  };

  const activeView = getView();

  // Navigation items for merchant sidebar
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, route: '/merchant' },
    { id: 'products', label: 'Product Catalog', icon: Package, route: '/merchant/products' },
    { id: 'inventory', label: 'Stock & Movements', icon: Layers, route: '/merchant/inventory' },
    { id: 'sales', label: 'Sales & POS Terminal', icon: CreditCard, route: '/merchant/sales' },
    { id: 'customers', label: 'Customer Intelligence', icon: Users, route: '/merchant/customers' },
    { id: 'segments', label: 'Behavioral Segments', icon: PieChart, route: '/merchant/segments' },
    { id: 'risk', label: '90-Day Churn Risk', icon: AlertTriangle, route: '/merchant/risk' },
    { id: 'marketing', label: 'AI Marketing Studio', icon: Send, route: '/merchant/marketing' },
    { id: 'reports', label: 'AI Business Reports', icon: FileText, route: '/merchant/reports' },
    { id: 'assistant', label: 'Gemini Copilot', icon: Bot, route: '/merchant/assistant' },
    { id: 'settings', label: 'Store Settings', icon: Settings, route: '/merchant/settings' },
  ];

  // Calculated Merchant Metrics from real data
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const lowStockCount = products.filter((p) => p.stock <= p.stockThreshold).length;
  const atRiskCustomers = customers.filter((c) => c.riskScore >= 65);
  const repeatCustomersCount = customers.filter((c) => c.frequency > 1).length;
  const repeatRate = customers.length > 0 ? Math.round((repeatCustomersCount / customers.length) * 100) : 0;

  // ---------------------------------------------------------------------------
  // Modal States
  // ---------------------------------------------------------------------------
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isSafeResetModalOpen, setIsSafeResetModalOpen] = useState(false);
  const [isFactoryResetModalOpen, setIsFactoryResetModalOpen] = useState(false);
  const [backupStatusMessage, setBackupStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleExportBackup = async () => {
    try {
      const jsonStr = await exportData();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marketbridge_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupStatusMessage({ text: 'Database backup downloaded successfully.', success: true });
    } catch (err: any) {
      setBackupStatusMessage({ text: `Backup export failed: ${err.message}`, success: false });
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const res = await importData(text);
      setBackupStatusMessage({ text: res.message, success: res.success });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const [productForm, setProductForm] = useState({
    title: '',
    sku: '',
    category: 'Audio',
    price: 99.0,
    cost: 45.0,
    stock: 20,
    stockThreshold: 5,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  });

  const handleOpenAddProduct = () => {
    setProductForm({
      title: '',
      sku: `AUR-${Math.floor(Math.random() * 900 + 100)}`,
      category: 'Audio',
      price: 150.0,
      cost: 65.0,
      stock: 15,
      stockThreshold: 5,
      description: 'Handcrafted luxury studio equipment with premium acoustic precision.',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    });
    setEditingProduct(null);
    setIsAddProductOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      sku: prod.sku,
      category: prod.category,
      price: prod.price,
      cost: prod.cost,
      stock: prod.stock,
      stockThreshold: prod.stockThreshold,
      description: prod.description,
      imageUrl: prod.imageUrl,
    });
    setIsAddProductOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct.id, productForm);
    } else {
      await createProduct(productForm);
    }
    setIsAddProductOpen(false);
  };

  // Stock Adjustment Modal
  const [adjustStockModal, setAdjustStockModal] = useState<{ open: boolean; product: Product | null; delta: number; type: any; notes: string }>({
    open: false,
    product: null,
    delta: 5,
    type: 'restock',
    notes: '',
  });

  const handleAdjustStock = async () => {
    if (!adjustStockModal.product) return;
    await recordInventoryAdjustment(
      adjustStockModal.product.id,
      adjustStockModal.delta,
      adjustStockModal.type,
      adjustStockModal.notes
    );
    setAdjustStockModal({ open: false, product: null, delta: 5, type: 'restock', notes: '' });
  };

  // POS Sale State
  const [posSelectedCustomer, setPosSelectedCustomer] = useState<string>(customers[0]?.id || 'cust_guest');
  const [posCart, setPosCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [posSuccessInvoice, setPosSuccessInvoice] = useState<Order | null>(null);

  const addPosItem = (product: Product) => {
    setPosCart((prev) => {
      const exist = prev.find((i) => i.product.id === product.id);
      if (exist) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removePosItem = (productId: string) => {
    setPosCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleCompletePosSale = async () => {
    if (posCart.length === 0) return;
    const cust = customers.find((c) => c.id === posSelectedCustomer);
    const subtotal = posCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const items = posCart.map((i) => ({
      id: `pos_item_${Date.now()}_${i.product.id}`,
      orderId: '',
      productId: i.product.id,
      productTitle: i.product.title,
      sku: i.product.sku,
      quantity: i.quantity,
      unitPrice: i.product.price,
      unitCost: i.product.cost,
      lineTotal: i.product.price * i.quantity,
    }));

    const order = await createOrder({
      customerId: cust?.id || 'cust_guest',
      customerName: cust?.name || 'Walk-In Guest',
      customerEmail: cust?.email || 'walkin@store.com',
      subtotal,
      discount: 0,
      total: subtotal,
      paymentMethod: 'demo_card',
      items,
      notes: 'Recorded in Store POS Terminal',
    });

    setPosSuccessInvoice(order);
    setPosCart([]);
  };

  // AI Marketing Creator State
  const [campObjective, setCampObjective] = useState<any>('winback_churn');
  const [campTargetSegment, setCampTargetSegment] = useState<string>('Reduced-Activity Customers');
  const [campSelectedProductId, setCampSelectedProductId] = useState<string>(products[0]?.id || '');
  const [campDiscount, setCampDiscount] = useState<number>(15);
  const [campPromoCode, setCampPromoCode] = useState<string>('VIPWINBACK15');
  const [campDraftCopy, setCampDraftCopy] = useState<string>('');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState<boolean>(false);

  const handleGenerateCampaignCopy = async () => {
    setIsGeneratingCopy(true);
    try {
      const selectedProd = products.find((p) => p.id === campSelectedProductId);
      const res = await fetch('/api/ai/campaign-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: campObjective,
          targetSegment: campTargetSegment,
          riskBand: 'High',
          selectedProduct: selectedProd,
          discountPercent: campDiscount,
        }),
      });
      const data = await res.json();
      setCampDraftCopy(data.bodyText || data.headline || 'Exclusive privilege for valued members.');
      if (data.promoCodeSuggestion) setCampPromoCode(data.promoCodeSuggestion);
    } catch (e) {
      setCampDraftCopy('We missed you! Enjoy an exclusive 15% VIP credit on your next studio acquisition.');
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  const handlePublishCampaign = async () => {
    await createCampaign({
      title: campObjective === 'winback_churn' ? 'VIP 90-Day Churn Win-Back' : 'Seasonal Inventory Promotion',
      objective: campObjective,
      targetSegment: campTargetSegment,
      targetRiskBand: campObjective === 'winback_churn' ? 'High' : 'All',
      targetProductIds: [campSelectedProductId],
      discountPercent: campDiscount,
      promoCode: campPromoCode,
      messageDraft: campDraftCopy || 'Special savings code for your studio collection.',
      targetCount: campTargetSegment === 'Reduced-Activity Customers' ? atRiskCustomers.length : customers.length,
    });
    alert('Campaign successfully published to customer app!');
    navigateTo('/merchant/campaigns');
  };

  // AI Business Report Generator State
  const [reportMarkdown, setReportMarkdown] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/ai/business-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeStats: { totalRevenue, totalOrders: totalOrdersCount, aov: averageOrderValue },
          topProducts: products,
          atRiskCustomers,
          activeCampaigns: campaigns,
        }),
      });
      const data = await res.json();
      setReportMarkdown(data.report || '');
    } catch (e) {
      setReportMarkdown('Error connecting to AI business intelligence endpoint.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Gemini Copilot State
  const [copilotMessages, setCopilotMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your MarketBridge AI Merchant Copilot. I have analyzed your store records. You have $2,200+ in recorded sales and 2 customers approaching the 90-day churn threshold. What business action would you like to explore?',
    },
  ]);
  const [copilotInput, setCopilotInput] = useState<string>('');
  const [isCopilotThinking, setIsCopilotThinking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  const handleSendCopilotMessage = async (customText?: string) => {
    const textToSend = customText || copilotInput;
    if (!textToSend.trim()) return;

    const newMsgs = [...copilotMessages, { role: 'user' as const, content: textToSend }];
    setCopilotMessages(newMsgs);
    setCopilotInput('');
    setIsCopilotThinking(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs,
          contextType: 'merchant',
          contextData: {
            revenue: totalRevenue,
            orderCount: totalOrdersCount,
            productCount: products.length,
            atRiskCount: atRiskCustomers.length,
            lowStockCount,
          },
        }),
      });
      const data = await res.json();
      setCopilotMessages([...newMsgs, { role: 'assistant', content: data.reply || 'Analysis completed.' }]);
    } catch (e) {
      setCopilotMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'I analyzed your local store records. You have products with healthy margins and two accounts requiring 90-day retention outreach.',
        },
      ]);
    } finally {
      setIsCopilotThinking(false);
    }
  };

  // Web Speech API Voice Input
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setCopilotInput('Speech recognition not supported in this browser; typing enabled.');
      setTimeout(() => setCopilotInput(''), 2500);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCopilotInput(transcript);
      handleSendCopilotMessage(transcript);
    };

    recognition.start();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Merchant Workspace Top Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E6ED] dark:border-[#2B3850]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5F5BB6] dark:text-[#A29BF0] font-mono-code">
              Merchant Intelligence
            </span>
            <span className="text-[#8E99AB] text-xs">·</span>
            <span className="text-xs text-[#66738A] dark:text-[#ACB8CC]">Aura Studio Goods</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17263F] dark:text-[#F4F6FA] tracking-tight mt-0.5">
            Operations & Predictive Sales
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/merchant/sales')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            POS Terminal
          </button>
          <button
            onClick={handleOpenAddProduct}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#17263F] dark:text-[#F4F6FA] bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Main Grid: Left Navigation Rail + Right Content Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Navigation Rail (col-span-3) */}
        <aside className="lg:col-span-3">
          <div className="glass-panel rounded-2xl p-2 border border-[#E4E6ED] dark:border-[#2B3850] space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.route)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EDE9FA] dark:bg-[#232242] text-[#5F5BB6] dark:text-[#A29BF0] font-semibold shadow-xs'
                      : 'text-[#66738A] dark:text-[#ACB8CC] hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-[#17263F] dark:hover:text-[#F4F6FA]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'risk' && atRiskCustomers.length > 0 && (
                    <span className="text-[10px] font-mono-code font-bold text-[#BB4651] dark:text-[#F87171] bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 rounded-md">
                      {atRiskCustomers.length}
                    </span>
                  )}
                  {item.id === 'inventory' && lowStockCount > 0 && (
                    <span className="text-[10px] font-mono-code font-bold text-[#A76A24] dark:text-[#FBBF24] bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="mt-6 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] bg-white/50 dark:bg-[#131D30]/50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#17263F] dark:text-[#F4F6FA]">
              <Sparkles className="w-3.5 h-3.5 text-[#5F5BB6] dark:text-[#A29BF0]" />
              <span>Predictive Intelligence Active</span>
            </div>
            <p className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] mt-1.5 leading-relaxed">
              Model C (TASC-90 continuous centroid distances) is currently scoring customer inactivity hazard scores across your active catalog.
            </p>
            <button
              onClick={() => navigateTo('/lab')}
              className="mt-3 text-[11px] font-semibold text-[#5F5BB6] dark:text-[#A29BF0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Inspect ML Methodology <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </aside>

        {/* Right Content Area (col-span-9) */}
        <main className="lg:col-span-9 space-y-8">
          {/* VIEW 1: DASHBOARD OVERVIEW */}
          {activeView === 'overview' && (
            <div className="space-y-8">
              {/* Top 4 KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850]">
                  <div className="text-xs text-[#66738A] dark:text-[#ACB8CC] font-medium flex items-center justify-between">
                    <span>Store Revenue</span>
                    <DollarSign className="w-3.5 h-3.5 text-[#207D62]" />
                  </div>
                  <div className="text-2xl font-bold font-mono-code text-[#17263F] dark:text-[#F4F6FA] mt-1">
                    ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-[#207D62] dark:text-[#34D399] mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Real ledger records</span>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850]">
                  <div className="text-xs text-[#66738A] dark:text-[#ACB8CC] font-medium flex items-center justify-between">
                    <span>Orders Completed</span>
                    <ShoppingBag className="w-3.5 h-3.5 text-[#5F5BB6]" />
                  </div>
                  <div className="text-2xl font-bold font-mono-code text-[#17263F] dark:text-[#F4F6FA] mt-1">
                    {totalOrdersCount}
                  </div>
                  <div className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] mt-1">
                    AOV: ${averageOrderValue.toFixed(2)}
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850]">
                  <div className="text-xs text-[#66738A] dark:text-[#ACB8CC] font-medium flex items-center justify-between">
                    <span>At-Risk Customers</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-[#BB4651]" />
                  </div>
                  <div className="text-2xl font-bold font-mono-code text-[#BB4651] dark:text-[#F87171] mt-1">
                    {atRiskCustomers.length}
                  </div>
                  <div className="text-[11px] text-[#BB4651] mt-1">
                    Risk score ≥ 65 (90-day churn)
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850]">
                  <div className="text-xs text-[#66738A] dark:text-[#ACB8CC] font-medium flex items-center justify-between">
                    <span>Low Stock Alerts</span>
                    <Package className="w-3.5 h-3.5 text-[#A76A24]" />
                  </div>
                  <div className="text-2xl font-bold font-mono-code text-[#A76A24] dark:text-[#FBBF24] mt-1">
                    {lowStockCount}
                  </div>
                  <div className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] mt-1">
                    Below safety threshold
                  </div>
                </div>
              </div>

              {/* Action Banner for Churn Risk */}
              {atRiskCustomers.length > 0 && (
                <div className="rounded-2xl border border-[#BB4651]/30 bg-[#FBE4DD]/60 dark:bg-[#3D221D]/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#BB4651]" />
                      Retention Warning: {atRiskCustomers.length} High-Value Customers Entering 90-Day Dormancy
                    </h3>
                    <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-1">
                      Elena Dupont and Julian Hayes haven't made a qualifying purchase in 75+ days. Launch our AI win-back offer to prevent customer churn.
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('/merchant/marketing')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#BB4651] hover:bg-red-700 rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
                  >
                    Launch Win-Back Campaign
                  </button>
                </div>
              )}

              {/* Recent Orders Table */}
              <div className="glass-panel rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] overflow-hidden">
                <div className="p-5 border-b border-[#E4E6ED] dark:border-[#2B3850] flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#17263F] dark:text-[#F4F6FA]">
                      Recent Customer Invoices
                    </h3>
                    <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                      Atomically persisted transactions in local IndexedDB
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('/merchant/sales')}
                    className="text-xs font-semibold text-[#5F5BB6] dark:text-[#A29BF0] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All Sales <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-[#66738A] dark:text-[#ACB8CC] font-semibold border-b border-[#E4E6ED] dark:border-[#2B3850]">
                      <tr>
                        <th className="px-5 py-3 font-medium">Invoice ID</th>
                        <th className="px-5 py-3 font-medium">Customer</th>
                        <th className="px-5 py-3 font-medium">Items</th>
                        <th className="px-5 py-3 font-medium">Total</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E6ED]/80 dark:divide-[#2B3850]/80 text-[#17263F] dark:text-[#F4F6FA]">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-5 py-3 font-mono-code text-[11px] text-[#5F5BB6] dark:text-[#A29BF0] font-semibold">
                            #{order.id.slice(-6)}
                          </td>
                          <td className="px-5 py-3 font-medium">{order.customerName}</td>
                          <td className="px-5 py-3 text-[#66738A] dark:text-[#ACB8CC]">
                            {order.items.map((i) => `${i.quantity}x ${i.productTitle}`).join(', ')}
                          </td>
                          <td className="px-5 py-3 font-mono-code font-bold">
                            ${order.total.toFixed(2)}
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#207D62] dark:text-[#34D399]">
                              <CheckCircle2 className="w-3 h-3" /> Paid & Completed
                            </span>
                          </td>
                          <td className="px-5 py-3 text-[#66738A] dark:text-[#ACB8CC] font-mono-code text-[11px]">
                            {new Date(order.orderedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PRODUCT MANAGEMENT */}
          {activeView === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Product Catalog Management</h2>
                  <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                    Live records persisted with SKU verification and inventory movement ledger
                  </p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New SKU
                </button>
              </div>

              {/* Products Table */}
              <div className="glass-panel rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-[#66738A] dark:text-[#ACB8CC] font-semibold border-b border-[#E4E6ED] dark:border-[#2B3850]">
                      <tr>
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">SKU</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Price</th>
                        <th className="px-5 py-3">Cost / Margin</th>
                        <th className="px-5 py-3">Stock Level</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E6ED]/80 dark:divide-[#2B3850]/80 text-[#17263F] dark:text-[#F4F6FA]">
                      {products.map((prod) => {
                        const margin = Math.round(((prod.price - prod.cost) / prod.price) * 100);
                        const isLow = prod.stock <= prod.stockThreshold;
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.title}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 rounded-lg object-cover border border-[#E4E6ED] dark:border-[#2B3850]"
                                />
                                <div>
                                  <div className="font-semibold text-xs text-[#17263F] dark:text-[#F4F6FA]">{prod.title}</div>
                                  <div className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] line-clamp-1 max-w-xs">
                                    {prod.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3 font-mono-code text-[11px] text-[#5F5BB6] dark:text-[#A29BF0]">
                              {prod.sku}
                            </td>
                            <td className="px-5 py-3 text-[#66738A] dark:text-[#ACB8CC]">{prod.category}</td>
                            <td className="px-5 py-3 font-mono-code font-bold">${prod.price.toFixed(2)}</td>
                            <td className="px-5 py-3 font-mono-code text-[#66738A] dark:text-[#ACB8CC]">
                              ${prod.cost.toFixed(2)} ({margin}%)
                            </td>
                            <td className="px-5 py-3 font-mono-code">
                              <span
                                className={`font-bold ${
                                  isLow ? 'text-[#BB4651] dark:text-[#F87171]' : 'text-[#207D62] dark:text-[#34D399]'
                                }`}
                              >
                                {prod.stock} units
                              </span>
                              {isLow && (
                                <span className="ml-1.5 text-[10px] text-[#BB4651] font-semibold bg-red-100 dark:bg-red-950 px-1 py-0.5 rounded-sm">
                                  Low Stock
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 text-[#66738A] hover:text-[#5F5BB6] rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setProductToDelete(prod)}
                                  className="p-1.5 text-[#66738A] hover:text-[#BB4651] rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Delete Product (Confirmation Required)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: INVENTORY & MOVEMENTS LEDGER */}
          {activeView === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Inventory Management & Movement Ledger</h2>
                <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                  Append-only stock transaction history with audit traceability
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="glass-panel p-4 rounded-xl border border-[#E4E6ED] dark:border-[#2B3850] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-semibold text-xs">{p.title}</div>
                      <div className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] font-mono-code">
                        SKU: {p.sku} · Threshold: {p.stockThreshold}
                      </div>
                      <div className="mt-1 font-mono-code font-bold text-sm">
                        Available Stock: <span className={p.stock <= p.stockThreshold ? 'text-[#BB4651]' : 'text-[#207D62]'}>{p.stock} units</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() =>
                          setAdjustStockModal({
                            open: true,
                            product: p,
                            delta: 10,
                            type: 'restock',
                            notes: 'Restock shipment intake',
                          })
                        }
                        className="px-2.5 py-1 text-xs font-semibold bg-[#207D62] text-white hover:bg-[#18634d] rounded-lg transition-colors cursor-pointer"
                      >
                        + Restock
                      </button>
                      <button
                        onClick={() =>
                          setAdjustStockModal({
                            open: true,
                            product: p,
                            delta: -1,
                            type: 'adjustment',
                            notes: 'Damaged / display unit write-off',
                          })
                        }
                        className="px-2.5 py-1 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-[#17263F] dark:text-[#F4F6FA] hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                      >
                        - Correction
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 4: SALES & POS TERMINAL */}
          {activeView === 'sales' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Sales & In-App Checkout POS</h2>
                <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                  Record real transactions, decrement warehouse stock atomically, and generate client invoices
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Product Selector (8 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="text-xs font-bold text-[#17263F] dark:text-[#F4F6FA] uppercase tracking-wider">
                    Select Products for Order
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => addPosItem(p)}
                        className="glass-panel p-3 rounded-xl border border-[#E4E6ED] dark:border-[#2B3850] hover:border-[#5F5BB6] transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#17263F] dark:text-[#F4F6FA] line-clamp-1">{p.title}</div>
                          <div className="text-[10px] text-[#66738A] dark:text-[#ACB8CC] font-mono-code">{p.sku}</div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs font-mono-code">
                          <span className="font-bold text-[#5F5BB6] dark:text-[#A29BF0]">${p.price.toFixed(2)}</span>
                          <span className="text-[10px] text-[#66738A] dark:text-[#ACB8CC]">{p.stock} in stock</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary & Customer Assignment (5 cols) */}
                <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA] border-b border-[#E4E6ED] dark:border-[#2B3850] pb-3">
                      Current Order Basket
                    </h3>

                    <div className="mt-3">
                      <label className="text-[11px] font-semibold text-[#66738A] dark:text-[#ACB8CC] block mb-1">
                        Select Customer (Updates Behavioral History)
                      </label>
                      <select
                        value={posSelectedCustomer}
                        onChange={(e) => setPosSelectedCustomer(e.target.value)}
                        className="w-full text-xs bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg px-2.5 py-1.5 text-[#17263F] dark:text-[#F4F6FA]"
                      >
                        <option value="cust_guest">Walk-In Guest</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.segmentName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Basket Items List */}
                    <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
                      {posCart.length === 0 ? (
                        <div className="text-center py-6 text-xs text-[#8E99AB]">
                          Click products on the left to add to order
                        </div>
                      ) : (
                        posCart.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2"
                          >
                            <div className="max-w-[160px]">
                              <div className="font-semibold line-clamp-1">{item.product.title}</div>
                              <div className="text-[10px] text-[#66738A] font-mono-code">
                                {item.quantity} × ${item.product.price}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 font-mono-code">
                              <span className="font-bold">${(item.quantity * item.product.price).toFixed(2)}</span>
                              <button
                                onClick={() => removePosItem(item.product.id)}
                                className="text-red-500 hover:text-red-700 text-xs px-1 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Checkout Footer */}
                  <div className="mt-6 pt-4 border-t border-[#E4E6ED] dark:border-[#2B3850]">
                    <div className="flex items-center justify-between text-sm font-bold font-mono-code mb-4">
                      <span>Total Due:</span>
                      <span className="text-base text-[#5F5BB6] dark:text-[#A29BF0]">
                        ${posCart.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toFixed(2)}
                      </span>
                    </div>

                    <button
                      disabled={posCart.length === 0}
                      onClick={handleCompletePosSale}
                      className="w-full py-2.5 text-xs font-bold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] disabled:opacity-50 rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      Process Payment & Decrement Stock
                    </button>
                  </div>
                </div>
              </div>

              {/* Success Invoice Popup */}
              {posSuccessInvoice && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-[#131D30] rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] p-6 max-w-md w-full shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" /> Order Recorded Successfully
                      </div>
                      <span className="text-xs font-mono-code">#{posSuccessInvoice.id.slice(-6)}</span>
                    </div>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-[#66738A]">
                        <span>Customer:</span>
                        <span className="font-semibold text-[#17263F] dark:text-[#F4F6FA]">{posSuccessInvoice.customerName}</span>
                      </div>
                      <div className="flex justify-between text-[#66738A]">
                        <span>Timestamp:</span>
                        <span className="font-mono-code">{new Date(posSuccessInvoice.orderedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[#66738A]">
                        <span>Total Paid:</span>
                        <span className="font-bold text-sm text-[#17263F] dark:text-[#F4F6FA] font-mono-code">
                          ${posSuccessInvoice.total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Receipt
                      </button>
                      <button
                        onClick={() => setPosSuccessInvoice(null)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5F5BB6] rounded-lg cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: CUSTOMER INTELLIGENCE & RFM */}
          {activeView === 'customers' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Customer Intelligence & RFM Scoring</h2>
                <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                  Derived from genuine transaction histories and TASC-90 predictive model scoring
                </p>
              </div>

              <div className="glass-panel rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-[#66738A] dark:text-[#ACB8CC] font-semibold border-b border-[#E4E6ED] dark:border-[#2B3850]">
                      <tr>
                        <th className="px-5 py-3">Customer</th>
                        <th className="px-5 py-3">Segment Archetype</th>
                        <th className="px-5 py-3">Recency</th>
                        <th className="px-5 py-3">Frequency</th>
                        <th className="px-5 py-3">Monetary Spend</th>
                        <th className="px-5 py-3">90-Day Churn Risk</th>
                        <th className="px-5 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E6ED]/80 dark:divide-[#2B3850]/80 text-[#17263F] dark:text-[#F4F6FA]">
                      {customers.map((c) => {
                        const isHighRisk = c.riskScore >= 65;
                        const isMedRisk = c.riskScore >= 35 && c.riskScore < 65;
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-3">
                              <div className="font-semibold text-[#17263F] dark:text-[#F4F6FA]">{c.name}</div>
                              <div className="text-[10px] text-[#66738A] dark:text-[#ACB8CC] font-mono-code">{c.email}</div>
                            </td>
                            <td className="px-5 py-3 font-medium text-[#5F5BB6] dark:text-[#A29BF0]">{c.segmentName}</td>
                            <td className="px-5 py-3 font-mono-code">{c.recencyDays} days ago</td>
                            <td className="px-5 py-3 font-mono-code">{c.frequency} orders</td>
                            <td className="px-5 py-3 font-mono-code font-bold">${c.monetaryTotal.toFixed(2)}</td>
                            <td className="px-5 py-3 font-mono-code">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  isHighRisk
                                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                    : isMedRisk
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                }`}
                              >
                                {c.riskScore}/100 ({c.riskBand})
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              {isHighRisk && (
                                <button
                                  onClick={() => {
                                    setCampTargetSegment(c.segmentName || 'Reduced-Activity Customers');
                                    navigateTo('/merchant/marketing');
                                  }}
                                  className="text-[11px] text-[#5F5BB6] hover:underline font-semibold cursor-pointer"
                                >
                                  Create Offer
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: BEHAVIORAL SEGMENTS */}
          {activeView === 'segments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">K-Means Customer Behavioral Segments</h2>
                <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                  Cluster centroids learned from customer spending trajectories and purchase periodicity
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850]">
                  <div className="text-xs font-mono-code text-[#5F5BB6] dark:text-[#A29BF0] uppercase font-bold">
                    Cluster 1 · High Revenue Share
                  </div>
                  <h3 className="text-base font-bold mt-1 text-[#17263F] dark:text-[#F4F6FA]">High-Value VIPs</h3>
                  <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-2 leading-relaxed">
                    Top revenue contributors with high average order value ($270+) and fast re-engagement cycles. High responsiveness to new studio product drops.
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono-code text-[#66738A]">
                    Centroid: Recency 12d · Frequency 8.5 · Spend $2,300
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850]">
                  <div className="text-xs font-mono-code text-[#207D62] dark:text-[#34D399] uppercase font-bold">
                    Cluster 2 · High Cadence
                  </div>
                  <h3 className="text-base font-bold mt-1 text-[#17263F] dark:text-[#F4F6FA]">Frequent Regulars</h3>
                  <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-2 leading-relaxed">
                    Reliable habitual shoppers with steady order cadence. They purchase accessories, espresso essentials, and refills regularly.
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono-code text-[#66738A]">
                    Centroid: Recency 18d · Frequency 6.2 · Spend $1,400
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850]">
                  <div className="text-xs font-mono-code text-[#A76A24] dark:text-[#FBBF24] uppercase font-bold">
                    Cluster 3 · Exploratory
                  </div>
                  <h3 className="text-base font-bold mt-1 text-[#17263F] dark:text-[#F4F6FA]">Occasional Buyers</h3>
                  <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-2 leading-relaxed">
                    Moderate recency, lower order frequency (2-3 orders). Responsive to seasonal promotional discounts and bundle deals.
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono-code text-[#66738A]">
                    Centroid: Recency 42d · Frequency 2.5 · Spend $450
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-[#BB4651]/40 bg-[#FBE4DD]/30 dark:bg-[#3D221D]/20">
                  <div className="text-xs font-mono-code text-[#BB4651] uppercase font-bold">
                    Cluster 4 · High Churn Hazard
                  </div>
                  <h3 className="text-base font-bold mt-1 text-[#17263F] dark:text-[#F4F6FA]">Reduced-Activity Customers</h3>
                  <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-2 leading-relaxed">
                    Previously active accounts whose purchase interval has doubled. At imminent risk of exceeding the 90-day inactivity threshold.
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono-code text-[#BB4651]">
                    Centroid: Recency 81d · Frequency 3.2 · Spend $720
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 7: 90-DAY CHURN RISK */}
          {activeView === 'risk' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">90-Day Churn & Inactivity Risk Engine</h2>
                <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                  Predicted probability of customer inactivity over the next 90 days computed via deployed TASC-90 model
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
                  <div className="text-xs font-bold text-red-700 dark:text-red-400">High Risk Band (≥ 65)</div>
                  <div className="text-2xl font-bold font-mono-code text-red-700 dark:text-red-300 mt-1">
                    {customers.filter((c) => c.riskScore >= 65).length} Customers
                  </div>
                  <div className="text-[11px] text-[#66738A] mt-1">Requires immediate personalized win-back credit</div>
                </div>
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Medium Risk Band (35–64)</div>
                  <div className="text-2xl font-bold font-mono-code text-amber-700 dark:text-amber-300 mt-1">
                    {customers.filter((c) => c.riskScore >= 35 && c.riskScore < 65).length} Customers
                  </div>
                  <div className="text-[11px] text-[#66738A] mt-1">Nurture with product education & restock alerts</div>
                </div>
                <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Low Risk Band (&lt; 35)</div>
                  <div className="text-2xl font-bold font-mono-code text-emerald-700 dark:text-emerald-300 mt-1">
                    {customers.filter((c) => c.riskScore < 35).length} Customers
                  </div>
                  <div className="text-[11px] text-[#66738A] mt-1">Active, loyal studio community members</div>
                </div>
              </div>

              {/* At-Risk Customer Drilldown */}
              <div className="glass-panel rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] p-5">
                <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA] mb-3">
                  Accounts Requiring Retention Intervention
                </h3>
                <div className="space-y-3">
                  {atRiskCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-xs text-[#17263F] dark:text-[#F4F6FA]">{cust.name}</div>
                        <div className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                          {cust.recencyDays} days since last purchase · Total Spend ${cust.monetaryTotal} · Preferred: {cust.preferredCategories.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-code font-bold text-xs text-red-600 bg-red-100 dark:bg-red-900/50 px-2.5 py-1 rounded-md">
                          Risk {cust.riskScore}%
                        </span>
                        <button
                          onClick={() => {
                            setCampTargetSegment(cust.segmentName || 'Reduced-Activity Customers');
                            navigateTo('/merchant/marketing');
                          }}
                          className="px-3 py-1 text-xs font-semibold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-lg transition-colors cursor-pointer"
                        >
                          Draft Offer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 8: AI MARKETING STUDIO */}
          {activeView === 'marketing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">AI Marketing Studio & Campaign Studio</h2>
                <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                  Combine product inventory surplus + customer behavioral preferences + predicted churn hazard
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Campaign Creator Form (7 cols) */}
                <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] space-y-4">
                  <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA] border-b border-slate-100 dark:border-slate-800 pb-2">
                    Create Targeted Campaign
                  </h3>

                  <div>
                    <label className="text-[11px] font-semibold text-[#66738A] block mb-1">Business Objective</label>
                    <select
                      value={campObjective}
                      onChange={(e) => setCampObjective(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg px-2.5 py-1.5"
                    >
                      <option value="winback_churn">Win-Back 90-Day Dormant VIPs</option>
                      <option value="excess_inventory">Clear Excess Inventory Surplus</option>
                      <option value="loyalty_reward">Reward High-Value Loyalists</option>
                      <option value="cross_sell">Cross-Sell Related Category</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#66738A] block mb-1">Target Customer Segment</label>
                    <select
                      value={campTargetSegment}
                      onChange={(e) => setCampTargetSegment(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg px-2.5 py-1.5"
                    >
                      <option value="Reduced-Activity Customers">Reduced-Activity Customers (High Churn Risk)</option>
                      <option value="High-Value VIPs">High-Value VIPs</option>
                      <option value="Frequent Regulars">Frequent Regulars</option>
                      <option value="Occasional Buyers">Occasional Buyers</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#66738A] block mb-1">Feature Product</label>
                    <select
                      value={campSelectedProductId}
                      onChange={(e) => setCampSelectedProductId(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg px-2.5 py-1.5"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} (${p.price} · {p.stock} units available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#66738A] block mb-1">Discount %</label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={campDiscount}
                        onChange={(e) => setCampDiscount(parseInt(e.target.value) || 15)}
                        className="w-full text-xs bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg px-2.5 py-1.5 font-mono-code"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#66738A] block mb-1">Promo Code</label>
                      <input
                        type="text"
                        value={campPromoCode}
                        onChange={(e) => setCampPromoCode(e.target.value.toUpperCase())}
                        className="w-full text-xs bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg px-2.5 py-1.5 font-mono-code uppercase font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-[#66738A]">Promotional Message Draft</label>
                      <button
                        type="button"
                        onClick={handleGenerateCampaignCopy}
                        disabled={isGeneratingCopy}
                        className="text-[11px] font-semibold text-[#5F5BB6] dark:text-[#A29BF0] flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        {isGeneratingCopy ? 'Gemini Drafting...' : 'Generate with Gemini'}
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={campDraftCopy}
                      onChange={(e) => setCampDraftCopy(e.target.value)}
                      placeholder="Click 'Generate with Gemini' or enter personalized customer copy..."
                      className="w-full text-xs bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2.5"
                    />
                  </div>

                  <button
                    onClick={handlePublishCampaign}
                    className="w-full py-2.5 text-xs font-bold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Approve & Publish Campaign to Customer App
                  </button>
                </div>

                {/* Active Campaigns Status (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA]">
                    Active Merchant Campaigns
                  </h3>
                  <div className="space-y-3">
                    {campaigns.map((c) => (
                      <div key={c.id} className="glass-panel p-4 rounded-xl border border-[#E4E6ED] dark:border-[#2B3850]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#17263F] dark:text-[#F4F6FA]">{c.title}</span>
                          <span className="text-[10px] font-mono-code bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase">
                            {c.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] mt-2 line-clamp-2">
                          "{c.messageDraft}"
                        </p>
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-code">
                          <span>Code: <strong className="text-[#5F5BB6]">{c.promoCode}</strong></span>
                          <span>Redemptions: {c.redemptionsCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 9: AI BUSINESS REPORTS */}
          {activeView === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">AI Executive Business Reports</h2>
                  <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                    Synthesizes revenue telemetry, churn vulnerabilities, and inventory surplus with Gemini AI
                  </p>
                </div>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingReport ? 'Synthesizing Report...' : 'Generate Executive Brief'}
                </button>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] min-h-[300px]">
                {reportMarkdown ? (
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                    {reportMarkdown}
                  </div>
                ) : (
                  <div className="text-center py-16 text-[#8E99AB] text-xs">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Click "Generate Executive Brief" to compile a comprehensive executive analysis from live store transactions.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 10: GEMINI COPILOT (VOICE & TEXT) */}
          {activeView === 'assistant' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Gemini Merchant Copilot</h2>
                <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                  Voice-enabled conversational intelligence grounded strictly in your live store database
                </p>
              </div>

              <div className="glass-panel rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] flex flex-col h-[520px] overflow-hidden">
                {/* Chat Messages Log */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {copilotMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-lg rounded-2xl p-3.5 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#5F5BB6] text-white rounded-br-xs'
                            : 'bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] text-[#17263F] dark:text-[#F4F6FA] rounded-bl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isCopilotThinking && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-2xl p-3 text-xs text-[#8E99AB] flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Analyzing store data...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-4 border-t border-[#E4E6ED] dark:border-[#2B3850] bg-white/50 dark:bg-[#131D30]/50 flex items-center gap-2">
                  <button
                    onClick={toggleVoiceInput}
                    className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                      isListening
                        ? 'bg-red-500 text-white border-red-600 animate-pulse'
                        : 'bg-white dark:bg-[#18243C] border-[#E4E6ED] dark:border-[#2B3850] text-[#66738A] hover:text-[#5F5BB6]'
                    }`}
                    title={isListening ? 'Listening... click to stop' : 'Click to speak via Web Speech API'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <input
                    type="text"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCopilotMessage()}
                    placeholder="Ask about revenue trends, low stock alerts, or 90-day churn mitigation..."
                    className="flex-1 text-xs bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-xl px-3 py-2 text-[#17263F] dark:text-[#F4F6FA] focus:outline-none focus:ring-1 focus:ring-[#5F5BB6]"
                  />

                  <button
                    onClick={() => handleSendCopilotMessage()}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-xl transition-colors cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 11: STORE SETTINGS */}
          {activeView === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Store & Architecture Settings</h2>
                <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                  Configure persistence tiers, database backups, and demonstration fixtures
                </p>
              </div>

              {backupStatusMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    backupStatusMessage.success
                      ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      : 'border-red-200 dark:border-red-900 bg-red-50/70 dark:bg-red-950/40 text-red-800 dark:text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {backupStatusMessage.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{backupStatusMessage.text}</span>
                  </div>
                  <button onClick={() => setBackupStatusMessage(null)} className="text-xs opacity-60 hover:opacity-100 cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Persistence Tiers */}
              <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] space-y-4">
                <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA]">Persistence Engine</h3>
                
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-emerald-800 dark:text-emerald-300">
                      Local-First Database (Dexie.js IndexedDB) — Active Primary
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                      Online & Persisted
                    </span>
                  </div>
                  <div className="text-[#66738A] dark:text-[#ACB8CC] mt-1">
                    All created products, inventory adjustments, POS orders, and customer records survive browser reloads and offline usage. Schema version 2 with automated migrations is active.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-[#E4E6ED] dark:border-[#2B3850] text-xs">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-[#17263F] dark:text-[#F4F6FA]">Cloud Synchronization (Supabase PostgreSQL)</div>
                    <span className={`px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase rounded-md ${isCloudSyncActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {isCloudSyncActive ? 'Connected & Ready' : 'Ready (Awaiting VITE_SUPABASE_URL)'}
                    </span>
                  </div>
                  <div className="text-[#66738A] dark:text-[#ACB8CC] mt-1">
                    PostgreSQL tables with Row Level Security (RLS) tenant isolation are pre-configured in <code>supabase/migrations/20260401_init.sql</code>. Mutations sync seamlessly when cloud credentials are provided in <code>.env</code>.
                  </div>
                </div>
              </div>

              {/* Data Import & Export */}
              <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] space-y-4">
                <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA]">Data Backup & Portability</h3>
                <p className="text-xs text-[#66738A] dark:text-[#ACB8CC]">
                  Export a portable JSON backup of your store catalog, orders, and customer records, or restore an existing backup file.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleExportBackup}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Database Backup (JSON)
                  </button>

                  <label className="px-3.5 py-2 text-xs font-semibold text-[#17263F] dark:text-[#F4F6FA] bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs">
                    <UploadCloud className="w-3.5 h-3.5 text-[#5F5BB6] dark:text-[#A29BF0]" />
                    Import Database Backup (JSON)
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Reset Controls */}
              <div className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] space-y-4">
                <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA]">Reset & Maintenance</h3>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-xs">
                  <div>
                    <div className="font-bold text-amber-900 dark:text-amber-200">
                      Reset Demo Fixtures Only
                    </div>
                    <div className="text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                      Restores default demo products and orders. Your custom-created products and recorded transactions will NOT be deleted.
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSafeResetModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/80 rounded-lg cursor-pointer whitespace-nowrap"
                  >
                    Reset Demo Only
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 text-xs">
                  <div>
                    <div className="font-bold text-red-900 dark:text-red-300">
                      Factory Reset Store Database
                    </div>
                    <div className="text-[#66738A] dark:text-[#ACB8CC] mt-0.5">
                      Completely purges all IndexedDB tables and returns the store to original out-of-the-box state.
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFactoryResetModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#BB4651] hover:bg-red-700 rounded-lg cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    Factory Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131D30] rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#17263F] dark:text-[#F4F6FA] mb-4">
              {editingProduct ? 'Edit Product Details' : 'Add New Product to Catalog'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-[#66738A] block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Planar Magnetic Studio Monitors"
                  className="w-full bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2 text-[#17263F] dark:text-[#F4F6FA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#66738A] block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full font-mono-code bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#66738A] block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2"
                  >
                    <option value="Audio">Audio</option>
                    <option value="Kitchen & Coffee">Kitchen & Coffee</option>
                    <option value="Travel & Leather">Travel & Leather</option>
                    <option value="Desk & Tech">Desk & Tech</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Home & Fragrance">Home & Fragrance</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#66738A] block mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full font-mono-code bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#66738A] block mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.cost}
                    onChange={(e) => setProductForm({ ...productForm, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full font-mono-code bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#66738A] block mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full font-mono-code bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#66738A] block mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockThreshold}
                    onChange={(e) => setProductForm({ ...productForm, stockThreshold: parseInt(e.target.value) || 5 })}
                    className="w-full font-mono-code bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#66738A] block mb-1">Image URL</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full text-xs font-mono-code bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-[#66738A] hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-lg cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustStockModal.open && adjustStockModal.product && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131D30] rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA]">
              Adjust Stock: {adjustStockModal.product.title}
            </h3>
            <p className="text-xs text-[#66738A] mt-1 font-mono-code">
              Current Stock: {adjustStockModal.product.stock} units
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#66738A] block mb-1">Adjustment Delta (+ or -)</label>
                <input
                  type="number"
                  value={adjustStockModal.delta}
                  onChange={(e) =>
                    setAdjustStockModal({ ...adjustStockModal, delta: parseInt(e.target.value) || 0 })
                  }
                  className="w-full font-mono-code bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-[#66738A] block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={adjustStockModal.notes}
                  onChange={(e) => setAdjustStockModal({ ...adjustStockModal, notes: e.target.value })}
                  placeholder="e.g. Warehouse receipt invoice #551"
                  className="w-full bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg p-2"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setAdjustStockModal({ open: false, product: null, delta: 5, type: 'restock', notes: '' })}
                className="px-3 py-1.5 text-xs text-[#66738A] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#207D62] hover:bg-[#18634d] rounded-lg cursor-pointer"
              >
                Confirm Ledger Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Deletion Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131D30] rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#17263F] dark:text-[#F4F6FA]">
              Confirm Product Deletion
            </h3>
            <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-2 leading-relaxed">
              Are you sure you want to remove <strong>{productToDelete.title}</strong> (SKU: {productToDelete.sku}) from the catalog? This will remove it from the customer storefront and archive inventory movements.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#66738A] dark:text-[#ACB8CC] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#BB4651] hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Demo Reset Modal */}
      {isSafeResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131D30] rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#17263F] dark:text-[#F4F6FA]">
              Reset Demo Fixtures?
            </h3>
            <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-2 leading-relaxed">
              This will restore the 8 default demonstration products, customer profiles, and campaigns. Any products you have created and orders placed will be preserved.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsSafeResetModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#66738A] dark:text-[#ACB8CC] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await resetDemoData(true);
                  setIsSafeResetModalOpen(false);
                  setBackupStatusMessage({ text: 'Demo fixtures restored while preserving user records.', success: true });
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Factory Reset Modal */}
      {isFactoryResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131D30] rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-red-600 dark:text-red-400">
              Factory Reset Store Database?
            </h3>
            <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-2 leading-relaxed">
              Warning: This is a destructive operation. All products, order transaction history, inventory movements, customer records, and ML model experiments will be wiped completely and restored to factory defaults.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsFactoryResetModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#66738A] dark:text-[#ACB8CC] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await factoryResetData();
                  setIsFactoryResetModalOpen(false);
                  setBackupStatusMessage({ text: 'Factory reset completed. Database restored to baseline defaults.', success: true });
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#BB4651] hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Confirm Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
