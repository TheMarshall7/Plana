import { useState, useMemo } from 'react';
import { useStore } from '../store/store';
import { format, parseISO } from 'date-fns';
import Modal from '../components/Modal';
import type { Subscription, BillCadence } from '../store/types';

const categories = [
  'Bills', 'Entertainment', 'Software', 'Streaming', 'Health', 'Education', 'Other'
];

export default function Subscriptions() {
  const { subscriptions, accounts, addSubscription, updateSubscription, deleteSubscription } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterCadence, setFilterCadence] = useState<string>('all');

  const activeSubscriptions = subscriptions.filter(s => !s.cancelled);
  const cancelledSubscriptions = subscriptions.filter(s => s.cancelled);

  const filteredSubscriptions = useMemo(() => {
    let filtered = [...activeSubscriptions];

    if (filterAccount !== 'all') {
      filtered = filtered.filter(s => s.accountId === filterAccount);
    }

    if (filterCadence !== 'all') {
      filtered = filtered.filter(s => s.cadence === filterCadence);
    }

    return filtered;
  }, [activeSubscriptions, filterAccount, filterCadence]);

  const totalMonthly = filteredSubscriptions
    .filter(s => s.cadence === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);
  const totalYearly = filteredSubscriptions
    .filter(s => s.cadence === 'yearly')
    .reduce((sum, s) => sum + s.amount, 0) / 12;
  const totalWeekly = filteredSubscriptions
    .filter(s => s.cadence === 'weekly')
    .reduce((sum, s) => sum + s.amount, 0) * 4.33;
  const totalMonthlyEquivalent = totalMonthly + totalYearly + totalWeekly;

  const getNextDueDate = (subscription: Subscription) => {
    const now = new Date();
    const currentDay = now.getDate();
    let dueDate = new Date(now.getFullYear(), now.getMonth(), subscription.dueDate);
    
    if (subscription.cadence === 'weekly') {
      dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + (7 - (dueDate.getDay() || 7) + 1));
    } else if (subscription.cadence === 'yearly') {
      dueDate = new Date(now.getFullYear(), subscription.dueDate - 1, 1);
      if (dueDate < now) {
        dueDate = new Date(now.getFullYear() + 1, subscription.dueDate - 1, 1);
      }
    } else {
      if (dueDate < now || (dueDate.getDate() < currentDay && subscription.dueDate < currentDay)) {
        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, subscription.dueDate);
      }
    }
    
    return dueDate;
  };

  const handleAdd = () => {
    setEditingSubscription(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      deleteSubscription(id);
    }
  };

  const handleCancel = (id: string) => {
    updateSubscription(id, { cancelled: true, cancelledDate: format(new Date(), 'yyyy-MM-dd') });
  };

  return (
    <div className="px-5 lg:px-0 py-8 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white/90">Subscriptions</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <iconify-icon icon="solar:add-linear" width="20"></iconify-icon>
          Add Subscription
        </button>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs text-white/50 mb-1">Total Monthly Cost</p>
        <p className="text-2xl font-semibold text-white/90">${totalMonthlyEquivalent.toFixed(2)}</p>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="grid grid-cols-2 gap-3">
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Accounts</option>
            {accounts.filter(a => !a.archived).map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          <select
            value={filterCadence}
            onChange={(e) => setFilterCadence(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Cadences</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Subscription List */}
      <div className="space-y-3">
        {filteredSubscriptions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-white/60">No active subscriptions</p>
          </div>
        ) : (
          filteredSubscriptions.map((subscription) => {
            const account = accounts.find(a => a.id === subscription.accountId);
            const nextDue = getNextDueDate(subscription);
            const daysUntilDue = Math.ceil((nextDue.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            const isDueSoon = daysUntilDue <= 3;

            return (
              <div
                key={subscription.id}
                className={`glass-card rounded-2xl p-4 ${isDueSoon ? 'border border-yellow-500/50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white/90">{subscription.name}</p>
                      <p className="text-sm font-semibold text-white/90">${subscription.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span className="capitalize">{subscription.cadence}</span>
                      <span>•</span>
                      <span>{subscription.category}</span>
                      {account && (
                        <>
                          <span>•</span>
                          <span>{account.name}</span>
                        </>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-white/60">
                        Due: {format(nextDue, 'MMM d, yyyy')}
                      </span>
                      {isDueSoon && (
                        <span className="text-xs text-yellow-400 flex items-center gap-1">
                          <iconify-icon icon="solar:bell-linear" width="12"></iconify-icon>
                          {daysUntilDue === 0 ? 'Due today' : `${daysUntilDue} days`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                    >
                      <iconify-icon icon="solar:pen-linear" className="text-white/70" width="18"></iconify-icon>
                    </button>
                    <button
                      onClick={() => handleCancel(subscription.id)}
                      className="w-8 h-8 rounded-lg hover:bg-yellow-500/20 flex items-center justify-center transition-colors"
                    >
                      <iconify-icon icon="solar:close-circle-linear" className="text-yellow-400" width="18"></iconify-icon>
                    </button>
                    <button
                      onClick={() => handleDelete(subscription.id)}
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

        {cancelledSubscriptions.length > 0 && (
          <>
            <h2 className="text-sm font-medium text-white/80 mt-6">Cancelled</h2>
            {cancelledSubscriptions.map((subscription) => {
              const _account = accounts.find(a => a.id === subscription.accountId);
              return (
                <div key={subscription.id} className="glass-card rounded-2xl p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/90">{subscription.name}</p>
                      <p className="text-xs text-white/50">
                        Cancelled {subscription.cancelledDate && format(parseISO(subscription.cancelledDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSubscription(subscription.id, { cancelled: false, cancelledDate: undefined })}
                      className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubscription(null);
        }}
        subscription={editingSubscription}
        accounts={accounts.filter(a => !a.archived)}
        onSave={(data) => {
          if (editingSubscription) {
            updateSubscription(editingSubscription.id, data);
          } else {
            addSubscription(data);
          }
          setIsModalOpen(false);
          setEditingSubscription(null);
        }}
      />
    </div>
  );
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  accounts: any[];
  onSave: (data: Omit<Subscription, 'id'>) => void;
}

function SubscriptionModal({ isOpen, onClose, subscription, accounts, onSave }: SubscriptionModalProps) {
  const [formData, setFormData] = useState({
    name: subscription?.name || '',
    amount: subscription?.amount?.toString() || '',
    cadence: (subscription?.cadence || 'monthly') as BillCadence,
    dueDate: subscription?.dueDate?.toString() || '1',
    category: subscription?.category || '',
    accountId: subscription?.accountId || accounts[0]?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      amount: parseFloat(formData.amount) || 0,
      cadence: formData.cadence,
      dueDate: parseInt(formData.dueDate),
      category: formData.category,
      accountId: formData.accountId,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={subscription ? 'Edit Subscription' : 'Add Subscription'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            placeholder="e.g., Netflix, Spotify"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0.01"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Cadence</label>
            <select
              value={formData.cadence}
              onChange={(e) => setFormData({ ...formData, cadence: e.target.value as BillCadence })}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Due Date</label>
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
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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
            {subscription ? 'Update' : 'Add'} Subscription
          </button>
        </div>
      </form>
    </Modal>
  );
}
