import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Debt } from '../../store/types';

interface DebtPayoffChartProps {
  debts: Debt[];
  payoffStrategy: 'snowball' | 'avalanche';
}

export default function DebtPayoffChart({ debts, payoffStrategy }: DebtPayoffChartProps) {
  const chartData = useMemo(() => {
    const sortedDebts = [...debts].sort((a, b) => {
      if (payoffStrategy === 'snowball') {
        return a.balance - b.balance;
      } else {
        return b.apr - a.apr;
      }
    });

    const months: { month: number; debts: { name: string; balance: number }[] }[] = [];
    let currentDebts = sortedDebts.map(d => ({ name: d.name, balance: d.balance }));
    let month = 0;
    const maxMonths = 60; // 5 years max

    while (currentDebts.length > 0 && month < maxMonths) {
      months.push({
        month,
        debts: currentDebts.map(d => ({ ...d })),
      });

      // Pay off first debt
      if (currentDebts.length > 0) {
        const firstDebt = currentDebts[0];
        const debt = sortedDebts.find(d => d.name === firstDebt.name);
        if (debt) {
          const monthlyInterest = firstDebt.balance * (debt.apr / 100) / 12;
          const principalPayment = debt.minimumPayment - monthlyInterest;
          firstDebt.balance = Math.max(0, firstDebt.balance - principalPayment);

          if (firstDebt.balance <= 0) {
            currentDebts = currentDebts.slice(1);
          }
        }
      }

      month++;
    }

    // Format for chart
    const formattedData = months.map(m => {
      const data: Record<string, number> = { month: m.month };
      m.debts.forEach(debt => {
        data[debt.name] = Math.round(debt.balance);
      });
      return data;
    });

    return formattedData;
  }, [debts, payoffStrategy]);

  const colors = ['#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="w-full h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="month" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '10px' }}
            label={{ value: 'Months', position: 'insideBottom', offset: -5, style: { fill: 'rgba(255,255,255,0.5)' } }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '10px' }}
            label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft', style: { fill: 'rgba(255,255,255,0.5)' } }}
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
          {debts.map((debt, index) => (
            <Line 
              key={debt.id}
              type="monotone" 
              dataKey={debt.name} 
              stroke={colors[index % colors.length]} 
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
