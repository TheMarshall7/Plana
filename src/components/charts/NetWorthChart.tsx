import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import type { Account, Transaction } from '../../store/types';

interface NetWorthChartProps {
  accounts: Account[];
  transactions: Transaction[];
  months?: number;
}

export default function NetWorthChart({ accounts, transactions, months = 6 }: NetWorthChartProps) {
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

      let netWorth = 0;
      accounts.forEach(acc => {
        if (acc.archived) return;
        const initialBalance = acc.balance;
        const accountTransactions = monthTransactions.filter(t => t.accountId === acc.id);
        const transactionBalance = accountTransactions.reduce((sum, t) => sum + t.amount, 0);
        netWorth += initialBalance + transactionBalance;
      });

      return {
        month: format(month, 'MMM yyyy'),
        netWorth: Math.round(netWorth),
      };
    });
  }, [accounts, transactions, months]);

  return (
    <div className="w-full h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
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
          <Area 
            type="monotone" 
            dataKey="netWorth" 
            stroke="#10b981" 
            fillOpacity={1}
            fill="url(#colorNetWorth)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
