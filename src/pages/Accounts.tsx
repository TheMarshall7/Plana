import { useState } from 'react';
import { useStore } from '../store/store';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import AccountGrowthChart from '../components/charts/AccountGrowthChart';
import AccountBalanceChart from '../components/charts/AccountBalanceChart';
import type { Account, AccountType } from '../store/types';

const accountTypes: { value: AccountType; label: string; icon: string }[] = [
  { value: 'checking', label: 'Checking', icon: 'solar:card-linear' },
  { value: 'savings', label: 'Savings', icon: 'solar:wallet-money-linear' },
  { value: 'credit', label: 'Credit Card', icon: 'solar:card-2-linear' },
  { value: 'cash', label: 'Cash', icon: 'solar:money-bag-linear' },
  { value: 'investment', label: 'Investment', icon: 'solar:chart-2-linear' },
  { value: 'crypto', label: 'Crypto', icon: 'solar:bitcoin-linear' },
  { value: 'loan', label: 'Loan', icon: 'solar:document-text-linear' },
  { value: 'other', label: 'Other', icon: 'solar:folder-linear' },
];

const colors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6', '#6366f1'];

export default function Accounts() {
  const { accounts, addAccount, updateAccount, deleteAccount, transactions } = useStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const activeAccounts = accounts.filter(a => !a.archived);
  const archivedAccounts = accounts.filter(a => a.archived);

  const handleAdd = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this account? This will also delete all associated transactions.')) {
      deleteAccount(id);
    }
  };

  const handleArchive = (id: string, archived: boolean) => {
    updateAccount(id, { archived });
  };

  const getAccountTransactions = (accountId: string) => {
    return transactions.filter(t => t.accountId === accountId);
  };

  const getAccountBalance = (account: Account) => {
    const accountTransactions = getAccountTransactions(account.id);
    const transactionBalance = accountTransactions.reduce((sum, t) => sum + t.amount, 0);
    return account.balance + transactionBalance;
  };

  const totalBalance = activeAccounts.reduce((sum, acc) => sum + getAccountBalance(acc), 0);
  const totalDebt = activeAccounts
    .filter(a => a.type === 'credit' || a.type === 'loan')
    .reduce((sum, acc) => {
      const balance = getAccountBalance(acc);
      return sum + (balance < 0 ? Math.abs(balance) : 0);
    }, 0);

  return (
    <div className="px-5 lg:px-0 py-8 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white/90">Accounts</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <iconify-icon icon="solar:add-linear" width="20"></iconify-icon>
          Add Account
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">Total Balance</p>
          <p className="text-xl font-semibold text-white/90">${totalBalance.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">Total Debt</p>
          <p className="text-xl font-semibold text-red-400">${totalDebt.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      {activeAccounts.length > 0 && (
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0 space-y-5">
          <div className="glass-card rounded-2xl p-4 lg:p-6">
            <h3 className="text-sm font-medium text-white/90 mb-4">Account Growth (6 Months)</h3>
            <AccountGrowthChart accounts={activeAccounts} transactions={transactions} months={6} />
          </div>
          <div className="glass-card rounded-2xl p-4 lg:p-6">
            <h3 className="text-sm font-medium text-white/90 mb-4">Balance Distribution</h3>
            <AccountBalanceChart accounts={activeAccounts} transactions={transactions} />
          </div>
        </div>
      )}

      {/* Account List */}
      <div className="space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm lg:text-base font-medium text-white/80">Active Accounts</h2>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="text-xs lg:text-sm text-emerald-400/80 hover:text-emerald-300 transition-colors"
          >
            {showArchived ? 'Hide' : 'Show'} Archived
          </button>
        </div>

        {activeAccounts.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-white/60 mb-4">No accounts yet</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-colors"
            >
              Add Your First Account
            </button>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 space-y-3">
            {activeAccounts.map((account) => {
            const balance = getAccountBalance(account);
            const accountType = accountTypes.find(t => t.value === account.type);
            
            return (
              <div
                key={account.id}
                className="glass-card rounded-2xl p-4 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/transactions?account=${account.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: account.color || '#10b981', opacity: 0.2 }}
                    >
                      <iconify-icon
                        icon={accountType?.icon || 'solar:folder-linear'}
                        className="text-white"
                        width="24"
                      ></iconify-icon>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">{account.name}</p>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>{accountType?.label}</span>
                        {account.institution && (
                          <>
                            <span>•</span>
                            <span>{account.institution}</span>
                          </>
                        )}
                        {account.integrationType && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400">{account.integrationType}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${balance >= 0 ? 'text-white/90' : 'text-red-400'}`}>
                      ${balance.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(account);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                      >
                        <iconify-icon icon="solar:pen-linear" className="text-white/70" width="18"></iconify-icon>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchive(account.id, true);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                      >
                        <iconify-icon icon="solar:archive-linear" className="text-white/70" width="18"></iconify-icon>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(account.id);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-colors"
                      >
                        <iconify-icon icon="solar:trash-bin-linear" className="text-red-400" width="18"></iconify-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}

        {showArchived && archivedAccounts.length > 0 && (
          <>
            <h2 className="text-sm font-medium text-white/80 mt-6">Archived Accounts</h2>
            {archivedAccounts.map((account) => {
              const balance = getAccountBalance(account);
              const accountType = accountTypes.find(t => t.value === account.type);
              
              return (
                <div
                  key={account.id}
                  className="glass-card rounded-2xl p-4 opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: account.color || '#10b981', opacity: 0.2 }}
                      >
                        <iconify-icon
                          icon={accountType?.icon || 'solar:folder-linear'}
                          className="text-white"
                          width="24"
                        ></iconify-icon>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/90">{account.name}</p>
                        <p className="text-xs text-white/50">{accountType?.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${balance >= 0 ? 'text-white/90' : 'text-red-400'}`}>
                        ${balance.toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleArchive(account.id, false)}
                        className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                      >
                        <iconify-icon icon="solar:restart-linear" className="text-white/70" width="18"></iconify-icon>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        onSave={(data) => {
          if (editingAccount) {
            updateAccount(editingAccount.id, data);
          } else {
            addAccount(data);
          }
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
      />
    </div>
  );
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSave: (data: Omit<Account, 'id'>) => void;
}

function AccountModal({ isOpen, onClose, account, onSave }: AccountModalProps) {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    type: (account?.type || 'checking') as AccountType,
    balance: account?.balance?.toString() || '0',
    color: account?.color || colors[0],
    institution: account?.institution || '',
    integrationType: account?.integrationType || '',
    integrationId: account?.integrationId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.balance) || 0,
      color: formData.color,
      institution: formData.institution || undefined,
      integrationType: (formData.integrationType as 'paypal' | 'stripe' | 'gohighlevel' | undefined) || undefined,
      integrationId: formData.integrationId || undefined,
      archived: false,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account ? 'Edit Account' : 'Add Account'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Account Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            placeholder="e.g., Chase Checking"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Account Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as AccountType })}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            {accountTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Starting Balance</label>
          <input
            type="number"
            step="0.01"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Color</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  formData.color === color ? 'border-white scale-110' : 'border-white/20'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Institution (optional)</label>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            placeholder="e.g., Chase, Bank of America"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Integration (optional)</label>
          <select
            value={formData.integrationType}
            onChange={(e) => setFormData({ ...formData, integrationType: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="">None</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
            <option value="gohighlevel">GoHighLevel</option>
          </select>
        </div>

        {formData.integrationType && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Integration ID / API Key</label>
            <input
              type="text"
              value={formData.integrationId}
              onChange={(e) => setFormData({ ...formData, integrationId: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
              placeholder="Enter API key or connection ID"
            />
          </div>
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
            {account ? 'Update' : 'Add'} Account
          </button>
        </div>
      </form>
    </Modal>
  );
}
