import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Command {
  id: string;
  label: string;
  icon: string;
  path?: string;
  action?: () => void;
}

const commands: Command[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'solar:home-angle-linear', path: '/' },
  { id: 'transactions', label: 'Transactions', icon: 'solar:list-linear', path: '/transactions' },
  { id: 'accounts', label: 'Accounts', icon: 'solar:wallet-linear', path: '/accounts' },
  { id: 'budget', label: 'Budget', icon: 'solar:pie-chart-2-linear', path: '/budget' },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'solar:bill-list-linear', path: '/subscriptions' },
  { id: 'goals', label: 'Goals', icon: 'solar:target-linear', path: '/goals' },
  { id: 'debt', label: 'Debt', icon: 'solar:document-text-linear', path: '/debt' },
  { id: 'cashflow', label: 'Cash Flow', icon: 'solar:chart-2-linear', path: '/cash-flow' },
  { id: 'couples', label: 'Couples', icon: 'solar:heart-linear', path: '/couples' },
  { id: 'settings', label: 'Settings', icon: 'solar:settings-linear', path: '/settings' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    if (!searchQuery) return commands;
    const query = searchQuery.toLowerCase();
    return commands.filter(cmd => cmd.label.toLowerCase().includes(query));
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          if (selected.path) {
            navigate(selected.path);
          } else if (selected.action) {
            selected.action();
          }
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-2xl w-full max-w-md mx-4 animate-fade-in delay-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg">
            <iconify-icon icon="solar:magnifer-linear" className="text-white/50" width="20"></iconify-icon>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands..."
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40"
            />
            <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">ESC</kbd>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto no-scrollbar">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-white/60">No commands found</p>
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => {
                  if (cmd.path) {
                    navigate(cmd.path);
                  } else if (cmd.action) {
                    cmd.action();
                  }
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                  index === selectedIndex ? 'bg-white/5' : ''
                }`}
              >
                <iconify-icon icon={cmd.icon} className="text-white/70" width="20"></iconify-icon>
                <span className="text-sm text-white/90">{cmd.label}</span>
                {cmd.path && (
                  <span className="ml-auto text-xs text-white/40">{cmd.path}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
