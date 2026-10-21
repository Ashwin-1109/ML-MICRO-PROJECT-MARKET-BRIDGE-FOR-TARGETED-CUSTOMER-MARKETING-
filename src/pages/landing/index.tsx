import React from 'react';
import { useApp } from '../../stores/appContext';
import {
  Store,
  ShoppingBag,
  FlaskConical,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
  BarChart3,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, products, orders, customers, experiments } = useApp();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden">
      {/* Subtle architectural background ambiance */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#EDE9FA]/60 via-[#E4EFFB]/30 to-transparent dark:from-[#232242]/40 dark:via-[#162B44]/20 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-10 -right-20 w-[400px] h-[400px] bg-[#DDF2E8]/40 dark:bg-[#163328]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 flex-1 flex flex-col justify-center">
        {/* Editorial Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-[#131D30]/80 border border-[#E4E6ED] dark:border-[#2B3850] shadow-xs text-xs font-medium text-[#5F5BB6] dark:text-[#A29BF0] mb-5">
            <Cpu className="w-3.5 h-3.5" />
            <span>Academic Research & Production Commerce Platform</span>
          </div>

          <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-normal text-[#17263F] dark:text-[#F4F6FA] tracking-tight leading-[1.15]">
            Intelligence Behind Every Purchase.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#66738A] dark:text-[#ACB8CC] font-normal max-w-2xl mx-auto leading-relaxed">
            Understand behavior. Personalize experiences. Make smarter decisions.
          </p>

          <div className="mt-3 text-xs text-[#8E99AB] font-mono-code">
            Academic Title: Purchasing Behavior for Targeted Marketing · TASC-90 Hybrid Architecture
          </div>
        </div>

        {/* The Three Luxury Interactive Workspace Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto w-full">
          {/* Card 1: Merchant Intelligence */}
          <div
            onClick={() => navigateTo('/merchant')}
            className="group relative rounded-2xl glass-panel p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-[#E4E6ED] dark:border-[#2B3850] hover:border-[#5F5BB6]/50 dark:hover:border-[#A29BF0]/50 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#EDE9FA]/50 dark:bg-[#232242]/30 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#EDE9FA] dark:bg-[#232242] flex items-center justify-center text-[#5F5BB6] dark:text-[#A29BF0] mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <Store className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono-code font-semibold uppercase tracking-wider text-[#5F5BB6] dark:text-[#A29BF0]">
                Workspace 01
              </span>
              <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA] mt-1 mb-3">
                Merchant Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-[#66738A] dark:text-[#ACB8CC] leading-relaxed">
                Manage products, understand customers, predict opportunities and launch smarter marketing.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E4E6ED]/80 dark:border-[#2B3850]/80 flex items-center justify-between text-xs font-semibold text-[#5F5BB6] dark:text-[#A29BF0]">
              <span>Enter Merchant Suite</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Personalized Shopping */}
          <div
            onClick={() => navigateTo('/customer')}
            className="group relative rounded-2xl glass-panel p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-[#E4E6ED] dark:border-[#2B3850] hover:border-[#207D62]/50 dark:hover:border-[#34D399]/50 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#DDF2E8]/50 dark:bg-[#163328]/30 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#DDF2E8] dark:bg-[#163328] flex items-center justify-center text-[#207D62] dark:text-[#34D399] mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono-code font-semibold uppercase tracking-wider text-[#207D62] dark:text-[#34D399]">
                Workspace 02
              </span>
              <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA] mt-1 mb-3">
                Personalized Shopping
              </h2>
              <p className="text-xs sm:text-sm text-[#66738A] dark:text-[#ACB8CC] leading-relaxed">
                Discover relevant products, manage orders and enjoy an intelligent shopping experience.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E4E6ED]/80 dark:border-[#2B3850]/80 flex items-center justify-between text-xs font-semibold text-[#207D62] dark:text-[#34D399]">
              <span>Explore Storefront</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: ML Research Lab */}
          <div
            onClick={() => navigateTo('/lab')}
            className="group relative rounded-2xl glass-panel p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-[#E4E6ED] dark:border-[#2B3850] hover:border-[#A29BF0]/60 dark:hover:border-[#A29BF0]/60 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#EDE9FA]/40 dark:bg-[#232242]/30 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#EDE9FA] dark:bg-[#232242] flex items-center justify-center text-[#5F5BB6] dark:text-[#A29BF0] mb-6 shadow-xs group-hover:scale-105 transition-transform">
                <FlaskConical className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-mono-code font-semibold uppercase tracking-wider text-[#5F5BB6] dark:text-[#A29BF0]">
                Workspace 03
              </span>
              <h2 className="text-xl font-bold text-[#17263F] dark:text-[#F4F6FA] mt-1 mb-3">
                Research & Model Intelligence
              </h2>
              <p className="text-xs sm:text-sm text-[#66738A] dark:text-[#ACB8CC] leading-relaxed">
                Explore datasets, train machine learning models, compare performance and understand predictions.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E4E6ED]/80 dark:border-[#2B3850]/80 flex items-center justify-between text-xs font-semibold text-[#5F5BB6] dark:text-[#A29BF0]">
              <span>Enter ML Research Lab</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        {/* Live System Capabilities Bar */}
        <div className="mt-14 max-w-5xl mx-auto w-full rounded-xl border border-[#E4E6ED] dark:border-[#2B3850] bg-white/60 dark:bg-[#131D30]/60 p-4 sm:p-5 backdrop-blur-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-[#E4E6ED] dark:divide-[#2B3850]">
            <div className="pt-2 sm:pt-0">
              <div className="text-xs text-[#66738A] dark:text-[#ACB8CC]">Live Catalog Items</div>
              <div className="text-lg font-bold text-[#17263F] dark:text-[#F4F6FA] font-mono-code mt-0.5">
                {products.length} Products
              </div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-xs text-[#66738A] dark:text-[#ACB8CC]">Recorded Transactions</div>
              <div className="text-lg font-bold text-[#17263F] dark:text-[#F4F6FA] font-mono-code mt-0.5">
                {orders.length} Invoices
              </div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-xs text-[#66738A] dark:text-[#ACB8CC]">Benchmark Models</div>
              <div className="text-lg font-bold text-[#17263F] dark:text-[#F4F6FA] font-mono-code mt-0.5">
                9 Configurations
              </div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-xs text-[#66738A] dark:text-[#ACB8CC]">Local-First Storage</div>
              <div className="text-lg font-bold text-[#207D62] dark:text-[#34D399] font-mono-code mt-0.5 flex items-center justify-center gap-1.5">
                <Database className="w-4 h-4" />
                IndexedDB Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E4E6ED] dark:border-[#2B3850] py-6 px-4 text-center text-xs text-[#66738A] dark:text-[#ACB8CC]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            MarketBridge AI © 2026 · An Intelligent Commerce, Customer Behavior & Targeted Marketing Platform
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button onClick={() => navigateTo('/lab/reports')} className="hover:text-[#5F5BB6] transition-colors cursor-pointer">
              Research Methodology
            </button>
            <span>·</span>
            <button onClick={() => navigateTo('/merchant/assistant')} className="hover:text-[#5F5BB6] transition-colors cursor-pointer">
              Gemini Copilot
            </button>
            <span>·</span>
            <button onClick={() => navigateTo('/customer/shop')} className="hover:text-[#5F5BB6] transition-colors cursor-pointer">
              Demo Storefront
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
