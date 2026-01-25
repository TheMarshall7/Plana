import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import type { Transaction } from '../../store/types';

interface SpendingTrendChartProps {
  transactions: Transaction[];
  months?: number;
}

export default function SpendingTrendChart({ transactions, months = 6 }: SpendingTrendChartProps) {
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

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        month: format(month, 'MMM yyyy'),
        spending: Math.round(expenses),
      };
    });
  }, [transactions, months]);

  return (
    <div className="w-full h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
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
          <Line 
            type="monotone" 
            dataKey="spending" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            name="Spending"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
