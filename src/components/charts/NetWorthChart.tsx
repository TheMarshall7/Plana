import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
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
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.4)"
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              color: '#fff'
            }}
            labelStyle={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '12px',
              marginBottom: '4px'
            }}
            itemStyle={{
              color: '#10b981',
              fontSize: '14px',
              fontWeight: '600'
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Net Worth']}
            cursor={{ stroke: 'rgba(16, 185, 129, 0.2)', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorNetWorth)"
            filter="url(#glow)"
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

