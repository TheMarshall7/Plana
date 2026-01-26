// Account Types
export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit'
  | 'cash'
  | 'investment'
  | 'crypto'
  | 'loan'
  | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color?: string;
  institution?: string;
  archived: boolean;
  integrationId?: string;
  integrationType?: 'paypal' | 'stripe' | 'gohighlevel';
  ownership?: 'brian' | 'nadine' | 'joint';
}

// Transaction Types
export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  date: string;
  notes?: string;
  externalId?: string;
  isSplit?: boolean;
  splitTransactionId?: string;
  coupleMemberId?: string;
  tripId?: string;
  paidBy?: 'brian' | 'nadine';
}

// Travel Types
export interface ItineraryItem {
  id: string;
  tripId: string;
  date: string;
  time?: string;
  activity: string;
  category: 'flight' | 'stay' | 'food' | 'activity' | 'transport' | 'other';
  location?: string;
  cost?: number;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes?: string;
  itinerary: ItineraryItem[];
  documents?: string[]; // URLs or storage refs
  isArchived?: boolean;
}

// Budget
export interface BudgetCategory {
  category: string;
  budgeted: number;
  spent: number;
  month: string; // YYYY-MM format
}

export interface Budget {
  month: string; // YYYY-MM format
  categories: BudgetCategory[];
}

// Subscription/Bill
export type BillCadence = 'weekly' | 'monthly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  cadence: BillCadence;
  dueDate: number; // Day of month
  category: string;
  accountId: string;
  cancelled?: boolean;
  cancelledDate?: string;
}

// Goal
export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  dueDate?: string;
  isShared?: boolean;
  coupleMemberId?: string;
}

// Debt
export interface Debt {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  dueDate: number; // Day of month
  accountId: string;
  payoffStrategy?: 'snowball' | 'avalanche';
}

// Couples
export interface CouplesSettings {
  enabled: boolean;
  funMoneyAmount: number;
  jointSpendingThreshold: number;
  checkInFrequency?: 'weekly' | 'biweekly' | 'monthly';
  lastCheckIn?: string;
}

// Settings
export interface Settings {
  userName?: string;
  guidedMode: boolean;
  beginnerMode: boolean;
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  paySchedule?: string;
  payoffStrategy: 'snowball' | 'avalanche';
  onboardingCompleted: boolean;
  seedData: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
}

// Toast
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// User
export interface User {
  id: string;
  name: string;
  avatar?: string;
  color: string;
}

// App State
export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: Subscription[];
  goals: Goal[];
  debts: Debt[];
  couples: CouplesSettings;
  settings: Settings;
  toasts: Toast[];
  trips: Trip[];
  users: User[];
  activeUserId: string;

  // Actions
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addBudget: (budget: Budget) => void;
  updateBudget: (month: string, updates: Partial<Budget>) => void;

  addSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (id: string, updates: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;

  updateCouples: (updates: Partial<CouplesSettings>) => void;
  updateSettings: (updates: Partial<Settings>) => void;

  addTrip: (trip: Omit<Trip, 'id' | 'itinerary'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  addItineraryItem: (tripId: string, item: Omit<ItineraryItem, 'id' | 'tripId'>) => void;
  updateItineraryItem: (tripId: string, itemId: string, updates: Partial<ItineraryItem>) => void;
  deleteItineraryItem: (tripId: string, itemId: string) => void;

  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  setActiveUser: (id: string) => void;
  updateUser: (id: string, updates: Partial<User>) => void;

  // Utilities
  getAccountBalance: (accountId: string) => number;
  getSafeToSpend: () => number;
  exportData: () => string;
  importData: (data: string) => void;
  resetToSeed: () => void;
}
