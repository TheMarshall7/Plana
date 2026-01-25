import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from 'date-fns';
import type { Transaction } from '../../store/types';

interface TransactionTimelineChartProps {
  transactions: Transaction[];
  days?: number;
}

export default function TransactionTimelineChart({ transactions, days = 30 }: TransactionTimelineChartProps) {
  const chartData = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    const dailyData = dateRange.map(date => {
      const dayTransactions = transactions.filter(t => {
        const tDate = parseISO(t.date);
        return format(startOfDay(tDate), 'yyyy-MM-dd') === format(startOfDay(date), 'yyyy-MM-dd');
      });

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        date: format(date, 'MMM d'),
        income,
        expenses,
        net: income - expenses,
      };
    });

    return dailyData;
  }, [transactions, days]);

  return (
    <div className="w-full h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
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
          />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
            name="Income"
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={false}
            name="Expenses"
          />
          <Line 
            type="monotone" 
            dataKey="net" 
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={false}
            name="Net"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
