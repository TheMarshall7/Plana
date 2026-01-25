import { useState, useMemo } from 'react';
import { useStore } from '../store/store';
import { format } from 'date-fns';
import Modal from '../components/Modal';
import DebtPayoffChart from '../components/charts/DebtPayoffChart';
import type { Debt } from '../store/types';

export default function Debt() {
  const { debts, accounts, addDebt, updateDebt, deleteDebt, settings } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMonthlyPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  const totalInterest = debts.reduce((sum, d) => sum + (d.balance * (d.apr / 100) / 12), 0);

  // Calculate payoff plans
  const payoffPlans = useMemo(() => {
    const sortedDebts = [...debts].sort((a, b) => {
      if (settings.payoffStrategy === 'snowball') {
        return a.balance - b.balance; // Smallest balance first
      } else {
        return b.apr - a.apr; // Highest interest first
      }
    });

    return sortedDebts.map((debt, index) => {
      const monthlyInterest = debt.balance * (debt.apr / 100) / 12;
      const principalPayment = debt.minimumPayment - monthlyInterest;
      const monthsToPayoff = Math.ceil(debt.balance / principalPayment);
      const totalInterestPaid = (monthsToPayoff * monthlyInterest);

      return {
        ...debt,
        order: index + 1,
        monthlyInterest,
        principalPayment,
        monthsToPayoff,
        totalInterestPaid,
        payoffDate: new Date(Date.now() + monthsToPayoff * 30 * 24 * 60 * 60 * 1000),
      };
    });
  }, [debts, settings.payoffStrategy]);

  const handleAdd = () => {
    setEditingDebt(null);
    setIsModalOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this debt?')) {
      deleteDebt(id);
    }
  };

  const getNextPaymentDate = (debt: Debt) => {
    const now = new Date();
    const currentDay = now.getDate();
    let dueDate = new Date(now.getFullYear(), now.getMonth(), debt.dueDate);
    
    if (dueDate < now || (dueDate.getDate() < currentDay && debt.dueDate < currentDay)) {
      dueDate = new Date(now.getFullYear(), now.getMonth() + 1, debt.dueDate);
    }
    
    return dueDate;
  };

  return (
    <div className="px-5 py-8 space-y-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white/90">Debt</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <iconify-icon icon="solar:add-linear" width="20"></iconify-icon>
          Add Debt
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">Total Debt</p>
          <p className="text-lg font-semibold text-red-400">${totalDebt.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">Monthly Payments</p>
          <p className="text-lg font-semibold text-white/90">${totalMonthlyPayments.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">Monthly Interest</p>
          <p className="text-lg font-semibold text-yellow-400">${totalInterest.toFixed(2)}</p>
        </div>
      </div>

      {/* Payoff Strategy Info */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/90">Payoff Strategy</p>
          <span className="text-xs text-emerald-400 capitalize">{settings.payoffStrategy}</span>
        </div>
        <p className="text-xs text-white/60">
          {settings.payoffStrategy === 'snowball'
            ? 'Paying off smallest balances first for quick wins'
            : 'Paying off highest interest rates first to save money'}
        </p>
      </div>

      {/* Debt Payoff Timeline Chart */}
      {debts.length > 0 && (
        <div className="glass-card rounded-2xl p-4 lg:p-6">
          <h3 className="text-sm font-medium text-white/90 mb-4">Payoff Timeline</h3>
          <DebtPayoffChart debts={debts} payoffStrategy={settings.payoffStrategy} />
        </div>
      )}

      {/* Debt List */}
      <div className="space-y-3">
        {debts.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-white/60 mb-4">No debts tracked</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-colors"
            >
              Add Your First Debt
            </button>
          </div>
        ) : (
          payoffPlans.map((debt) => {
            const _account = accounts.find(a => a.id === debt.accountId);
            const nextPayment = getNextPaymentDate(debt);
            const daysUntilDue = Math.ceil((nextPayment.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={debt.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          {debt.order}
                        </span>
                        <p className="text-sm font-medium text-white/90">{debt.name}</p>
                      </div>
                      <p className="text-sm font-semibold text-red-400">${debt.balance.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-white/50 mb-2">
                      <div>
                        <span className="block">APR</span>
                        <span className="text-white/70 font-medium">{debt.apr}%</span>
                      </div>
                      <div>
                        <span className="block">Min Payment</span>
                        <span className="text-white/70 font-medium">${debt.minimumPayment.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="block">Next Payment</span>
                        <span className="text-white/70 font-medium">
                          {format(nextPayment, 'MMM d')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/60">Payoff Timeline</span>
                        <span className="text-emerald-400 font-medium">
                          {debt.monthsToPayoff} months
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60">Total Interest</span>
                        <span className="text-yellow-400">${debt.totalInterestPaid.toFixed(2)}</span>
                      </div>
                    </div>
                    {daysUntilDue <= 3 && (
                      <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                        <iconify-icon icon="solar:bell-linear" width="12"></iconify-icon>
                        Payment due in {daysUntilDue} days
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1 ml-3">
                    <button
                      onClick={() => handleEdit(debt)}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                    >
                      <iconify-icon icon="solar:pen-linear" className="text-white/70" width="18"></iconify-icon>
                    </button>
                    <button
                      onClick={() => handleDelete(debt.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    >
                      <iconify-icon icon="solar:trash-bin-linear" className="text-red-400" width="18"></iconify-icon>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      <DebtModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDebt(null);
        }}
        debt={editingDebt}
        accounts={accounts.filter(a => !a.archived)}
        onSave={(data) => {
          if (editingDebt) {
            updateDebt(editingDebt.id, data);
          } else {
            addDebt(data);
          }
          setIsModalOpen(false);
          setEditingDebt(null);
        }}
      />
    </div>
  );
}

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  accounts: any[];
  onSave: (data: Omit<Debt, 'id'>) => void;
}

function DebtModal({ isOpen, onClose, debt, accounts, onSave }: DebtModalProps) {
  const { settings } = useStore();
  const [formData, setFormData] = useState({
    name: debt?.name || '',
    balance: debt?.balance?.toString() || '',
    apr: debt?.apr?.toString() || '',
    minimumPayment: debt?.minimumPayment?.toString() || '',
    dueDate: debt?.dueDate?.toString() || '1',
    accountId: debt?.accountId || accounts[0]?.id || '',
    payoffStrategy: debt?.payoffStrategy || settings.payoffStrategy,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      balance: parseFloat(formData.balance) || 0,
      apr: parseFloat(formData.apr) || 0,
      minimumPayment: parseFloat(formData.minimumPayment) || 0,
      dueDate: parseInt(formData.dueDate),
      accountId: formData.accountId,
      payoffStrategy: formData.payoffStrategy as 'snowball' | 'avalanche',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={debt ? 'Edit Debt' : 'Add Debt'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Debt Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            placeholder="e.g., Credit Card, Student Loan"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Balance</label>
            <input
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              required
              min="0"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">APR (%)</label>
            <input
              type="number"
              step="0.01"
              value={formData.apr}
              onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
              required
              min="0"
              max="100"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Minimum Payment</label>
            <input
              type="number"
              step="0.01"
              value={formData.minimumPayment}
              onChange={(e) => setFormData({ ...formData, minimumPayment: e.target.value })}
              required
              min="0"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Due Date (day)</label>
            <input
              type="number"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              min="1"
              max="31"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Account</label>
          <select
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Payoff Strategy</label>
          <select
            value={formData.payoffStrategy}
            onChange={(e) => setFormData({ ...formData, payoffStrategy: e.target.value as 'snowball' | 'avalanche' })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="snowball">Snowball (Smallest balance first)</option>
            <option value="avalanche">Avalanche (Highest interest first)</option>
          </select>
        </div>

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
            {debt ? 'Update' : 'Add'} Debt
          </button>
        </div>
      </form>
    </Modal>
  );
}
