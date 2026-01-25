import { useState } from 'react';
import { useStore } from '../store/store';
import Modal from '../components/Modal';
import type { CouplesSettings } from '../store/types';

export default function Couples() {
  const { couples, updateCouples, transactions } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSaveSettings = (data: Partial<CouplesSettings>) => {
    updateCouples(data);
    setIsSettingsOpen(false);
  };

  // Calculate monthly settlement
  const monthlySettlement = () => {
    if (!couples.enabled) return null;

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
    });

    const member1Expenses = monthTransactions
      .filter(t => t.coupleMemberId === '1' && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const member2Expenses = monthTransactions
      .filter(t => t.coupleMemberId === '2' && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = member1Expenses + member2Expenses;
    const averageExpense = totalExpenses / 2;
    const settlement = member1Expenses - averageExpense;

    return {
      member1Expenses,
      member2Expenses,
      totalExpenses,
      averageExpense,
      settlement,
    };
  };

  const settlement = monthlySettlement();

  return (
    <div className="px-5 lg:px-0 py-8 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white/90">Couples</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-4 py-2 btn-primary text-white rounded-lg font-medium flex items-center gap-2"
        >
          <iconify-icon icon="solar:settings-linear" width="20"></iconify-icon>
          Settings
        </button>
      </div>

      {!couples.enabled ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <iconify-icon icon="solar:heart-linear" className="text-emerald-400 mx-auto mb-4" width="48"></iconify-icon>
          <h2 className="text-lg font-semibold text-white/90 mb-2">Couples Mode Disabled</h2>
          <p className="text-white/60 mb-6">
            Enable couples mode to track shared finances, split transactions, and manage joint spending.
          </p>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors"
          >
            Enable Couples Mode
          </button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-white/50 mb-1">Fun Money (Each)</p>
              <p className="text-lg font-semibold text-white/90">${couples.funMoneyAmount.toLocaleString()}</p>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-white/50 mb-1">Joint Threshold</p>
              <p className="text-lg font-semibold text-white/90">${couples.jointSpendingThreshold.toLocaleString()}</p>
            </div>
          </div>

          {/* Monthly Settlement */}
          {settlement && (
            <div className="glass-card rounded-2xl p-4">
              <p className="text-sm font-medium text-white/90 mb-3">Monthly Settlement</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Member 1 Expenses</span>
                  <span className="text-sm font-medium text-white/90">${settlement.member1Expenses.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Member 2 Expenses</span>
                  <span className="text-sm font-medium text-white/90">${settlement.member2Expenses.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-white/90">Settlement Amount</span>
                  <span className={`text-sm font-semibold ${
                    settlement.settlement >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {settlement.settlement >= 0 ? 'Member 1 owes' : 'Member 2 owes'} ${Math.abs(settlement.settlement).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Check-in Info */}
          {couples.checkInFrequency && (
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white/90">Check-in Schedule</p>
                <span className="text-xs text-emerald-400 capitalize">{couples.checkInFrequency}</span>
              </div>
              {couples.lastCheckIn && (
                <p className="text-xs text-white/60">
                  Last check-in: {new Date(couples.lastCheckIn).toLocaleDateString()}
                </p>
              )}
              <button className="mt-3 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors">
                Mark Check-in Complete
              </button>
            </div>
          )}

          {/* Features Info */}
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm font-medium text-white/90 mb-3">Available Features</p>
            <div className="space-y-2 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <iconify-icon icon="solar:check-circle-linear" className="text-emerald-400" width="16"></iconify-icon>
                <span>Transaction splitting (equal, custom, by member)</span>
              </div>
              <div className="flex items-center gap-2">
                <iconify-icon icon="solar:check-circle-linear" className="text-emerald-400" width="16"></iconify-icon>
                <span>Shared account management</span>
              </div>
              <div className="flex items-center gap-2">
                <iconify-icon icon="solar:check-circle-linear" className="text-emerald-400" width="16"></iconify-icon>
                <span>Monthly settlement calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <iconify-icon icon="solar:check-circle-linear" className="text-emerald-400" width="16"></iconify-icon>
                <span>Bill confirmation system</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Settings Modal */}
      <CouplesSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={couples}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

interface CouplesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CouplesSettings;
  onSave: (data: Partial<CouplesSettings>) => void;
}

function CouplesSettingsModal({ isOpen, onClose, settings, onSave }: CouplesSettingsModalProps) {
  const [formData, setFormData] = useState({
    enabled: settings.enabled,
    funMoneyAmount: settings.funMoneyAmount?.toString() || '0',
    jointSpendingThreshold: settings.jointSpendingThreshold?.toString() || '0',
    checkInFrequency: settings.checkInFrequency || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      enabled: formData.enabled,
      funMoneyAmount: parseFloat(formData.funMoneyAmount) || 0,
      jointSpendingThreshold: parseFloat(formData.jointSpendingThreshold) || 0,
      checkInFrequency: (formData.checkInFrequency as 'weekly' | 'biweekly' | 'monthly' | undefined) || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Couples Settings">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/90">Enable Couples Mode</p>
            <p className="text-xs text-white/60">Track shared finances and split transactions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {formData.enabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Fun Money (per person)</label>
              <input
                type="number"
                step="0.01"
                value={formData.funMoneyAmount}
                onChange={(e) => setFormData({ ...formData, funMoneyAmount: e.target.value })}
                min="0"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
              />
              <p className="text-xs text-white/50 mt-1">Monthly personal spending allowance</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Joint Spending Threshold</label>
              <input
                type="number"
                step="0.01"
                value={formData.jointSpendingThreshold}
                onChange={(e) => setFormData({ ...formData, jointSpendingThreshold: e.target.value })}
                min="0"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
              />
              <p className="text-xs text-white/50 mt-1">Amount above which expenses are considered joint</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Check-in Frequency</label>
              <select
                value={formData.checkInFrequency}
                onChange={(e) => setFormData({ ...formData, checkInFrequency: e.target.value })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">None</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 btn-secondary text-white rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors"
          >
            Save Settings
          </button>
        </div>
      </form>
    </Modal>
  );
}
