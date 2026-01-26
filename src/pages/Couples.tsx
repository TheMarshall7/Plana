import { useState } from 'react';
import { useStore } from '../store/store';
import Modal from '../components/Modal';
import type { CouplesSettings, Account, Transaction } from '../store/types';

export default function Couples() {
  const { couples, updateCouples, transactions, accounts, getAccountBalance } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSaveSettings = (data: Partial<CouplesSettings>) => {
    updateCouples(data);
    setIsSettingsOpen(false);
  };

  // Calculate monthly settlement
  const monthlySettlement = () => {
    if (!couples.enabled) return null;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Filter transactions for joint accounts OR marked as paidBy a member
    const monthTransactions = transactions.filter((t: Transaction) => {
      const tDate = new Date(t.date);
      const isThisMonth = tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear;
      if (!isThisMonth) return false;

      const account = accounts.find((a: Account) => a.id === t.accountId);
      return account?.ownership === 'joint' || t.paidBy;
    });

    const brianExpenses = monthTransactions
      .filter((t: Transaction) => t.paidBy === 'brian' && t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);

    const nadineExpenses = monthTransactions
      .filter((t: Transaction) => t.paidBy === 'nadine' && t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);

    const totalJointExpenses = brianExpenses + nadineExpenses;
    const sharePerPerson = totalJointExpenses / 2;

    // If Brian spent more than his share, Nadine owes him the difference
    const settlementAmount = brianExpenses - sharePerPerson;

    return {
      brianExpenses,
      nadineExpenses,
      totalJointExpenses,
      sharePerPerson,
      settlementAmount,
    };
  };

  const settlement = monthlySettlement();

  // Fun Money Calculation
  const getFunMoney = (member: 'brian' | 'nadine') => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const personalExpenses = transactions
      .filter((t: Transaction) => {
        const tDate = new Date(t.date);
        const account = accounts.find((a: Account) => a.id === t.accountId);
        return tDate >= monthStart &&
          t.paidBy === member &&
          t.type === 'expense' &&
          account?.ownership !== 'joint';
      })
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);

    return Math.max(0, couples.funMoneyAmount - personalExpenses);
  };

  const brianFunMoney = getFunMoney('brian');
  const nadineFunMoney = getFunMoney('nadine');

  return (
    <div className="px-5 lg:px-0 py-8 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white/90">Couples</h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-all flex items-center gap-2"
        >
          <iconify-icon icon="solar:settings-linear" width="20"></iconify-icon>
          Settings
        </button>
      </div>

      {!couples.enabled ? (
        <div className="glass-card rounded-[32px] p-12 text-center max-w-lg mx-auto mt-12">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <iconify-icon icon="solar:heart-bold" className="text-emerald-400" width="40"></iconify-icon>
          </div>
          <h2 className="text-2xl font-semibold text-white/90 mb-3">Finance for Two</h2>
          <p className="text-white/60 mb-8">
            Manage your joint expenses, split your monthly rent, and track personal "fun money" automatically.
          </p>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/20"
          >
            Enable Couples Mode
          </button>
        </div>
      ) : (
        <div className="space-y-6 lg:space-y-8 animate-fade-in">

          {/* 1. Settlement Visualization */}
          {settlement && (
            <div className="glass-card rounded-[32px] p-8 lg:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <iconify-icon icon="solar:hand-money-bold" width="64"></iconify-icon>
              </div>

              <h3 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
                <iconify-icon icon="solar:calendar-split-linear" className="text-emerald-400"></iconify-icon>
                Monthly Settlement
              </h3>

              <div className="grid lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Brian: ${settlement.brianExpenses.toLocaleString()}</span>
                    <span className="text-white/60">Nadine: ${settlement.nadineExpenses.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${(settlement.brianExpenses / Math.max(1, settlement.totalJointExpenses)) * 100}%` }}
                    ></div>
                    <div
                      className="h-full bg-white/10 transition-all duration-700"
                      style={{ width: `${(settlement.nadineExpenses / Math.max(1, settlement.totalJointExpenses)) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-white/40 text-center">Joint Spending Split (% of total paid)</p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 text-center lg:text-left">
                  <p className="text-sm text-white/60 mb-1">Settlement Status</p>
                  <p className={`text-2xl font-bold ${settlement.settlementAmount >= 0 ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {settlement.settlementAmount >= 0 ? 'Nadine owes Brian' : 'Brian owes Nadine'}
                  </p>
                  <p className="text-3xl font-black text-white mt-1">
                    ${Math.abs(settlement.settlementAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. Fun Money (Personal Allowances) */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-[24px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">B</div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">Brian's Fun Money</p>
                    <p className="text-xs text-white/40">Personal Allowance</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-white">${brianFunMoney.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{ width: `${(brianFunMoney / Math.max(1, couples.funMoneyAmount)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="glass-card rounded-[24px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">N</div>
                  <div>
                    <p className="text-sm font-semibold text-white/90">Nadine's Fun Money</p>
                    <p className="text-xs text-white/40">Personal Allowance</p>
                  </div>
                </div>
                <span className="text-xl font-bold text-white">${nadineFunMoney.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 transition-all duration-1000"
                  style={{ width: `${(nadineFunMoney / Math.max(1, couples.funMoneyAmount)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 3. Joint Accounts Quick View */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white/40 uppercase tracking-widest pl-1">Joint Accounts</h3>
            <div className="grid gap-3">
              {accounts.filter((a: Account) => a.ownership === 'joint').map((acc: Account) => (
                <div key={acc.id} className="glass-card rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <iconify-icon icon="solar:card-linear" className="text-white/60" width="24"></iconify-icon>
                    </div>
                    <div>
                      <p className="font-medium text-white/90">{acc.name}</p>
                      <p className="text-xs text-white/40">{acc.institution}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-white">${getAccountBalance(acc.id).toLocaleString()}</p>
                </div>
              ))}
              {accounts.filter((a: Account) => a.ownership === 'joint').length === 0 && (
                <div className="glass-card rounded-2xl p-8 text-center text-white/40 text-sm">
                  Assign "Joint" ownership to accounts to see them here.
                </div>
              )}
            </div>
          </div>

        </div>
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
            className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-colors"
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
