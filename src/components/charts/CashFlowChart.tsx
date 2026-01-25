import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import type { Transaction, Subscription } from '../../store/types';

interface CashFlowChartProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
  months?: number;
}

export default function CashFlowChart({ transactions, subscriptions, months = 6 }: CashFlowChartProps) {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subMonths(endDate, months);
    const monthRange = eachMonthOfInterval({ start: startDate, end: endDate });

    return monthRange.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = startOfMonth(subMonths(month, -1));
      
      const monthTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        return tDate >= monthStart && tDate < monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const monthBills = subscriptions
        .filter(s => !s.cancelled)
        .filter(s => {
          if (s.cadence === 'monthly') return true;
          if (s.cadence === 'yearly') {
            const billMonth = s.dueDate - 1;
            return billMonth === month.getMonth();
          }
          if (s.cadence === 'weekly') {
            return true; // Approximate
          }
          return false;
        })
        .reduce((sum, s) => {
          if (s.cadence === 'weekly') return sum + (s.amount * 4.33);
          return sum + s.amount;
        }, 0);

      return {
        month: format(month, 'MMM yyyy'),
        income: Math.round(income),
        expenses: Math.round(expenses),
        bills: Math.round(monthBills),
        net: Math.round(income - expenses - monthBills),
      };
    });
  }, [transactions, subscriptions, months]);

  return (
    <div className="w-full h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="month" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '10px' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '10px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}
          />
          <Bar dataKey="income" fill="#10b981" name="Income" />
          <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          <Bar dataKey="bills" fill="#f59e0b" name="Bills" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
