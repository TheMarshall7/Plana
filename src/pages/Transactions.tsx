import { useState, useMemo } from 'react';
import { useStore } from '../store/store';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import Modal from '../components/Modal';
import TransactionTimelineChart from '../components/charts/TransactionTimelineChart';
import type { Transaction, Account } from '../store/types';

const categories = [
  'Salary', 'Freelance', 'Investment', 'Other Income',
  'Groceries', 'Dining', 'Transportation', 'Bills', 'Entertainment',
  'Shopping', 'Healthcare', 'Education', 'Travel', 'Other Expense'
];

export default function Transactions() {
  const { transactions, accounts, addTransaction, updateTransaction, deleteTransaction } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Account filter
    if (filterAccount !== 'all') {
      filtered = filtered.filter(t => t.accountId === filterAccount);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let start: Date, end: Date;
      
      if (dateFilter === 'today') {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
      } else if (dateFilter === 'week') {
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        end = new Date();
      } else if (dateFilter === 'month') {
        start = startOfMonth(now);
        end = endOfMonth(now);
      } else if (dateFilter === '3months') {
        start = subMonths(now, 3);
        end = new Date();
      }
      
      filtered = filtered.filter(t => {
        const tDate = parseISO(t.date);
        return tDate >= start! && tDate <= end!;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = parseISO(a.date).getTime() - parseISO(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = Math.abs(a.amount) - Math.abs(b.amount);
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchQuery, filterAccount, filterCategory, filterType, dateFilter, sortBy, sortOrder]);

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedIds.size} transaction(s)?`)) {
      selectedIds.forEach(id => deleteTransaction(id));
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  return (
    <div className="px-5 lg:px-0 py-8 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white/90">Transactions</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <iconify-icon icon="solar:add-linear" width="20"></iconify-icon>
          Add
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
          />
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
        </div>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="3months">Last 3 Months</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-emerald-500/50"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-xs hover:bg-white/10 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm font-medium transition-colors"
            >
              Delete {selectedIds.size}
            </button>
          )}
        </div>
      </div>

      {/* Transaction Timeline Chart */}
      {filteredTransactions.length > 0 && (
        <div className="glass-card rounded-2xl p-4 lg:p-6">
          <h3 className="text-sm font-medium text-white/90 mb-4">Transaction Timeline</h3>
          <TransactionTimelineChart transactions={filteredTransactions} days={30} />
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-2 lg:space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-white/60">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2 lg:mb-3">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-white/20 bg-white/5"
              />
              <span className="text-xs lg:text-sm text-white/50">Select All</span>
            </div>
            <div className="lg:space-y-2">
              {filteredTransactions.map((transaction) => {
              const account = accounts.find(a => a.id === transaction.accountId);
              const isIncome = transaction.type === 'income';
              const isExpense = transaction.type === 'expense';
              
              return (
                <div
                  key={transaction.id}
                  className="glass-card rounded-2xl p-4 lg:p-5 flex items-center gap-3 hover:bg-white/5 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(transaction.id)}
                    onChange={() => toggleSelect(transaction.id)}
                    className="w-4 h-4 rounded border-white/20 bg-white/5"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white/90">{transaction.description}</p>
                      <p className={`text-sm font-semibold ${isIncome ? 'text-emerald-400' : isExpense ? 'text-red-400' : 'text-white/70'}`}>
                        {isIncome ? '+' : isExpense ? '-' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span>{format(parseISO(transaction.date), 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{transaction.category}</span>
                      {account && (
                        <>
                          <span>•</span>
                          <span>{account.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                    >
                      <iconify-icon icon="solar:pen-linear" className="text-white/70" width="18"></iconify-icon>
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    >
                      <iconify-icon icon="solar:trash-bin-linear" className="text-red-400" width="18"></iconify-icon>
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        accounts={accounts.filter(a => !a.archived)}
        onSave={(data) => {
          if (editingTransaction) {
            updateTransaction(editingTransaction.id, data);
          } else {
            addTransaction(data);
          }
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
      />
    </div>
  );
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  accounts: Account[];
  onSave: (data: Omit<Transaction, 'id'>) => void;
}

function TransactionModal({ isOpen, onClose, transaction, accounts, onSave }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    accountId: transaction?.accountId || accounts[0]?.id || '',
    amount: transaction ? Math.abs(transaction.amount).toString() : '',
    type: transaction?.type || 'expense',
    category: transaction?.category || '',
    description: transaction?.description || '',
    date: transaction?.date || format(new Date(), 'yyyy-MM-dd'),
    notes: transaction?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;
    
    onSave({
      accountId: formData.accountId,
      amount: formData.type === 'income' ? amount : -amount,
      type: formData.type as any,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      notes: formData.notes || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-sm font-medium text-white/70 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' | 'transfer' })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
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
            <label className="block text-sm font-medium text-white/70 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
            />
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

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Notes (optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
          />
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
            {transaction ? 'Update' : 'Add'} Transaction
          </button>
        </div>
      </form>
    </Modal>
  );
}
