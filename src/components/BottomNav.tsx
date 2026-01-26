import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MobileMenu from './MobileMenu';

export default function BottomNav() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Simplified Bottom Nav Items (Main 4)
  const navItems = [
    { path: '/', icon: 'solar:home-angle-linear', activeIcon: 'solar:home-angle-bold', label: 'Home' },
    { path: '/accounts', icon: 'solar:wallet-linear', activeIcon: 'solar:wallet-bold', label: 'Wallet' },
    // Middle spacer for FAB
    { path: '', icon: '', label: '', isSpacer: true },
    { path: '/travel', icon: 'solar:suitcase-tag-linear', activeIcon: 'solar:suitcase-tag-bold', label: 'Travel' },
    { path: '/transactions', icon: 'solar:chart-2-linear', activeIcon: 'solar:chart-2-bold', label: 'Activity' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-8 left-0 right-0 z-50 animate-fade-in delay-300 pointer-events-none">
        <div className="max-w-[420px] mx-auto flex justify-center px-6">

          {/* Main Glass Bar */}
          <div className="glass-nav px-2 py-3 rounded-[32px] flex items-center justify-between gap-1 w-full shadow-2xl shadow-black/40 pointer-events-auto bg-[#0F1815]/90 backdrop-blur-xl border border-white/10 relative">

            {navItems.map((item, index) => {
              if (item.isSpacer) {
                return <div key="spacer" className="w-16" />;
              }

              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <iconify-icon
                    icon={active ? item.activeIcon : item.icon}
                    className={`transition-all duration-300 ${active ? 'text-emerald-400 scale-110' : 'text-white/40 group-hover:text-white/80'}`}
                    width="26"
                  ></iconify-icon>
                </Link>
              );
            })}

            {/* Floating Action Button (FAB) - Centered */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`nav-fab w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all duration-300 ${isMenuOpen ? 'bg-white text-emerald-600 rotate-45' : 'bg-emerald-500 text-white hover:scale-105'}`}
              >
                <iconify-icon icon="solar:add-circle-linear" width="32"></iconify-icon>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
}
