import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Account, Transaction, Subscription, Goal, Debt, Settings } from './types';

// Seed data for demo
const seedAccounts: Account[] = [
  { id: '1', name: 'Chase Checking', type: 'checking', balance: 4200, color: '#10b981', institution: 'Chase', archived: false },
  { id: '2', name: 'Savings', type: 'savings', balance: 15000, color: '#06b6d4', archived: false },
  { id: '3', name: 'Credit Card', type: 'credit', balance: -1200, color: '#f59e0b', archived: false },
];

const seedTransactions: Transaction[] = [
  { id: '1', accountId: '1', amount: 3850, type: 'income', category: 'Salary', description: 'Paycheck', date: '2026-01-15' },
  { id: '2', accountId: '1', amount: -120, type: 'expense', category: 'Groceries', description: 'Whole Foods', date: '2026-01-20' },
  { id: '3', accountId: '1', amount: -85, type: 'expense', category: 'Bills', description: 'Internet', date: '2026-01-18' },
];

const seedSettings: Settings = {
  guidedMode: false,
  beginnerMode: false,
  theme: 'dark',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  payoffStrategy: 'snowball',
  onboardingCompleted: false,
  seedData: true,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: seedAccounts,
      transactions: seedTransactions,
      budgets: [],
      subscriptions: [
        { id: '1', name: 'Spotify Premium', amount: 12.99, cadence: 'monthly', dueDate: 26, category: 'Entertainment', accountId: '1' },
        { id: '2', name: 'Internet', amount: 85, cadence: 'monthly', dueDate: 24, category: 'Bills', accountId: '1' },
      ],
      goals: [],
      debts: [],
      couples: { enabled: false, funMoneyAmount: 0, jointSpendingThreshold: 0 },
      settings: seedSettings,

      // Account actions
      addAccount: (account) => {
        const newAccount: Account = {
          ...account,
          id: Date.now().toString(),
        };
        set((state) => ({ accounts: [...state.accounts, newAccount] }));
      },
      updateAccount: (id, updates) => {
        set((state) => ({
          accounts: state.accounts.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc)),
        }));
      },
      deleteAccount: (id) => {
        set((state) => ({ accounts: state.accounts.filter((acc) => acc.id !== id) }));
      },

      // Transaction actions
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString(),
        };
        set((state) => ({ transactions: [...state.transactions, newTransaction] }));
      },
      updateTransaction: (id, updates) => {
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },
      deleteTransaction: (id) => {
        set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }));
      },

      // Budget actions
      addBudget: (budget) => {
        set((state) => ({ budgets: [...state.budgets.filter((b) => b.month !== budget.month), budget] }));
      },
      updateBudget: (month, updates) => {
        set((state) => ({
          budgets: state.budgets.map((b) => (b.month === month ? { ...b, ...updates } : b)),
        }));
      },

      // Subscription actions
      addSubscription: (subscription) => {
        const newSubscription: Subscription = {
          ...subscription,
          id: Date.now().toString(),
        };
        set((state) => ({ subscriptions: [...state.subscriptions, newSubscription] }));
      },
      updateSubscription: (id, updates) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },
      deleteSubscription: (id) => {
        set((state) => ({ subscriptions: state.subscriptions.filter((s) => s.id !== id) }));
      },

      // Goal actions
      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: Date.now().toString(),
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },
      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },
      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
      },

      // Debt actions
      addDebt: (debt) => {
        const newDebt: Debt = {
          ...debt,
          id: Date.now().toString(),
        };
        set((state) => ({ debts: [...state.debts, newDebt] }));
      },
      updateDebt: (id, updates) => {
        set((state) => ({
          debts: state.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }));
      },
      deleteDebt: (id) => {
        set((state) => ({ debts: state.debts.filter((d) => d.id !== id) }));
      },

      // Couples actions
      updateCouples: (updates) => {
        set((state) => ({ couples: { ...state.couples, ...updates } }));
      },

      // Settings actions
      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }));
      },

      // Utilities
      getAccountBalance: (accountId) => {
        const account = get().accounts.find((a) => a.id === accountId);
        return account?.balance || 0;
      },

      getSafeToSpend: () => {
        const { accounts, subscriptions, transactions } = get();
        const checkingAccounts = accounts.filter((a) => a.type === 'checking' && !a.archived);
        const totalCash = checkingAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        
        // Calculate upcoming bills
        const now = new Date();
        const upcomingBills = subscriptions
          .filter((s) => !s.cancelled && s.dueDate >= now.getDate())
          .reduce((sum, s) => sum + s.amount, 0);
        
        return Math.max(0, totalCash - upcomingBills);
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          accounts: state.accounts,
          transactions: state.transactions,
          budgets: state.budgets,
          subscriptions: state.subscriptions,
          goals: state.goals,
          debts: state.debts,
        }, null, 2);
      },

      importData: (data) => {
        try {
          const imported = JSON.parse(data);
          set({
            accounts: imported.accounts || [],
            transactions: imported.transactions || [],
            budgets: imported.budgets || [],
            subscriptions: imported.subscriptions || [],
            goals: imported.goals || [],
            debts: imported.debts || [],
          });
        } catch (error) {
          console.error('Failed to import data:', error);
        }
      },

      resetToSeed: () => {
        set({
          accounts: seedAccounts,
          transactions: seedTransactions,
          budgets: [],
          subscriptions: [
            { id: '1', name: 'Spotify Premium', amount: 12.99, cadence: 'monthly', dueDate: 26, category: 'Entertainment', accountId: '1' },
            { id: '2', name: 'Internet', amount: 85, cadence: 'monthly', dueDate: 24, category: 'Bills', accountId: '1' },
          ],
          goals: [],
          debts: [],
        });
      },

      // Additional utilities
      getNetWorth: () => {
        const { accounts, transactions } = get();
        let netWorth = 0;
        accounts.filter(a => !a.archived).forEach(acc => {
          const accountTransactions = transactions.filter(t => t.accountId === acc.id);
          const transactionBalance = accountTransactions.reduce((sum, t) => sum + t.amount, 0);
          netWorth += acc.balance + transactionBalance;
        });
        return netWorth;
      },

      getLowCashWarning: () => {
        const { accounts, transactions } = get();
        const checkingAccounts = accounts.filter(a => a.type === 'checking' && !a.archived);
        let totalCash = 0;
        checkingAccounts.forEach(acc => {
          const accountTransactions = transactions.filter(t => t.accountId === acc.id);
          const transactionBalance = accountTransactions.reduce((sum, t) => sum + t.amount, 0);
          totalCash += acc.balance + transactionBalance;
        });
        return totalCash < 500;
      },

      getOverspendingAlerts: () => {
        const { budgets, transactions } = get();
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentBudget = budgets.find(b => b.month === currentMonth);
        if (!currentBudget) return [];

        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.date);
          return tDate >= monthStart && tDate <= monthEnd && t.type === 'expense';
        });

        const alerts: string[] = [];
        currentBudget.categories.forEach(budgetCat => {
          const spent = monthTransactions
            .filter(t => t.category === budgetCat.category)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
          if (spent > budgetCat.budgeted) {
            alerts.push(`${budgetCat.category} is overspent by $${(spent - budgetCat.budgeted).toFixed(2)}`);
          }
        });
        return alerts;
      },
    }),
    {
      name: 'plana-storage',
      version: 1,
    }
  )
);
