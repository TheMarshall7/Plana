import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, Account, Transaction, Subscription, Goal, Debt, Settings, Trip, ItineraryItem } from './types';

// Background cloud sync - debounced and non-blocking
let supabaseSyncTimeout: NodeJS.Timeout | null = null;
let pendingSyncData: string | null = null;

const syncToSupabase = async (stateJson: string) => {
  try {
    // Check if online (mobile-friendly)
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('📴 Offline - will retry Supabase sync when online');
      pendingSyncData = stateJson;
      return;
    }

    const state = JSON.parse(stateJson);
    const { supabaseUrl, supabaseKey } = state.settings || {};

    if (supabaseUrl && supabaseKey) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for mobile

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/user_data?id=eq.primary`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: 'primary',
            data: state,
            updated_at: new Date().toISOString()
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log('✅ Supabase sync successful');
          pendingSyncData = null; // Clear pending data on success
        } else {
          console.warn('⚠️ Supabase sync failed:', response.status);
          pendingSyncData = stateJson; // Store for retry
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.warn('⏱️ Supabase sync timeout - will retry');
        } else {
          console.warn('❌ Supabase sync error:', fetchError);
        }
        pendingSyncData = stateJson; // Store for retry
      }
    }
  } catch (error) {
    console.warn('❌ Cloud sync failed:', error);
    pendingSyncData = stateJson; // Store for retry
  }
};

const debouncedSupabaseSync = (stateJson: string) => {
  // Clear existing timeout
  if (supabaseSyncTimeout) {
    clearTimeout(supabaseSyncTimeout);
  }

  // Set new timeout (500ms debounce for mobile)
  supabaseSyncTimeout = setTimeout(() => {
    syncToSupabase(stateJson);
  }, 500);
};

// Retry pending sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (pendingSyncData) {
      console.log('🌐 Back online - retrying Supabase sync');
      syncToSupabase(pendingSyncData);
    }
  });
}

// Load initial data from Supabase on app start
const loadFromSupabase = async (): Promise<any | null> => {
  try {
    const localData = localStorage.getItem('plana-storage');
    if (!localData) return null;

    const parsed = JSON.parse(localData);
    const { supabaseUrl, supabaseKey } = parsed.state?.settings || {};

    if (supabaseUrl && supabaseKey) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/user_data?select=data&limit=1`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          if (result && result.length > 0) {
            console.log('✅ Loaded data from Supabase');
            return result[0].data;
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.warn('⚠️ Supabase fetch failed, using local storage');
      }
    }
  } catch (error) {
    console.warn('❌ Failed to load from Supabase');
  }
  return null;
};

// Try to load from Supabase on startup
if (typeof window !== 'undefined') {
  loadFromSupabase().then(cloudData => {
    if (cloudData) {
      // Merge cloud data with local data
      const localData = localStorage.getItem('plana-storage');
      if (localData) {
        const local = JSON.parse(localData);
        // Cloud data takes precedence
        localStorage.setItem('plana-storage', JSON.stringify({ ...local, state: cloudData }));
        // Trigger a re-render by updating the store
        if (window.location.pathname) {
          window.location.reload();
        }
      }
    }
  });
}

// Seed data for demo
const seedAccounts: Account[] = [
  { id: '1', name: 'Chase Checking', type: 'checking', balance: 4200, color: '#10b981', institution: 'Chase', archived: false, userId: 'brian' },
  { id: '2', name: 'Savings', type: 'savings', balance: 15000, color: '#06b6d4', archived: false, userId: 'brian' },
  { id: '3', name: 'Credit Card', type: 'credit', balance: -1200, color: '#f59e0b', archived: false, userId: 'brian' },
  { id: '4', name: 'Nadine Checking', type: 'checking', balance: 3200, color: '#8b5cf6', institution: 'Wells Fargo', archived: false, userId: 'nadine' },
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
  supabaseUrl: 'https://evlnjtakkvwlxxspmelt.supabase.co',
  supabaseKey: 'sb_secret_Ol-q0ujOBh2eWR1HgAmgcg_iXvJFIzx',
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: [],
      transactions: [],
      budgets: [],
      subscriptions: [],
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

      updateSettings: (updates) => {
        set((state) => ({ settings: { ...state.settings, ...updates } }));
      },

      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now().toString();
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }],
        }));
      },
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      trips: [],
      addTrip: (trip) => {
        const newTrip: Trip = {
          ...trip,
          id: Date.now().toString(),
          itinerary: [],
        };
        set((state) => ({ trips: [...state.trips, newTrip] }));
      },
      updateTrip: (id, updates) => {
        set((state) => ({
          trips: state.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },
      deleteTrip: (id) => {
        set((state) => ({ trips: state.trips.filter((t) => t.id !== id) }));
      },
      addItineraryItem: (tripId, item) => {
        const newItem: ItineraryItem = {
          ...item,
          id: Date.now().toString(),
          tripId,
        };
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId ? { ...t, itinerary: [...t.itinerary, newItem] } : t
          ),
        }));
      },
      updateItineraryItem: (tripId, itemId, updates) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                ...t,
                itinerary: t.itinerary.map((item) =>
                  item.id === itemId ? { ...item, ...updates } : item
                ),
              }
              : t
          ),
        }));
      },
      deleteItineraryItem: (tripId, itemId) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === tripId
              ? {
                ...t,
                itinerary: t.itinerary.filter((item) => item.id !== itemId),
              }
              : t
          ),
        }));
      },

      users: [
        { id: 'brian', name: 'Brian', avatar: '/avatars/brian.png', color: '#10b981' },
        { id: 'nadine', name: 'Nadine', avatar: '/avatars/nadine.png', color: '#8b5cf6' },
      ],
      activeUserId: 'brian',
      setActiveUser: (id) => set({ activeUserId: id }),
      updateUser: (id, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }));
      },

      unreadNotifications: true,
      markNotificationsRead: () => set({ unreadNotifications: false }),

      // Utilities
      getAccountBalance: (accountId) => {
        const state = get();
        const account = state.accounts.find((a) => a.id === accountId);
        if (!account) return 0;
        const accountTransactions = state.transactions.filter(t => t.accountId === accountId);
        return account.balance + accountTransactions.reduce((sum, t) => sum + t.amount, 0);
      },

      getSafeToSpend: () => {
        const { accounts, subscriptions, getAccountBalance } = get();
        const checkingAccounts = accounts.filter((a) => a.type === 'checking' && !a.archived);
        const totalCash = checkingAccounts.reduce((sum, acc) => sum + getAccountBalance(acc.id), 0);

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
          trips: state.trips,
          couples: state.couples,
          settings: state.settings,
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
            trips: imported.trips || [],
            couples: imported.couples || { enabled: false, funMoneyAmount: 0, jointSpendingThreshold: 0 },
            settings: imported.settings || seedSettings,
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
      storage: createJSONStorage(() => localStorage), // Synchronous for mobile!
      partialize: (state) => {
        const { toasts, ...rest } = state;
        return rest;
      },
    }
  )
);

// Background cloud sync subscription
if (typeof window !== 'undefined') {
  useStore.subscribe((state) => {
    // Get the full state as JSON
    const stateJson = JSON.stringify(state);
    // Trigger debounced cloud sync
    debouncedSupabaseSync(stateJson);
  });
}

