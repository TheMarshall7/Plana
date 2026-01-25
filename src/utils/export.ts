import Papa from 'papaparse';
import type { Account, Transaction, Budget, Subscription, Goal, Debt } from '../store/types';

export function exportToCSV(data: {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: Subscription[];
  goals: Goal[];
  debts: Debt[];
}) {
  // Export Transactions
  const transactionsCSV = Papa.unparse(data.transactions.map(t => ({
    Date: t.date,
    Description: t.description,
    Amount: t.amount,
    Type: t.type,
    Category: t.category,
    Account: t.accountId,
    Notes: t.notes || '',
  })));

  // Export Accounts
  const accountsCSV = Papa.unparse(data.accounts.map(a => ({
    Name: a.name,
    Type: a.type,
    Balance: a.balance,
    Institution: a.institution || '',
    Archived: a.archived,
  })));

  // Export Subscriptions
  const subscriptionsCSV = Papa.unparse(data.subscriptions.map(s => ({
    Name: s.name,
    Amount: s.amount,
    Cadence: s.cadence,
    DueDate: s.dueDate,
    Category: s.category,
    Cancelled: s.cancelled || false,
  })));

  // Export Goals
  const goalsCSV = Papa.unparse(data.goals.map(g => ({
    Name: g.name,
    TargetAmount: g.targetAmount,
    CurrentAmount: g.currentAmount,
    DueDate: g.dueDate || '',
    Shared: g.isShared || false,
  })));

  // Export Debts
  const debtsCSV = Papa.unparse(data.debts.map(d => ({
    Name: d.name,
    Balance: d.balance,
    APR: d.apr,
    MinimumPayment: d.minimumPayment,
    DueDate: d.dueDate,
  })));

  // Combine all CSV data
  const combinedCSV = [
    '=== TRANSACTIONS ===',
    transactionsCSV,
    '\n=== ACCOUNTS ===',
    accountsCSV,
    '\n=== SUBSCRIPTIONS ===',
    subscriptionsCSV,
    '\n=== GOALS ===',
    goalsCSV,
    '\n=== DEBTS ===',
    debtsCSV,
  ].join('\n');

  // Download
  const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `plana-export-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTransactionsToCSV(transactions: Transaction[]) {
  const csv = Papa.unparse(transactions.map(t => ({
    Date: t.date,
    Description: t.description,
    Amount: t.amount,
    Type: t.type,
    Category: t.category,
    Account: t.accountId,
    Notes: t.notes || '',
  })));

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
