import { useNavigate } from 'react-router-dom';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const menuItems = [
        { path: '/subscriptions', icon: 'solar:bill-list-linear', label: 'Subscriptions', color: 'text-purple-400' },
        { path: '/budget', icon: 'solar:pie-chart-2-linear', label: 'Budget', color: 'text-emerald-400' },
        { path: '/goals', icon: 'solar:target-linear', label: 'Goals', color: 'text-yellow-400' },
        { path: '/debt', icon: 'solar:hand-money-linear', label: 'Debt Payoff', color: 'text-rose-400' },
        { path: '/couples', icon: 'solar:users-group-two-rounded-linear', label: 'Couples', color: 'text-blue-400' },
        { path: '/cash-flow', icon: 'solar:graph-up-linear', label: 'Cash Flow', color: 'text-indigo-400' },
        { path: '/settings', icon: 'solar:settings-linear', label: 'Settings', color: 'text-white/60' },
    ];

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Menu Content */}
            <div className="absolute bottom-24 right-5 w-64 glass-card rounded-3xl p-2 animate-slide-up origin-bottom-right border border-white/10 shadow-2xl">
                <div className="grid grid-cols-1 gap-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors w-full text-left group"
                        >
                            <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                <iconify-icon icon={item.icon} width="18"></iconify-icon>
                            </div>
                            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                                {item.label}
                            </span>
                            <iconify-icon icon="solar:alt-arrow-right-linear" className="ml-auto text-white/20" width="16"></iconify-icon>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
