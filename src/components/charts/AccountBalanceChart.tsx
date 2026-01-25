import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Account, Transaction } from '../../store/types';

interface AccountBalanceChartProps {
  accounts: Account[];
  transactions: Transaction[];
}

export default function AccountBalanceChart({ accounts, transactions }: AccountBalanceChartProps) {
  const chartData = useMemo(() => {
    const accountBalances = accounts
      .filter(a => !a.archived)
      .map(acc => {
        const accountTransactions = transactions.filter(t => t.accountId === acc.id);
        const transactionBalance = accountTransactions.reduce((sum, t) => sum + t.amount, 0);
        const balance = acc.balance + transactionBalance;
        return {
          name: acc.name,
          value: Math.abs(balance),
          color: acc.color || '#10b981',
        };
      })
      .filter(item => item.value > 0);

    return accountBalances;
  }, [accounts, transactions]);

  return (
    <div className="w-full h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
