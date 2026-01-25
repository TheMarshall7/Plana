import { useState, useMemo } from 'react';
import { useStore } from '../store/store';
import { format, startOfMonth, endOfMonth, addMonths, parseISO, eachDayOfInterval, startOfWeek } from 'date-fns';
import CashFlowChart from '../components/charts/CashFlowChart';
import type { Transaction, Subscription } from '../store/types';

export default function CashFlow() {
  const { transactions, subscriptions, accounts } = useStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'projection'>('calendar');

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const nextMonth = addMonths(selectedMonth, 1);

  // Calculate current month cash flow
  const currentMonthFlow = useMemo(() => {
    const monthTransactions = transactions.filter(t => {
      const tDate = parseISO(t.date);
      return tDate >= monthStart && tDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const upcomingBills = subscriptions
      .filter(s => !s.cancelled && s.dueDate >= monthStart.getDate() && s.dueDate <= monthEnd.getDate())
      .reduce((sum, s) => sum + s.amount, 0);

    return {
      income,
      expenses,
      bills: upcomingBills,
      net: income - expenses - upcomingBills,
    };
  }, [transactions, subscriptions, monthStart, monthEnd]);

  // Calculate projected next month
  const projectedNextMonth = useMemo(() => {
    const lastMonthTransactions = transactions.filter(t => {
      const tDate = parseISO(t.date);
      const lastMonth = addMonths(selectedMonth, -1);
      const lastMonthStart = startOfMonth(lastMonth);
      const lastMonthEnd = endOfMonth(lastMonth);
      return tDate >= lastMonthStart && tDate <= lastMonthEnd;
    });

    const avgIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const avgExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / lastMonthTransactions.filter(t => t.type === 'expense').length || 1;

    const nextMonthBills = subscriptions
      .filter(s => !s.cancelled)
      .filter(s => {
        if (s.cadence === 'monthly') return true;
        if (s.cadence === 'yearly') {
          const billMonth = s.dueDate - 1;
          return billMonth === nextMonth.getMonth();
        }
        return false;
      })
      .reduce((sum, s) => {
        if (s.cadence === 'weekly') return sum + (s.amount * 4.33);
        return sum + s.amount;
      }, 0);

    const projectedExpenses = avgExpenses * 30; // Rough estimate
    const projectedIncome = avgIncome;
    const projectedNet = projectedIncome - projectedExpenses - nextMonthBills;

    return {
      income: projectedIncome,
      expenses: projectedExpenses,
      bills: nextMonthBills,
      net: projectedNet,
    };
  }, [transactions, subscriptions, selectedMonth, nextMonth]);

  // Get current cash balance
  const currentCash = accounts
    .filter(a => (a.type === 'checking' || a.type === 'savings') && !a.archived)
    .reduce((sum, a) => {
      const accountTransactions = transactions.filter(t => t.accountId === a.id);
      const transactionBalance = accountTransactions.reduce((s, t) => s + t.amount, 0);
      return sum + a.balance + transactionBalance;
    }, 0);

  const projectedBalance = currentCash + projectedNextMonth.net;
  const lowCashWarning = projectedBalance < 500;

  // Calendar view data
  const calendarDays = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days.map(day => {
      const dayTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        return format(tDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      const dayIncome = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const dayExpenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const dayBills = subscriptions
        .filter(s => !s.cancelled && s.dueDate === day.getDate())
        .reduce((sum, s) => sum + s.amount, 0);

      return {
        date: day,
        income: dayIncome,
        expenses: dayExpenses,
        bills: dayBills,
        net: dayIncome - dayExpenses - dayBills,
      };
    });
  }, [transactions, subscriptions, monthStart, monthEnd]);

  return (
    <div className="px-5 lg:px-0 py-8 space-y-5 lg:space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white/90">Cash Flow</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setViewMode('projection')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'projection'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Projection
          </button>
        </div>
      </div>

      {/* Current Month Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">Current Cash</p>
          <p className="text-xl font-semibold text-white/90">${currentCash.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-white/50 mb-1">This Month Net</p>
          <p className={`text-xl font-semibold ${currentMonthFlow.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ${currentMonthFlow.net.toLocaleString()}
          </p>
        </div>
      </div>

      {lowCashWarning && (
        <div className="glass-card rounded-2xl p-4 border border-yellow-500/50">
          <div className="flex items-center gap-2">
            <iconify-icon icon="solar:danger-triangle-linear" className="text-yellow-400" width="20"></iconify-icon>
            <p className="text-sm text-yellow-400 font-medium">Low Cash Warning</p>
          </div>
          <p className="text-xs text-white/60 mt-1">
            Projected balance will be below $500. Consider reducing expenses or increasing income.
          </p>
        </div>
      )}

      {/* Cash Flow Chart */}
      <div className="glass-card rounded-2xl p-4 lg:p-6">
        <h3 className="text-sm font-medium text-white/90 mb-4">Cash Flow (6 Months)</h3>
        <CashFlowChart transactions={transactions} subscriptions={subscriptions} months={6} />
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedMonth(addMonths(selectedMonth, -1))}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <iconify-icon icon="solar:alt-arrow-left-linear" className="text-white/70" width="20"></iconify-icon>
            </button>
            <h2 className="text-lg font-semibold text-white/90">
              {format(selectedMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              className="w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <iconify-icon icon="solar:alt-arrow-right-linear" className="text-white/70" width="20"></iconify-icon>
            </button>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-white/50 font-medium py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const _weekStart = startOfWeek(monthStart);
                const _dayOfWeek = day.date.getDay();
                const isCurrentMonth = day.date.getMonth() === selectedMonth.getMonth();
                
                return (
                  <div
                    key={index}
                    className={`aspect-square p-1 rounded-lg ${
                      isCurrentMonth ? 'bg-white/5' : 'bg-white/0'
                    } ${day.net < 0 ? 'border border-red-500/30' : day.net > 0 ? 'border border-emerald-500/30' : ''}`}
                  >
                    <div className="text-xs text-white/70 font-medium mb-1">
                      {format(day.date, 'd')}
                    </div>
                    {day.income > 0 && (
                      <div className="text-[10px] text-emerald-400">+${day.income.toFixed(0)}</div>
                    )}
                    {day.expenses > 0 && (
                      <div className="text-[10px] text-red-400">-${day.expenses.toFixed(0)}</div>
                    )}
                    {day.bills > 0 && (
                      <div className="text-[10px] text-yellow-400">${day.bills.toFixed(0)}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white/90">Month Breakdown</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Income</span>
                <span className="text-sm font-medium text-emerald-400">${currentMonthFlow.income.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Expenses</span>
                <span className="text-sm font-medium text-red-400">${currentMonthFlow.expenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Bills</span>
                <span className="text-sm font-medium text-yellow-400">${currentMonthFlow.bills.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-white/90">Net</span>
                <span className={`text-sm font-semibold ${currentMonthFlow.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${currentMonthFlow.net.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm font-medium text-white/90 mb-4">Next Month Projection</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Projected Income</span>
                <span className="text-sm font-medium text-emerald-400">${projectedNextMonth.income.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Projected Expenses</span>
                <span className="text-sm font-medium text-red-400">${projectedNextMonth.expenses.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Upcoming Bills</span>
                <span className="text-sm font-medium text-yellow-400">${projectedNextMonth.bills.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-white/90">Projected Net</span>
                <span className={`text-sm font-semibold ${projectedNextMonth.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ${projectedNextMonth.net.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4">
            <p className="text-sm font-medium text-white/90 mb-1">Projected Balance</p>
            <p className={`text-2xl font-semibold ${projectedBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${projectedBalance.toLocaleString()}
            </p>
            <p className="text-xs text-white/60 mt-1">
              {format(nextMonth, 'MMMM yyyy')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
