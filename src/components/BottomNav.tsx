import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'solar:home-angle-linear', label: 'Home' },
    { path: '/accounts', icon: 'solar:wallet-linear', label: 'Wallet' },
    { path: '/travel', icon: 'solar:suitcase-tag-linear', label: 'Travel' },
    { path: '/transactions', icon: 'solar:chart-2-linear', label: 'Chart' },
    { path: '/settings', icon: 'solar:settings-linear', label: 'Settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-6 left-0 right-0 z-50 animate-fade-in delay-300">
      <div className="max-w-[420px] mx-auto flex justify-center">
        <div className="glass-nav px-6 py-3 rounded-full flex items-center justify-between gap-0 w-full max-w-[340px] shadow-2xl shadow-black/40">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 group flex-1 min-w-0"
            >
              <iconify-icon
                icon={item.icon}
                className={`transition-transform group-hover:-translate-y-1 duration-300 ${isActive(item.path) ? 'text-white' : 'text-white/40 group-hover:text-white'
                  }`}
                width="24"
              ></iconify-icon>
              <div
                className={`w-1 h-1 rounded-full ${isActive(item.path) ? 'bg-emerald-400' : 'bg-transparent'
                  }`}
              ></div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
