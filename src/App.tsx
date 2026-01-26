import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const main = document.querySelector('.overflow-y-auto');
    if (main) main.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

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
  if (!settings.onboardingCompleted) {
    return (
      <BrowserRouter>
        <ScrollToTop />
        <div className="h-screen w-screen relative overflow-hidden flex items-center justify-center">
          {/* Ambient Background Gradients */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F2922] via-[#081A14] to-[#020C09]"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>
          </div>
          <div className="relative z-10 w-full max-w-md px-5">
            <Routes>
              <Route path="*" element={<Onboarding />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <div className="h-screen w-screen overflow-hidden flex flex-col relative">
          {/* Ambient Background Gradients */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0F2922] via-[#081A14] to-[#020C09]"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen opacity-40"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-900/10 rounded-full blur-[100px] mix-blend-screen opacity-30"></div>
          </div>

          <Header />

          <div className="flex-1 overflow-y-auto relative z-10">
            <div className="max-w-[420px] lg:max-w-none mx-auto min-h-full flex flex-col">
              {/* Desktop Layout */}
              <div className="hidden lg:flex lg:items-start lg:gap-8 lg:px-8 lg:py-6 lg:max-w-[1600px] lg:mx-auto lg:w-full">
                <Sidebar />
                <div className="flex-1 min-w-0 pb-12">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
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

              {/* Mobile Layout */}
              <div className="lg:hidden w-full pb-32">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
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
          </div>

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
