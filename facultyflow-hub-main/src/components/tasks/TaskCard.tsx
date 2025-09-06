import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { TaskSubmissionModal } from './TaskSubmissionModal';
import { TaskReviewModal } from './TaskReviewModal';
import { TaskDetailsModal } from './TaskDetailsModal'; // ✅ import modal
import { TaskView } from '@/types/task';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, User, AlertCircle, Play, Send, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: TaskView;
  onAction?: (taskId: number, action: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onAction }) => {
  const { user } = useAuth();

  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false); // ✅ added

  const isOverdue = new Date(task.dueAt) < new Date() && task.status !== 'COMPLETED';

  // Faculty permissions
  const canStartTask =
    user?.role === 'FACULTY' && (task.status === 'PENDING' || task.status === 'OVERDUE');
  const canSubmitTask = user?.role === 'FACULTY' && task.status === 'IN_PROGRESS';

  // HOD permissions
  const canReviewTask = user?.role === 'HOD' && task.status === 'SUBMITTED';

  const handleTaskAction = (action: string) => {
    onAction?.(task.id, action);
  };

  const handleSubmission = () => {
    onAction?.(task.id, 'refresh');
  };

  const handleReview = () => {
    onAction?.(task.id, 'refresh');
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'bg-destructive text-destructive-foreground';
    if (priority >= 5) return 'bg-status-pending text-status-pending-foreground';
    return 'bg-muted text-muted-foreground';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'High';
    if (priority >= 5) return 'Medium';
    return 'Low';
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
              <StatusBadge status={task.status} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{task.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Due: {format(new Date(task.dueAt), 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              By: {task.assignedBy.name}
            </div>
          </div>

          {isOverdue && task.status !== 'COMPLETED' && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              Task is overdue
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {canStartTask && (
              <Button
                onClick={() => handleTaskAction('start')}
                className="bg-status-in-progress hover:bg-status-in-progress/80 text-status-in-progress-foreground"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Task
              </Button>
            )}

            {canSubmitTask && (
              <Button
                onClick={() => setSubmissionModalOpen(true)}
                className="bg-status-submitted hover:bg-status-submitted/80 text-status-submitted-foreground"
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Work
              </Button>
            )}

            {canReviewTask && (
              <Button onClick={() => setReviewModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Eye className="mr-2 h-4 w-4" />
                Review Task
              </Button>
            )}

            {/* ✅ View Details opens the TaskDetailsModal */}
            <Button onClick={() => setDetailsOpen(true)} variant="outline">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <TaskSubmissionModal
        task={task}
        open={submissionModalOpen}
        onOpenChange={setSubmissionModalOpen}
        onSubmit={handleSubmission}
      />

      <TaskReviewModal
        task={task}
        open={reviewModalOpen}
        onOpenChange={setReviewModalOpen}
        onReview={handleReview}
      />

      {/* ✅ Task Details Modal */}
      <TaskDetailsModal
        task={task}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
};
