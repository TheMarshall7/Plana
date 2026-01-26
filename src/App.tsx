import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/store';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import CommandPalette from './components/CommandPalette';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
import Budget from './pages/Budget';
import Subscriptions from './pages/Subscriptions';
import Goals from './pages/Goals';
import Couples from './pages/Couples';
import Debt from './pages/Debt';
import CashFlow from './pages/CashFlow';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Travel from './pages/Travel';
import TripDetailsView from './components/travel/TripDetailsView';

import ToastContainer from './components/ToastContainer';

function App() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { settings } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen relative">
          {/* Ambient Background Gradients */}
          <div className="fixed inset-0 pointer-events-none z-0">
            {/* Deep Emerald Core */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F2922] via-[#081A14] to-[#020C09]"></div>

            {/* Subtle Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[100px] mix-blend-screen opacity-30"></div>
            <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] mix-blend-overlay"></div>
          </div>

          {/* Main App Container - Mobile: centered 420px, Desktop: full width */}
          <main className="relative z-10 w-full max-w-[420px] lg:max-w-none mx-auto min-h-screen flex flex-col">
            <Header />
            <div className="flex-1 overflow-y-auto no-scrollbar pb-32 lg:pb-12 px-0">
              {/* Desktop Layout Container */}
              <div className="hidden lg:flex lg:items-start lg:gap-8 lg:px-8 lg:py-6 lg:max-w-[1600px] lg:mx-auto lg:w-full min-h-0">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <Routes>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route
                      path="/"
                      element={
                        !settings.onboardingCompleted ? (
                          <Navigate to="/onboarding" replace />
                        ) : (
                          <Dashboard />
                        )
                      }
                    />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/accounts" element={<Accounts />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/couples" element={<Couples />} />
                    <Route path="/debt" element={<Debt />} />
                    <Route path="/cash-flow" element={<CashFlow />} />
                    <Route path="/travel" element={<Travel />} />
                    <Route path="/travel/:id" element={<TripDetailsView />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </div>
              </div>
              {/* Mobile Layout Container */}
              <div className="lg:hidden w-full">
                <Routes>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route
                    path="/"
                    element={
                      !settings.onboardingCompleted ? (
                        <Navigate to="/onboarding" replace />
                      ) : (
                        <Dashboard />
                      )
                    }
                  />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/accounts" element={<Accounts />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/subscriptions" element={<Subscriptions />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/couples" element={<Couples />} />
                  <Route path="/debt" element={<Debt />} />
                  <Route path="/cash-flow" element={<CashFlow />} />
                  <Route path="/travel" element={<Travel />} />
                  <Route path="/travel/:id" element={<TripDetailsView />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </div>
          </main>

          <BottomNav />
          <ToastContainer />
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
          />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
