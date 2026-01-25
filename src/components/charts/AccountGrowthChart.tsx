import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import type { Account, Transaction } from '../../store/types';

interface AccountGrowthChartProps {
  accounts: Account[];
  transactions: Transaction[];
  months?: number;
}

export default function AccountGrowthChart({ accounts, transactions, months = 6 }: AccountGrowthChartProps) {
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

      const accountBalances: Record<string, number> = {};
      accounts.forEach(acc => {
        const initialBalance = acc.balance;
        const accountTransactions = monthTransactions.filter(t => t.accountId === acc.id);
        const transactionBalance = accountTransactions.reduce((sum, t) => sum + t.amount, 0);
        accountBalances[acc.name] = initialBalance + transactionBalance;
      });

      return {
        month: format(month, 'MMM yyyy'),
        ...accountBalances,
      };
    });
  }, [accounts, transactions, months]);

  const accountColors = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899'];

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
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}
          />
          {accounts.map((acc, index) => (
            <Line 
              key={acc.id}
              type="monotone" 
              dataKey={acc.name} 
              stroke={acc.color || accountColors[index % accountColors.length]} 
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
