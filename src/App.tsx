import React from 'react';
import { AppProvider, useApp } from './stores/appContext';
import { TopBar } from './components/navigation/TopBar';
import { LandingPage } from './pages/landing';
import { MerchantWorkspace } from './pages/merchant';
import { CustomerWorkspace } from './pages/customer';
import { MLLabWorkspace } from './pages/lab';
import { FloatingVoiceAI } from './components/assistant/FloatingVoiceAI';

const AppContent: React.FC = () => {
  const { workspace, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] dark:bg-[#0C1423]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#5F5BB6] text-white flex items-center justify-center font-bold mx-auto animate-pulse">
            MB
          </div>
          <div className="text-xs font-mono-code text-[#66738A] dark:text-[#ACB8CC]">
            Initializing MarketBridge AI Local Database...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] dark:bg-[#0C1423] text-[#17263F] dark:text-[#F4F6FA] transition-colors duration-200">
      <TopBar />
      <div className="flex-1">
        {workspace === 'landing' && <LandingPage />}
        {workspace === 'merchant' && <MerchantWorkspace />}
        {workspace === 'customer' && <CustomerWorkspace />}
        {workspace === 'lab' && <MLLabWorkspace />}
      </div>
      <FloatingVoiceAI />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
