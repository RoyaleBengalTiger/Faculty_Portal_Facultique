// components/dashboard/TasksChartCard.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from 'lucide-react';
import TasksPieChart from './TasksPieChart';

const TasksChartCard = ({ tasks }) => {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-primary" />
          Task Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TasksPieChart tasks={tasks} />
      </CardContent>
    </Card>
  );
};

export default TasksChartCard;
