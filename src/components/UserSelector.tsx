import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';

export default function UserSelector() {
    const { users, activeUserId, setActiveUser, addToast } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeUser = users.find(u => u.id === activeUserId) || users[0];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitchUser = (userId: string, name: string) => {
        setActiveUser(userId);
        setIsOpen(false);
        addToast(`Switched to ${name}'s profile`, 'info');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-white/5 transition-all text-white/90 border border-white/5 bg-white/[0.02]"
            >
                <div className="relative">
                    {activeUser.avatar ? (
                        <img
                            src={activeUser.avatar}
                            alt={activeUser.name}
                            className="w-8 h-8 rounded-full border-2 border-white/20 object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    ) : null}
                    <div
                        className="w-8 h-8 rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: activeUser.color, display: activeUser.avatar ? 'none' : 'flex' }}
                    >
                        {activeUser.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold leading-none">{activeUser.name}</p>
                    <p className="text-[10px] text-white/40 font-medium">Couple Profile</p>
                </div>
                <iconify-icon icon="solar:alt-arrow-down-linear" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} width="14"></iconify-icon>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-64 glass-card rounded-2xl overflow-hidden animate-fade-in shadow-2xl z-[100] border border-white/10 ring-1 ring-black/5">
                    <div className="px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Switch Profile</p>
                    </div>
                    <div className="p-2 space-y-1">
                        {users.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleSwitchUser(user.id, user.name)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeUserId === user.id
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                    style={{ backgroundColor: user.color }}
                                >
                                    {user.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    {activeUserId === user.id && (
                                        <p className="text-[10px] text-emerald-500/70 font-medium italic">Active Session</p>
                                    )}
                                </div>
                                {activeUserId === user.id && (
                                    <iconify-icon icon="solar:check-read-linear" className="ml-auto" width="16"></iconify-icon>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="p-2 border-t border-white/5">
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/40 hover:bg-white/5 hover:text-white/60 transition-all text-sm">
                            <iconify-icon icon="solar:add-circle-linear" width="18"></iconify-icon>
                            Add Profile
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
