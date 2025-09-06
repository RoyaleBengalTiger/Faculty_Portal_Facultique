import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TaskStatus } from '@/types/task';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    className: 'bg-status-pending text-status-pending-foreground hover:bg-status-pending/80',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-status-in-progress text-status-in-progress-foreground hover:bg-status-in-progress/80',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-status-submitted text-status-submitted-foreground hover:bg-status-submitted/80',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-status-completed text-status-completed-foreground hover:bg-status-completed/80',
  },
  OVERDUE: {
    label: 'Overdue',
    className: 'bg-status-overdue text-status-overdue-foreground hover:bg-status-overdue/80',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};