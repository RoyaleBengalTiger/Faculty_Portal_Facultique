// components/tasks/TaskDetailsModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  FileText,
  Tag,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { TaskView, SubmissionView } from '@/types/task';
import { taskApi } from '@/services/api';

interface TaskDetailsModalProps {
  task: TaskView | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  // ===== Submission state (NEW) =====
  const [submissions, setSubmissions] = useState<SubmissionView[]>([]);
  const [fetchingSubs, setFetchingSubs] = useState(false);

  useEffect(() => {
    const shouldFetch =
      isOpen && task?.id && (task.status === 'SUBMITTED' || task.status === 'COMPLETED');
    if (!shouldFetch) return;

    const run = async () => {
      setFetchingSubs(true);
      try {
        const history = await taskApi.getSubmissionHistory(task!.id);
        setSubmissions(Array.isArray(history) ? history : []);
      } catch {
        setSubmissions([]);
      } finally {
        setFetchingSubs(false);
      }
    };
    run();
  }, [isOpen, task?.id, task?.status]);

  const latestRelevantSubmission = useMemo(() => {
    if (!submissions?.length) return null;
    const sorted = [...submissions].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    if (task?.status === 'COMPLETED') {
      return sorted.find((s) => s.decision === 'APPROVED') ?? sorted[0];
    }
    if (task?.status === 'SUBMITTED') {
      return sorted.find((s) => s.decision === 'PENDING') ?? sorted[0];
    }
    return sorted[0];
  }, [submissions, task?.status]);

  if (!task) return null;

  // ===== UI helpers (existing) =====
  const StatusBadge: React.FC<{ status: TaskView['status'] }> = ({ status }) => {
    const getStatusConfig = (s: TaskView['status']) => {
      switch (s) {
        case 'COMPLETED':
          return {
            className: 'bg-status-completed/15 text-status-completed border-status-completed/30',
            icon: <CheckCircle className="h-3 w-3" />
          };
        case 'IN_PROGRESS':
          return {
            className: 'bg-status-in-progress/15 text-status-in-progress border-status-in-progress/30',
            icon: <Clock className="h-3 w-3" />
          };
        case 'SUBMITTED':
          return {
            className: 'bg-status-submitted/15 text-status-submitted border-status-submitted/30',
            icon: <CheckCircle className="h-3 w-3" />
          };
        case 'PENDING':
          return {
            className: 'bg-status-pending/15 text-status-pending border-status-pending/30',
            icon: <Clock className="h-3 w-3" />
          };
        case 'OVERDUE':
          return {
            className: 'bg-status-overdue/15 text-status-overdue border-status-overdue/30',
            icon: <XCircle className="h-3 w-3" />
          };
        default:
          return {
            className: 'bg-muted/50 text-muted-foreground border-border',
            icon: <Clock className="h-3 w-3" />
          };
      }
    };
    const config = getStatusConfig(status);
    return (
      <Badge className={`${config.className} border inline-flex items-center gap-1`}>
        {config.icon}
        <span>{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  const PriorityBadge: React.FC<{ priority: number }> = ({ priority }) => {
    const getPriorityConfig = (p: number) => {
      if (p >= 8) {
        return {
          className: 'bg-status-overdue/15 text-status-overdue border-status-overdue/30',
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'High Priority'
        };
    } else if (p >= 5) {
        return {
          className: 'bg-status-pending/15 text-status-pending border-status-pending/30',
          icon: <Clock className="h-3 w-3" />,
          label: 'Medium Priority'
        };
      } else {
        return {
          className: 'bg-status-completed/15 text-status-completed border-status-completed/30',
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Low Priority'
        };
      }
    };
    const config = getPriorityConfig(priority);
    return (
      <Badge className={`${config.className} border inline-flex items-center gap-1`}>
        {config.icon}
        <span>{config.label} ({priority})</span>
      </Badge>
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            {task.title}
            {task.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
          </DialogTitle>
          <DialogDescription>
            Task details and information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              <StatusBadge status={task.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Priority:</span>
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">Description</h3>
            </div>
            <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg">
              {task.description || 'No description provided'}
            </p>
          </div>
          {/* Links */}
          {task.links && task.links.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Reference Links</h3>
              </div>
              <div className="pl-6 space-y-2">
                {task.links.map((link, i) => (
                  <a
                    key={i}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
          {/* Task Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Due Date</span>
              </div>
              <p className="text-muted-foreground pl-6">
                {formatDate(task.dueAt)}
              </p>
            </div>

            {/* Assigned To */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Assigned To</span>
              </div>
              <p className="text-muted-foreground pl-6">
                {task.assignedTo.name || task.assignedTo.email}
              </p>
            </div>

            {/* Assigned By */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Assigned By</span>
              </div>
              <p className="text-muted-foreground pl-6">
                {task.assignedBy.name || task.assignedBy.email}
              </p>
            </div>

            {/* Created Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Created</span>
              </div>
              <p className="text-muted-foreground pl-6">
                {formatDate(task.createdAt)}
              </p>
            </div>

            {/* Updated Date */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Last Updated</span>
              </div>
              <p className="text-muted-foreground pl-6">
                {formatDate(task.updatedAt)}
              </p>
            </div>

            {/* Task Lock Status */}
            {task.locked && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">Status</span>
                </div>
                <p className="text-muted-foreground pl-6">
                  This task is locked
                </p>
              </div>
            )}
          </div>

          {/* ===== Submission Section (NEW) ===== */}
          {(task.status === 'SUBMITTED' || task.status === 'COMPLETED') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-foreground">Submission</h3>
              </div>

              {fetchingSubs ? (
                <div className="text-sm text-muted-foreground pl-6">
                  Loading submission details…
                </div>
              ) : latestRelevantSubmission ? (
                <div className="space-y-3 pl-6">
                  <div>
                    <Label className="text-sm font-medium">Summary</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                      {latestRelevantSubmission.summary}
                    </div>
                  </div>

                  {latestRelevantSubmission.links?.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Links</Label>
                      <div className="mt-1 space-y-2">
                        {latestRelevantSubmission.links.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Submitted: {formatDate(latestRelevantSubmission.submittedAt)} · Decision: {latestRelevantSubmission.decision}
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground pl-6">
                  No submission details found.
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {/* {task.status === 'PENDING' && !task.locked && (
              <Button
                onClick={() => {
                  // hook your start action here if needed
                  onClose();
                }}
              >
                Start Task
              </Button>
            )} */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
