import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TaskTrend } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TrendsLineChartProps {
  data: TaskTrend[];
  title: string;
}

export const TrendsLineChart: React.FC<TrendsLineChartProps> = ({ data, title }) => {
  // Normalize once so the chart never sees undefined/NaN
  const chartData = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr.map((d) => ({
      month: (d?.month ?? '').toString().trim() || '—',
      assigned: Number.isFinite((d as any)?.assigned) ? Number((d as any).assigned) : 0,
      completed: Number.isFinite((d as any)?.completed) ? Number((d as any).completed) : 0,
      overdue: Number.isFinite((d as any)?.overdue) ? Number((d as any).overdue) : 0,
    }));
  }, [data]);

  // Empty state: clearer than plotting an empty array
  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No trend data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="month"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))',
              }}
              formatter={(value: any) => (Number.isFinite(value) ? value : 0)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="assigned"
              stroke="hsl(var(--primary))"
              name="Assigned"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--status-completed))"
              name="Completed"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="overdue"
              stroke="hsl(var(--status-overdue))"
              name="Overdue"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
