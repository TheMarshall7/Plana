import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'solar:home-angle-linear', label: 'Dashboard' },
    { path: '/accounts', icon: 'solar:wallet-linear', label: 'Accounts' },
    { path: '/transactions', icon: 'solar:chart-2-linear', label: 'Transactions' },
    { path: '/budget', icon: 'solar:pie-chart-2-linear', label: 'Budget' },
    { path: '/subscriptions', icon: 'solar:bill-list-linear', label: 'Subscriptions' },
    { path: '/goals', icon: 'solar:target-linear', label: 'Goals' },
    { path: '/debt', icon: 'solar:document-text-linear', label: 'Debt' },
    { path: '/cash-flow', icon: 'solar:calendar-mark-linear', label: 'Cash Flow' },
    { path: '/travel', icon: 'solar:palmtree-linear', label: 'Travel' },
    { path: '/couples', icon: 'solar:heart-linear', label: 'Couples' },
    { path: '/settings', icon: 'solar:settings-linear', label: 'Settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 z-20">
      <div className="glass-card rounded-2xl p-5 h-fit sticky top-6 w-full">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              <iconify-icon icon={item.icon} width="20"></iconify-icon>
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
