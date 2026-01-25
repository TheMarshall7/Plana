import { useState } from 'react';
import { useStore } from '../store/store';
import { format, parseISO, isAfter } from 'date-fns';
import Modal from '../components/Modal';
import type { Goal } from '../store/types';

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const activeGoals = goals.filter(g => {
    if (!g.dueDate) return true;
    return isAfter(parseISO(g.dueDate), new Date()) || g.currentAmount < g.targetAmount;
  });
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount);

  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  const handleAdd = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id);
    }
  };

  const handleContribute = (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      updateGoal(id, { currentAmount: goal.currentAmount + amount });
    }
  };

  return (
    <div className="px-5 lg:px-0 py-8 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white/90">Goals</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 btn-primary text-white rounded-lg font-medium flex items-center gap-2"
        >
          <iconify-icon icon="solar:add-linear" width="20"></iconify-icon>
          Add Goal
        </button>
      </div>

      {/* Summary */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs text-white/50 mb-2">Overall Progress</p>
        <div className="flex items-center justify-between mb-2">
          <p className="text-2xl font-semibold text-white/90">
            ${totalCurrent.toLocaleString()} / ${totalTarget.toLocaleString()}
          </p>
          <p className="text-sm font-medium text-emerald-400">{totalProgress.toFixed(0)}%</p>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(totalProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Active Goals */}
      <div className="space-y-3">
        {activeGoals.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <p className="text-white/60 mb-4">No active goals</p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-colors"
            >
              Add Your First Goal
            </button>
          </div>
        ) : (
          activeGoals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysRemaining = goal.dueDate ? Math.ceil((parseISO(goal.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

            return (
              <div
                key={goal.id}
                className={`glass-card rounded-2xl p-4 ${isCompleted ? 'border border-emerald-500/50' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white/90">{goal.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/50">
                          ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-emerald-400">{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      {goal.dueDate && (
                        <>
                          <span>Due: {format(parseISO(goal.dueDate), 'MMM d, yyyy')}</span>
                          {daysRemaining !== null && (
                            <span className={daysRemaining < 30 ? 'text-yellow-400' : ''}>
                              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                            </span>
                          )}
                        </>
                      )}
                      {goal.isShared && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Shared</span>
                        </>
                      )}
                    </div>
                    {!isCompleted && remaining > 0 && (
                      <p className="text-xs text-white/60 mt-2">
                        ${remaining.toLocaleString()} remaining
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1 ml-3">
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          const amount = prompt('Enter contribution amount:');
                          if (amount) {
                            handleContribute(goal.id, parseFloat(amount) || 0);
                          }
                        }}
                        className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                      >
                        Add
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(goal)}
                      className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                    >
                      <iconify-icon icon="solar:pen-linear" className="text-white/70" width="18"></iconify-icon>
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-colors"
                    >
                      <iconify-icon icon="solar:trash-bin-linear" className="text-red-400" width="18"></iconify-icon>
                    </button>
                  </div>
                </div>
                {isCompleted && (
                  <div className="mt-2 p-2 bg-emerald-500/10 rounded-lg flex items-center gap-2">
                    <iconify-icon icon="solar:check-circle-linear" className="text-emerald-400" width="16"></iconify-icon>
                    <span className="text-xs text-emerald-400 font-medium">Goal completed!</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-white/80 mt-6">Completed</h2>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="glass-card rounded-2xl p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90">{goal.name}</p>
                    <p className="text-xs text-white/50">
                      ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                  <iconify-icon icon="solar:check-circle-linear" className="text-emerald-400" width="24"></iconify-icon>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={(data) => {
          if (editingGoal) {
            updateGoal(editingGoal.id, data);
          } else {
            addGoal(data);
          }
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
      />
    </div>
  );
}

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSave: (data: Omit<Goal, 'id'>) => void;
}

function GoalModal({ isOpen, onClose, goal, onSave }: GoalModalProps) {
  const [formData, setFormData] = useState({
    name: goal?.name || '',
    targetAmount: goal?.targetAmount?.toString() || '',
    currentAmount: goal?.currentAmount?.toString() || '0',
    dueDate: goal?.dueDate || '',
    isShared: goal?.isShared || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount) || 0,
      currentAmount: parseFloat(formData.currentAmount) || 0,
      dueDate: formData.dueDate || undefined,
      isShared: formData.isShared,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={goal ? 'Edit Goal' : 'Add Goal'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Goal Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            placeholder="e.g., Trip to Japan, Emergency Fund"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Target Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              required
              min="0.01"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Current Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.currentAmount}
              onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
              required
              min="0"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Due Date (optional)</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isShared}
            onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
            className="w-4 h-4 rounded border-white/20 bg-white/5"
          />
          <label className="text-sm text-white/70">Shared goal (for couples)</label>
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
            {goal ? 'Update' : 'Add'} Goal
          </button>
        </div>
      </form>
    </Modal>
  );
}
