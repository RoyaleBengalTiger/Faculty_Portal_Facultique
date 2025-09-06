import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FacultyPerformanceDto } from '@/types/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceBarChartProps {
  data: FacultyPerformanceDto[];
  title: string;
}

export const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ data, title }) => {
  // Normalize once, avoid runtime throws on bad/missing fields
  const chartData = useMemo(() => {
    const safe = Array.isArray(data) ? data : [];
    return safe.map((faculty) => {
      const fullName = faculty?.facultyName ?? 'Unknown';
      const firstName = String(fullName).trim().split(' ')[0] || 'Unknown';

      return {
        name: firstName,
        assigned: Number.isFinite(faculty?.tasksAssigned) ? Number(faculty!.tasksAssigned) : 0,
        completed: Number.isFinite(faculty?.tasksCompleted) ? Number(faculty!.tasksCompleted) : 0,
        inProgress: Number.isFinite(faculty?.tasksInProgress) ? Number(faculty!.tasksInProgress) : 0,
        overdue: Number.isFinite(faculty?.tasksOverdue) ? Number(faculty!.tasksOverdue) : 0,
      };
    });
  }, [data]);

  // Graceful empty state (Recharts tolerates [], but this is clearer for users)
  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No performance data available.
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
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="name"
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
            <Bar dataKey="assigned" fill="hsl(var(--primary))" name="Assigned" />
            <Bar dataKey="completed" fill="hsl(var(--status-completed))" name="Completed" />
            <Bar dataKey="inProgress" fill="hsl(var(--status-in-progress))" name="In Progress" />
            <Bar dataKey="overdue" fill="hsl(var(--status-overdue))" name="Overdue" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
