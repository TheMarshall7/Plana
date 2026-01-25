import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction } from '../../store/types';

interface CategoryPieChartProps {
  transactions: Transaction[];
  type?: 'income' | 'expense';
}

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6', '#6366f1', '#f97316', '#84cc16'];

export default function CategoryPieChart({ transactions, type = 'expense' }: CategoryPieChartProps) {
  const chartData = useMemo(() => {
    const filtered = transactions.filter(t => t.type === type);
    const categoryMap: Record<string, number> = {};

    filtered.forEach(t => {
      const amount = Math.abs(t.amount);
      categoryMap[t.category] = (categoryMap[t.category] || 0) + amount;
    });

    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [transactions, type]);

  return (
    <div className="w-full h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          <Legend 
            wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
