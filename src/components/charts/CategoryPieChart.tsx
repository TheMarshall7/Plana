import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Transaction } from '../../store/types';

interface CategoryPieChartProps {
  transactions: Transaction[];
  type?: 'income' | 'expense';
}

// Premium color palette with better contrast and vibrancy
const COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
  '#a855f7', // purple
];

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

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{
          fontSize: '12px',
          fontWeight: '600',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full h-64 lg:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <radialGradient key={`gradient-${index}`} id={`gradient-${index}`}>
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.8} />
              </radialGradient>
            ))}
          </defs>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={90}
            innerRadius={55}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`url(#gradient-${index % COLORS.length})`}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              color: '#fff'
            }}
            labelStyle={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '4px'
            }}
            itemStyle={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: '12px'
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend
            wrapperStyle={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.7)',
              paddingTop: '10px'
            }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

