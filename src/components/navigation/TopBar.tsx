import React, { useState } from 'react';
import { useApp } from '../../stores/appContext';
import {
  Sun,
  Moon,
  ChevronDown,
  Store,
  ShoppingBag,
  FlaskConical,
  RotateCcw,
  Sparkles,
  Mic,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { workspace, currentRoute, navigateTo, theme, toggleTheme, cart, resetDemoData, openVoiceAI } = useApp();
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Clean, single-line links per workspace
  const getNavLinks = () => {
    switch (workspace) {
      case 'merchant':
        return [
          { label: 'Overview', route: '/merchant' },
          { label: 'Products', route: '/merchant/products' },
          { label: 'Inventory', route: '/merchant/inventory' },
          { label: 'Sales & Billing', route: '/merchant/sales' },
          { label: 'Customer Intelligence', route: '/merchant/customers' },
          { label: 'AI Marketing', route: '/merchant/marketing' },
          { label: 'Copilot', route: '/merchant/assistant' },
        ];
      case 'customer':
        return [
          { label: 'Storefront', route: '/customer' },
          { label: 'Catalogue', route: '/customer/shop' },
          { label: 'Recommendations', route: '/customer/recommendations' },
          { label: 'Exclusive Offers', route: '/customer/offers' },
          { label: 'Orders', route: '/customer/orders' },
          { label: 'AI Concierge', route: '/customer/assistant' },
        ];
      case 'lab':
        return [
          { label: 'Research Hub', route: '/lab' },
          { label: 'Dataset Studio', route: '/lab/datasets' },
          { label: 'Clustering', route: '/lab/clustering' },
          { label: 'Training Arena', route: '/lab/training' },
          { label: 'Leaderboard', route: '/lab/compare' },
          { label: 'Simulator', route: '/lab/simulator' },
          { label: 'Model Registry', route: '/lab/registry' },
        ];
      default:
        return [
          { label: 'Merchant Suite', route: '/merchant' },
          { label: 'Customer Storefront', route: '/customer' },
          { label: 'Research Lab', route: '/lab' },
          { label: 'TASC-90 Methodology', route: '/lab/reports' },
        ];
    }
  };

  const navLinks = getNavLinks();

  const handleReset = async () => {
    await resetDemoData();
    setIsResetConfirmOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-[#E4E6ED] dark:border-[#2B3850] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigateTo('/')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-[#5F5BB6] dark:bg-[#A29BF0] flex items-center justify-center text-white dark:text-[#0C1423] font-bold text-sm tracking-tight transition-transform group-hover:scale-105">
              MB
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-[#17263F] dark:text-[#F4F6FA] whitespace-nowrap">
                MarketBridge AI
              </span>
              <span className="text-[10px] text-[#66738A] dark:text-[#ACB8CC] tracking-wide uppercase font-mono-code -mt-1 hidden sm:inline">
                {workspace === 'merchant'
                  ? 'Merchant Intelligence'
                  : workspace === 'customer'
                  ? 'Personalized Shopping'
                  : workspace === 'lab'
                  ? 'ML Research Lab'
                  : 'Behavioral Commerce'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Single-line Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 overflow-x-auto no-scrollbar">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => navigateTo(link.route)}
                className={`text-xs font-medium tracking-normal whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 border-b-2 ${
                  isActive
                    ? 'border-[#5F5BB6] dark:border-[#A29BF0] text-[#17263F] dark:text-[#F4F6FA] font-semibold'
                    : 'border-transparent text-[#66738A] dark:text-[#ACB8CC] hover:text-[#17263F] dark:hover:text-[#F4F6FA]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Workspace Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg border border-[#E4E6ED] dark:border-[#2B3850] bg-white/70 dark:bg-[#131D30]/80 text-xs font-medium text-[#17263F] dark:text-[#F4F6FA] flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Switch Workspace"
            >
              <span className="capitalize">{workspace}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#66738A] dark:text-[#ACB8CC]" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl glass-dropdown p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[#66738A] dark:text-[#ACB8CC] border-b border-slate-100 dark:border-slate-800">
                  Select Workspace
                </div>
                <button
                  onClick={() => {
                    navigateTo('/merchant');
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 hover:bg-[#EDE9FA] dark:hover:bg-[#232242] text-[#17263F] dark:text-[#F4F6FA] transition-colors cursor-pointer"
                >
                  <Store className="w-4 h-4 text-[#5F5BB6] dark:text-[#A29BF0]" />
                  <div>
                    <div>Merchant Intelligence</div>
                    <div className="text-[10px] text-[#66738A] dark:text-[#ACB8CC]">Operations & predictive sales</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    navigateTo('/customer');
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 hover:bg-[#EDE9FA] dark:hover:bg-[#232242] text-[#17263F] dark:text-[#F4F6FA] transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#207D62] dark:text-[#34D399]" />
                  <div>
                    <div>Personalized Shopping</div>
                    <div className="text-[10px] text-[#66738A] dark:text-[#ACB8CC]">Catalogue & recommendations</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    navigateTo('/lab');
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 hover:bg-[#EDE9FA] dark:hover:bg-[#232242] text-[#17263F] dark:text-[#F4F6FA] transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-[#5F5BB6] dark:text-[#A29BF0]" />
                  <div>
                    <div>ML Research Lab</div>
                    <div className="text-[10px] text-[#66738A] dark:text-[#ACB8CC]">TASC-90 & model training</div>
                  </div>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    navigateTo('/');
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#66738A] dark:text-[#ACB8CC] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Return to Home Overview
                </button>
              </div>
            )}
          </div>

          {/* Cart Indicator (for customer workspace) */}
          {workspace === 'customer' && (
            <button
              onClick={() => navigateTo('/customer/cart')}
              className="relative p-2 rounded-lg border border-[#E4E6ED] dark:border-[#2B3850] bg-white/70 dark:bg-[#131D30]/80 text-[#17263F] dark:text-[#F4F6FA] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#5F5BB6] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[#E4E6ED] dark:border-[#2B3850] bg-white/70 dark:bg-[#131D30]/80 text-[#66738A] dark:text-[#ACB8CC] hover:text-[#17263F] dark:hover:text-[#F4F6FA] transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Re-seed Demo Data Helper */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="p-2 rounded-lg border border-[#E4E6ED] dark:border-[#2B3850] bg-white/70 dark:bg-[#131D30]/80 text-[#66738A] dark:text-[#ACB8CC] hover:text-[#BB4651] transition-colors cursor-pointer"
            title="Reset to Baseline Demo Fixtures"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Direct Voice & AI Button */}
          <button
            onClick={openVoiceAI}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#5F5BB6]/40 dark:border-[#A29BF0]/40 bg-[#EDE9FA]/80 dark:bg-[#232242]/80 text-[#5F5BB6] dark:text-[#A29BF0] hover:bg-[#5F5BB6] hover:text-white dark:hover:bg-[#A29BF0] dark:hover:text-[#0C1423] transition-all cursor-pointer shadow-xs text-xs font-semibold"
            title="Directly interact with Gemini AI via Voice or Text"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Voice AI</span>
          </button>

          {/* Primary Action Button */}
          {workspace === 'merchant' && (
            <button
              onClick={() => navigateTo('/merchant/sales')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              New Sale
            </button>
          )}
          {workspace === 'customer' && (
            <button
              onClick={() => navigateTo('/customer/shop')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#207D62] hover:bg-[#18634d] rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Browse Shop
            </button>
          )}
          {workspace === 'lab' && (
            <button
              onClick={() => navigateTo('/lab/training')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Train TASC-90
            </button>
          )}
          {workspace === 'landing' && (
            <button
              onClick={() => navigateTo('/merchant')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5F5BB6] hover:bg-[#4F4A9B] rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Launch Platform
            </button>
          )}
        </div>
      </div>

      {/* Demo Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131D30] rounded-2xl border border-[#E4E6ED] dark:border-[#2B3850] p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-[#17263F] dark:text-[#F4F6FA]">
              Reset Demo Dataset?
            </h3>
            <p className="text-xs text-[#66738A] dark:text-[#ACB8CC] mt-2 leading-relaxed">
              This will restore the local IndexedDB database to the pristine benchmark state, including the 8 studio products, 8 customer behavioral records, orders, active marketing campaigns, and pre-computed UCI Retail II experiments.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#66738A] dark:text-[#ACB8CC] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#BB4651] hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
