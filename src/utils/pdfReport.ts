import jsPDF from 'jspdf';
import type { Account, Transaction, Budget, Subscription, Goal, Debt } from '../store/types';
import { format, parseISO } from 'date-fns';

export function generatePDFReport(data: {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  subscriptions: Subscription[];
  goals: Goal[];
  debts: Debt[];
}) {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Plana Finance Report', 20, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 20, yPos);
  yPos += 15;

  // Accounts Summary
  doc.setFontSize(16);
  doc.text('Accounts Summary', 20, yPos);
  yPos += 10;
  doc.setFontSize(10);
  
  const totalBalance = data.accounts
    .filter(a => !a.archived)
    .reduce((sum, a) => sum + a.balance, 0);
  doc.text(`Total Balance: $${totalBalance.toLocaleString()}`, 20, yPos);
  yPos += 8;

  data.accounts.filter(a => !a.archived).forEach(acc => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`${acc.name} (${acc.type}): $${acc.balance.toLocaleString()}`, 25, yPos);
    yPos += 6;
  });
  yPos += 5;

  // Transactions Summary
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFontSize(16);
  doc.text('Recent Transactions', 20, yPos);
  yPos += 10;
  doc.setFontSize(10);

  const recentTransactions = data.transactions
    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
    .slice(0, 20);

  recentTransactions.forEach(t => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const date = format(parseISO(t.date), 'MMM d, yyyy');
    doc.text(`${date} - ${t.description}: $${Math.abs(t.amount).toLocaleString()}`, 25, yPos);
    yPos += 6;
  });
  yPos += 5;

  // Goals Summary
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFontSize(16);
  doc.text('Goals', 20, yPos);
  yPos += 10;
  doc.setFontSize(10);

  data.goals.forEach(goal => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    doc.text(`${goal.name}: $${goal.currentAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()} (${progress.toFixed(0)}%)`, 25, yPos);
    yPos += 6;
  });
  yPos += 5;

  // Debts Summary
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }
  doc.setFontSize(16);
  doc.text('Debts', 20, yPos);
  yPos += 10;
  doc.setFontSize(10);

  const totalDebt = data.debts.reduce((sum, d) => sum + d.balance, 0);
  doc.text(`Total Debt: $${totalDebt.toLocaleString()}`, 25, yPos);
  yPos += 8;

  data.debts.forEach(debt => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`${debt.name}: $${debt.balance.toLocaleString()} (APR: ${debt.apr}%)`, 25, yPos);
    yPos += 6;
  });

  // Save
  doc.save(`plana-report-${new Date().toISOString().split('T')[0]}.pdf`);
}
