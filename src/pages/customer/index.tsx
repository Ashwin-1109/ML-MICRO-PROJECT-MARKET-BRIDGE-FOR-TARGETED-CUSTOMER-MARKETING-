import React, { useState } from 'react';
import { useApp } from '../../stores/appContext';
import {
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  Tag,
  Star,
  Clock,
  Heart,
  Bot,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import type { Product, Campaign } from '../../types';

export const CustomerWorkspace: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    products,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedPromo,
    applyPromo,
    removePromo,
    createOrder,
    orders,
    campaigns,
    customers,
  } = useApp();

  // Current customer profile simulation
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_001');
  const activeCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Active view determination
  const getView = () => {
    if (currentRoute.includes('/shop')) return 'shop';
    if (currentRoute.includes('/cart') || currentRoute.includes('/checkout')) return 'cart';
    if (currentRoute.includes('/orders')) return 'orders';
    if (currentRoute.includes('/recommendations')) return 'recommendations';
    if (currentRoute.includes('/offers')) return 'offers';
    if (currentRoute.includes('/assistant')) return 'assistant';
    return 'home';
  };

  const activeView = getView();

  // Shop filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Categories
  const categories = ['All', 'Audio', 'Kitchen & Coffee', 'Travel & Leather', 'Desk & Tech', 'Lighting', 'Home & Fragrance', 'Apparel'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedPromo ? (cartSubtotal * appliedPromo.discountPercent) / 100 : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    const result = applyPromo(promoCodeInput);
    setPromoMessage({ text: result.message, success: result.success });
  };

  // Checkout handling
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<any>(null);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const items = cart.map((i) => ({
        id: `ord_item_${Date.now()}_${i.product.id}`,
        orderId: '',
        productId: i.product.id,
        productTitle: i.product.title,
        sku: i.product.sku,
        quantity: i.quantity,
        unitPrice: i.product.price,
        unitCost: i.product.cost,
        lineTotal: i.product.price * i.quantity,
      }));

      const newOrder = await createOrder({
        customerId: activeCustomer?.id || 'cust_guest',
        customerName: activeCustomer?.name || 'Studio Guest',
        customerEmail: activeCustomer?.email || 'guest@example.com',
        subtotal: cartSubtotal,
        discount: discountAmount,
        total: cartTotal,
        paymentMethod: 'demo_card',
        items,
        notes: appliedPromo ? `Applied Promo: ${appliedPromo.promoCode}` : 'Online Customer Checkout',
      });

      setCheckoutSuccessOrder(newOrder);
    } catch (e) {
      console.error('Checkout error:', e);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // AI Shopping Concierge Chat State
  const [assistantMessages, setAssistantMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `Welcome to Aura Studio, ${activeCustomer?.name || 'valued guest'}! I can help you discover studio gear, find accessories compatible with your setup, or recommend gifts within your budget. What can I curate for you today?`,
    },
  ]);
  const [assistantInput, setAssistantInput] = useState('');
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  const handleSendAssistant = async () => {
    if (!assistantInput.trim()) return;
    const newMsgs = [...assistantMessages, { role: 'user' as const, content: assistantInput }];
    setAssistantMessages(newMsgs);
    setAssistantInput('');
    setIsAssistantThinking(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs,
          contextType: 'customer',
          contextData: {
            catalog: products.map((p) => ({ title: p.title, category: p.category, price: p.price, inStock: p.stock > 0 })),
            customerName: activeCustomer?.name,
            preferredCategories: activeCustomer?.preferredCategories,
          },
        }),
      });
      const data = await res.json();
      setAssistantMessages([...newMsgs, { role: 'assistant', content: data.reply || 'Here is what I found for you.' }]);
    } catch (e) {
      setAssistantMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'Our Studio Reference Headphones and Precision Espresso Kit are our most popular artisan items. Both are in stock and ready to ship.',
        },
      ]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Customer Header & Navigation Sub-strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E6ED] dark:border-[#2B3850]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#207D62] dark:text-[#34D399] font-mono-code">
              Personalized Storefront
            </span>
            <span className="text-[#8E99AB] text-xs">·</span>
            <span className="text-xs text-[#66738A] dark:text-[#ACB8CC]">Aura Studio Goods</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17263F] dark:text-[#F4F6FA] tracking-tight mt-0.5">
            Artisan Studio Objects & Gear
          </h1>
        </div>

        {/* Customer Profile Selector (For demonstration of personalized recommendations) */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-[#66738A] dark:text-[#ACB8CC] hidden sm:inline">Viewing as:</div>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="text-xs bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg px-2.5 py-1.5 text-[#17263F] dark:text-[#F4F6FA] font-medium"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.segmentName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Workspace Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 border-b border-[#E4E6ED] dark:border-[#2B3850]">
        {[
          { id: 'home', label: 'Storefront', route: '/customer' },
          { id: 'shop', label: 'All Products', route: '/customer/shop' },
          { id: 'recommendations', label: 'Personalized For You', route: '/customer/recommendations' },
          { id: 'offers', label: 'Member Offers', route: '/customer/offers' },
          { id: 'cart', label: `Cart (${cart.reduce((s, i) => s + i.quantity, 0)})`, route: '/customer/cart' },
          { id: 'orders', label: 'Order History', route: '/customer/orders' },
          { id: 'assistant', label: 'AI Concierge', route: '/customer/assistant' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigateTo(tab.route)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeView === tab.id
                ? 'bg-[#DDF2E8] dark:bg-[#163328] text-[#207D62] dark:text-[#34D399] font-bold'
                : 'text-[#66738A] dark:text-[#ACB8CC] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* VIEW: HOME OVERVIEW */}
      {activeView === 'home' && (
        <div className="mt-8 space-y-12">
          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden glass-panel border border-[#E4E6ED] dark:border-[#2B3850] p-8 sm:p-12">
            <div className="max-w-xl">
              <span className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#207D62] dark:text-[#34D399]">
                Spring Studio Edit 2026
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl text-[#17263F] dark:text-[#F4F6FA] font-normal mt-2 leading-tight">
                Designed for Focus. Engineered for Sound.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-[#66738A] dark:text-[#ACB8CC] leading-relaxed">
                Discover tactile acoustic monitors, precision machined espresso tools, and Italian vegetable-tanned leather essentials.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => navigateTo('/customer/shop')}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#207D62] hover:bg-[#18634d] rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  Explore Studio Catalog
                </button>
                <button
                  onClick={() => navigateTo('/customer/recommendations')}
                  className="px-4 py-2.5 text-xs font-semibold text-[#17263F] dark:text-[#F4F6FA] bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                >
                  Curated For You
                </button>
              </div>
            </div>
          </div>

          {/* Active Offers Highlight */}
          {campaigns.filter((c) => c.status === 'active').length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[#17263F] dark:text-[#F4F6FA] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#5F5BB6]" />
                  Active Studio Privileges & Member Codes
                </h3>
                <button
                  onClick={() => navigateTo('/customer/offers')}
                  className="text-xs font-semibold text-[#207D62] hover:underline cursor-pointer"
                >
                  View All Offers
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns
                  .filter((c) => c.status === 'active')
                  .slice(0, 2)
                  .map((camp) => (
                    <div
                      key={camp.id}
                      className="p-4 rounded-2xl glass-panel border border-[#E4E6ED] dark:border-[#2B3850] flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#17263F] dark:text-[#F4F6FA]">{camp.title}</div>
                        <div className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] mt-0.5">{camp.messageDraft}</div>
                      </div>
                      <button
                        onClick={() => {
                          applyPromo(camp.promoCode);
                          navigateTo('/customer/cart');
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#5F5BB6] rounded-lg shrink-0 cursor-pointer"
                      >
                        Apply {camp.promoCode}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Featured Product Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#17263F] dark:text-[#F4F6FA]">Featured Studio Essentials</h3>
              <button
                onClick={() => navigateTo('/customer/shop')}
                className="text-xs font-semibold text-[#207D62] dark:text-[#34D399] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Browse Full Collection <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl glass-panel border border-[#E4E6ED] dark:border-[#2B3850] p-4 flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold bg-white/90 dark:bg-[#131D30]/90 text-[#17263F] dark:text-[#F4F6FA] backdrop-blur-xs">
                        {product.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#17263F] dark:text-[#F4F6FA] line-clamp-1">{product.title}</h4>
                    <p className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-bold font-mono-code text-[#17263F] dark:text-[#F4F6FA]">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#207D62] hover:bg-[#18634d] rounded-lg transition-colors cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: CATALOGUE (SHOP) */}
      {activeView === 'shop' && (
        <div className="mt-6 space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E99AB]" />
              <input
                type="text"
                placeholder="Search studio headphones, espresso kits, leather..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-xl text-[#17263F] dark:text-[#F4F6FA] focus:outline-none focus:ring-1 focus:ring-[#207D62]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#207D62] text-white font-semibold'
                      : 'bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] text-[#66738A] hover:text-[#17263F]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const inStock = product.stock > 0;
              return (
                <div
                  key={product.id}
                  className="rounded-2xl glass-panel border border-[#E4E6ED] dark:border-[#2B3850] p-4 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono-code font-bold bg-white/90 dark:bg-[#131D30]/90 text-[#17263F] dark:text-[#F4F6FA] backdrop-blur-xs">
                        {product.category}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#17263F] dark:text-[#F4F6FA] line-clamp-1">{product.title}</h4>
                    <p className="text-[11px] text-[#66738A] dark:text-[#ACB8CC] mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold font-mono-code text-[#17263F] dark:text-[#F4F6FA]">
                        ${product.price.toFixed(2)}
                      </div>
                      <div className="text-[10px] font-mono-code text-[#66738A]">
                        {inStock ? `${product.stock} in stock` : 'Out of Stock'}
                      </div>
                    </div>
                    <button
                      disabled={!inStock}
                      onClick={() => addToCart(product, 1)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#207D62] hover:bg-[#18634d] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: PERSONALIZED RECOMMENDATIONS */}
      {activeView === 'recommendations' && (
        <div className="mt-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5F5BB6] uppercase tracking-wider font-mono-code">
              <Sparkles className="w-4 h-4" />
              Content-Based & Category Affinity Recommender
            </div>
            <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA] mt-1">
              Curated for {activeCustomer?.name}
            </h2>
            <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-1 max-w-2xl leading-relaxed">
              Transparent suggestions derived from your historical purchase category preferences ({activeCustomer?.preferredCategories?.join(', ')}), repeat order intervals, and live studio availability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {products
              .filter((p) => activeCustomer?.preferredCategories?.includes(p.category) || p.price > 200)
              .slice(0, 3)
              .map((prod) => (
                <div key={prod.id} className="glass-panel p-4 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] flex flex-col justify-between">
                  <div>
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="w-full aspect-video object-cover rounded-xl mb-3"
                    />
                    <div className="text-[10px] font-semibold text-[#5F5BB6] uppercase font-mono-code">
                      Affinity Match · {prod.category}
                    </div>
                    <h3 className="text-xs font-bold text-[#17263F] dark:text-[#F4F6FA] mt-1">{prod.title}</h3>
                    <p className="text-[11px] text-[#66738A] mt-1 line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-mono-code font-bold text-sm">${prod.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(prod, 1)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#207D62] rounded-lg cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VIEW: SHOPPING CART & CHECKOUT */}
      {activeView === 'cart' && (
        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Shopping Bag & Checkout</h2>

          {cart.length === 0 ? (
            <div className="text-center py-16 glass-panel rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850]">
              <ShoppingBag className="w-10 h-10 mx-auto text-[#8E99AB] mb-3" />
              <div className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA]">Your bag is currently empty</div>
              <p className="text-xs text-[#66738A] mt-1">Explore our catalog of artisan studio equipment.</p>
              <button
                onClick={() => navigateTo('/customer/shop')}
                className="mt-4 px-4 py-2 text-xs font-bold text-white bg-[#207D62] rounded-xl cursor-pointer"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Bag Items (7 cols) */}
              <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] space-y-4">
                <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA] border-b border-slate-100 dark:border-slate-800 pb-3">
                  Items in Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
                </h3>

                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover border border-[#E4E6ED] dark:border-[#2B3850]"
                        />
                        <div>
                          <div className="text-xs font-bold text-[#17263F] dark:text-[#F4F6FA]">{item.product.title}</div>
                          <div className="text-[11px] text-[#66738A] font-mono-code">${item.product.price.toFixed(2)} each</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-mono-code font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <div className="font-mono-code font-bold text-xs min-w-[60px] text-right">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[#8E99AB] hover:text-red-500 text-xs px-1 cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary & Checkout (5 cols) */}
              <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] space-y-4 h-fit">
                <h3 className="text-sm font-bold text-[#17263F] dark:text-[#F4F6FA] border-b border-slate-100 dark:border-slate-800 pb-3">
                  Summary & Payment
                </h3>

                {/* Promo code application */}
                <form onSubmit={handleApplyPromoCode} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon / Promo code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs font-mono-code bg-white dark:bg-[#131D30] border border-[#E4E6ED] dark:border-[#2B3850] rounded-lg px-2.5 py-1.5 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold text-white bg-[#5F5BB6] rounded-lg cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {promoMessage && (
                  <div className={`text-[11px] ${promoMessage.success ? 'text-emerald-600' : 'text-red-500'}`}>
                    {promoMessage.text}
                  </div>
                )}

                {appliedPromo && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[11px] flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                    <span>Active Promo: <strong>{appliedPromo.promoCode}</strong> (-{appliedPromo.discountPercent}%)</span>
                    <button onClick={removePromo} className="text-xs hover:underline cursor-pointer">Remove</button>
                  </div>
                )}

                <div className="space-y-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-[#66738A]">
                    <span>Subtotal:</span>
                    <span className="font-mono-code font-semibold">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({appliedPromo.discountPercent}%):</span>
                      <span className="font-mono-code font-semibold">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#66738A]">
                    <span>Standard Shipping:</span>
                    <span className="text-emerald-600 font-semibold">Complimentary</span>
                  </div>
                  <div className="flex justify-between text-base font-bold font-mono-code text-[#17263F] dark:text-[#F4F6FA] pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Total Due:</span>
                    <span className="text-[#207D62] dark:text-[#34D399]">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isCheckingOut}
                    onClick={handlePlaceOrder}
                    className="w-full py-3 text-xs font-bold text-white bg-[#207D62] hover:bg-[#18634d] disabled:opacity-50 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    {isCheckingOut ? 'Recording Transaction...' : 'Place Order & Update Inventory'}
                  </button>
                  <p className="text-[10px] text-center text-[#8E99AB] mt-2">
                    Atomic local-first order recording. Stock levels in merchant warehouse will decrement immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Success Modal */}
          {checkoutSuccessOrder && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-[#131D30] rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] p-6 max-w-md w-full shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-center text-[#17263F] dark:text-[#F4F6FA]">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs text-center text-[#66738A] mt-1">
                  Invoice #{checkoutSuccessOrder.id.slice(-6)} · Charged ${checkoutSuccessOrder.total.toFixed(2)}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                  <div className="text-[11px] text-[#8E99AB]">Persisted Order Items:</div>
                  {checkoutSuccessOrder.items.map((i: any) => (
                    <div key={i.id} className="flex justify-between font-mono-code text-[11px]">
                      <span>{i.quantity}x {i.productTitle}</span>
                      <span>${i.lineTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setCheckoutSuccessOrder(null);
                      navigateTo('/customer/orders');
                    }}
                    className="w-full py-2 text-xs font-bold text-white bg-[#207D62] rounded-xl cursor-pointer"
                  >
                    View in Order History
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: ORDERS HISTORY */}
      {activeView === 'orders' && (
        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Your Studio Order History</h2>
          <div className="glass-panel rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/60 dark:bg-slate-800/40 text-[#66738A] font-semibold border-b border-[#E4E6ED] dark:border-[#2B3850]">
                  <tr>
                    <th className="px-5 py-3">Order #</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Products</th>
                    <th className="px-5 py-3">Total Paid</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E6ED]/80 dark:divide-[#2B3850]/80">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-5 py-3 font-mono-code font-bold text-[#5F5BB6]">
                        #{ord.id.slice(-6)}
                      </td>
                      <td className="px-5 py-3 text-[#66738A] font-mono-code">
                        {new Date(ord.orderedAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        {ord.items.map((i) => `${i.quantity}x ${i.productTitle}`).join(', ')}
                      </td>
                      <td className="px-5 py-3 font-mono-code font-bold">${ord.total.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: OFFERS */}
      {activeView === 'offers' && (
        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Exclusive Store Promotions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((c) => (
              <div key={c.id} className="glass-panel p-5 rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17263F] dark:text-[#F4F6FA]">{c.title}</span>
                  <span className="text-xs font-mono-code font-bold text-[#5F5BB6] bg-[#EDE9FA] dark:bg-[#232242] px-2 py-0.5 rounded-md">
                    {c.promoCode}
                  </span>
                </div>
                <p className="text-xs text-[#66738A] leading-relaxed">"{c.messageDraft}"</p>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600">Save {c.discountPercent}% at checkout</span>
                  <button
                    onClick={() => {
                      applyPromo(c.promoCode);
                      navigateTo('/customer/cart');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#207D62] rounded-lg cursor-pointer"
                  >
                    Apply Coupon to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: AI ASSISTANT */}
      {activeView === 'assistant' && (
        <div className="mt-6 space-y-6">
          <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA]">Aura Studio Shopping Concierge</h2>
          <div className="glass-panel rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] flex flex-col h-[500px] overflow-hidden">
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {assistantMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-md rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#207D62] text-white rounded-br-xs'
                        : 'bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-bl-xs'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAssistantThinking && (
                <div className="text-xs text-[#8E99AB] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" /> Curating studio recommendations...
                </div>
              )}
            </div>

            <div className="p-3 border-t border-[#E4E6ED] dark:border-[#2B3850] bg-white/50 dark:bg-[#131D30]/50 flex gap-2">
              <input
                type="text"
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAssistant()}
                placeholder="Ask about headphone sound signature, espresso tools, or gift ideas under $200..."
                className="flex-1 text-xs bg-white dark:bg-[#18243C] border border-[#E4E6ED] dark:border-[#2B3850] rounded-xl px-3 py-2"
              />
              <button
                onClick={handleSendAssistant}
                className="px-4 py-2 text-xs font-bold text-white bg-[#207D62] hover:bg-[#18634d] rounded-xl cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
