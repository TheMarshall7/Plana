import { useState, useMemo } from 'react';
import { useStore } from '../store/store';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO } from 'date-fns';
import Modal from '../components/Modal';
import type { Budget, BudgetCategory } from '../store/types';

const categories = [
  'Groceries', 'Dining', 'Transportation', 'Bills', 'Entertainment',
  'Shopping', 'Healthcare', 'Education', 'Travel', 'Other Expense'
];

export default function Budget() {
  const { budgets, transactions, addBudget, updateBudget } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);

  const currentBudget = budgets.find(b => b.month === selectedMonth);
  const budgetCategories = currentBudget?.categories || [];

  // Calculate actual spending for each category in the selected month
  const actualSpending = useMemo(() => {
    const monthStart = startOfMonth(parseISO(selectedMonth + '-01'));
    const monthEnd = endOfMonth(parseISO(selectedMonth + '-01'));
    
    const monthTransactions = transactions.filter(t => {
      const tDate = parseISO(t.date);
      return tDate >= monthStart && tDate <= monthEnd && t.type === 'expense';
    });

    const spending: Record<string, number> = {};
    monthTransactions.forEach(t => {
      spending[t.category] = (spending[t.category] || 0) + Math.abs(t.amount);
    });

    return spending;
  }, [transactions, selectedMonth]);

  const budgetData = useMemo(() => {
    return categories.map(category => {
      const budgetCat = budgetCategories.find(c => c.category === category);
      const budgeted = budgetCat?.budgeted || 0;
      const spent = actualSpending[category] || 0;
      const remaining = budgeted - spent;
      const isOverspent = spent > budgeted;
      const hasSurplus = budgeted > 0 && spent < budgeted * 0.7;

      return {
        category,
        budgeted,
        spent,
        remaining,
        isOverspent,
        hasSurplus,
      };
    });
  }, [budgetCategories, actualSpending]);

  const totalBudgeted = budgetData.reduce((sum, d) => sum + d.budgeted, 0);
  const totalSpent = budgetData.reduce((sum, d) => sum + d.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSaveCategory = (data: BudgetCategory) => {
    const existingCategories = budgetCategories.filter(c => c.category !== data.category);
    const newCategories = [...existingCategories, data];

    if (currentBudget) {
      updateBudget(selectedMonth, { categories: newCategories });
    } else {
      addBudget({ month: selectedMonth, categories: newCategories });
    }
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryName: string) => {
    const newCategories = budgetCategories.filter(c => c.category !== categoryName);
    if (currentBudget) {
      updateBudget(selectedMonth, { categories: newCategories });
    }
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const current = parseISO(selectedMonth + '-01');
    const newMonth = direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1);
    setSelectedMonth(format(newMonth, 'yyyy-MM'));
  };

  return (
    <div className="px-5 lg:px-0 py-8 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white/90">Budget</h1>
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <iconify-icon icon="solar:add-linear" width="20"></iconify-icon>
          Add Category
        </button>
      </div>

      {/* Month Selector */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeMonth('prev')}
            className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <iconify-icon icon="solar:alt-arrow-left-linear" className="text-white/70" width="20"></iconify-icon>
          </button>
          <h2 className="text-lg font-semibold text-white/90">
            {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => changeMonth('next')}
            className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <iconify-icon icon="solar:alt-arrow-right-linear" className="text-white/70" width="20"></iconify-icon>
          </button>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">Budgeted</p>
          <p className="text-lg font-semibold text-white/90">${totalBudgeted.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">Spent</p>
          <p className="text-lg font-semibold text-white/90">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">Remaining</p>
          <p className={`text-lg font-semibold ${totalRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${totalRemaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Spending by Category Chart */}
      {transactions.filter(t => {
        const tDate = parseISO(t.date);
        const monthStart = startOfMonth(parseISO(selectedMonth + '-01'));
        const monthEnd = endOfMonth(parseISO(selectedMonth + '-01'));
        return tDate >= monthStart && tDate <= monthEnd && t.type === 'expense';
      }).length > 0 && (
        <div className="glass-card rounded-2xl p-4 lg:p-6">
          <h3 className="text-sm font-medium text-white/90 mb-4">Spending by Category</h3>
          <CategoryPieChart 
            transactions={transactions.filter(t => {
              const tDate = parseISO(t.date);
              const monthStart = startOfMonth(parseISO(selectedMonth + '-01'));
              const monthEnd = endOfMonth(parseISO(selectedMonth + '-01'));
              return tDate >= monthStart && tDate <= monthEnd;
            })} 
            type="expense" 
          />
        </div>
      )}

      {/* Budget Categories */}
      <div className="space-y-3">
        {budgetData
          .filter(d => d.budgeted > 0)
          .map((data) => {
            const percentage = data.budgeted > 0 ? (data.spent / data.budgeted) * 100 : 0;
            const budgetCat = budgetCategories.find(c => c.category === data.category);

            return (
              <div
                key={data.category}
                className={`glass-card rounded-2xl p-4 ${
                  data.isOverspent ? 'border border-red-500/50' : data.hasSurplus ? 'border border-emerald-500/50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white/90">{data.category}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/50">${data.spent.toLocaleString()} / ${data.budgeted.toLocaleString()}</span>
                        <span className={`text-xs font-medium ${data.isOverspent ? 'text-red-400' : 'text-emerald-400'}`}>
                          {data.remaining >= 0 ? '+' : ''}${data.remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          data.isOverspent ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    {budgetCat && (
                      <>
                        <button
                          onClick={() => handleEditCategory(budgetCat)}
                          className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                        >
                          <iconify-icon icon="solar:pen-linear" className="text-white/70" width="18"></iconify-icon>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(data.category)}
                          className="w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-colors"
                        >
                          <iconify-icon icon="solar:trash-bin-linear" className="text-red-400" width="18"></iconify-icon>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {data.isOverspent && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <iconify-icon icon="solar:danger-triangle-linear" width="14"></iconify-icon>
                    Overspent by ${Math.abs(data.remaining).toLocaleString()}
                  </p>
                )}
                {data.hasSurplus && (
                  <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                    <iconify-icon icon="solar:check-circle-linear" width="14"></iconify-icon>
                    Surplus detected
                  </p>
                )}
              </div>
            );
          })}

        {budgetData.filter(d => d.budgeted > 0).length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-white/60 mb-4">No budget categories set for this month</p>
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-colors"
            >
              Add Your First Category
            </button>
          </div>
        )}
      </div>

      {/* Budget Modal */}
      <BudgetCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSave={handleSaveCategory}
      />
    </div>
  );
}

interface BudgetCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: BudgetCategory | null;
  onSave: (data: BudgetCategory) => void;
}

function BudgetCategoryModal({ isOpen, onClose, category, onSave }: BudgetCategoryModalProps) {
  const [selectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [formData, setFormData] = useState({
    category: category?.category || '',
    budgeted: category?.budgeted?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      category: formData.category,
      budgeted: parseFloat(formData.budgeted) || 0,
      spent: category?.spent || 0,
      month: selectedMonth,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? 'Edit Budget Category' : 'Add Budget Category'}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-sm font-medium text-white/70 mb-1">Budgeted Amount</label>
          <input
            type="number"
            step="0.01"
            value={formData.budgeted}
            onChange={(e) => setFormData({ ...formData, budgeted: e.target.value })}
            required
            min="0"
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
            {category ? 'Update' : 'Add'} Category
          </button>
        </div>
      </form>
    </Modal>
  );
}

