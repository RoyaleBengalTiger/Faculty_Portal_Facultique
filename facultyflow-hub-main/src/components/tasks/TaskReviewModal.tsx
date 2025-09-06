import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TaskView, SubmissionView } from '@/types/task';
import { taskApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Check, X, ExternalLink, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

interface TaskReviewModalProps {
  task: TaskView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReview: () => void;
}

export const TaskReviewModal: React.FC<TaskReviewModalProps> = ({
  task,
  open,
  onOpenChange,
  onReview
}) => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<SubmissionView[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingSubmissions, setFetchingSubmissions] = useState(true);

  // Fetch submissions when modal opens
  useEffect(() => {
    if (open && task?.id) {
      fetchSubmissions();
    }
  }, [open, task?.id]);

  const fetchSubmissions = async () => {
    setFetchingSubmissions(true);
    try {
      const submissionsData = await taskApi.getSubmissionHistory(task?.id);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load task submissions',
        variant: 'destructive'
      });
    } finally {
      setFetchingSubmissions(false);
    }
  };

  const handleReview = async (decision: 'APPROVED' | 'REJECTED') => {
    setLoading(true);

    try {
      await taskApi.reviewTask(task?.id, decision, note.trim() || undefined);
      
      toast({
        title: 'Success',
        description: `Task ${decision.toLowerCase()} successfully!`,
      });

      setNote('');
      onReview();
      onOpenChange(false);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to review task',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const latestSubmission = submissions.find(s => s.decision === 'PENDING');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Review Task: {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Details */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                </div>
                <Badge variant="outline">{task.status.replace('_', ' ')}</Badge>
              </div>
              
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Assigned to: {task.assignedTo.name}
                </div>
                <div>Due: {format(new Date(task.dueAt), 'MMM dd, yyyy')}</div>
              </div>
            </CardContent>
          </Card>

          {/* Latest Submission */}
          {fetchingSubmissions ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading submission details...
            </div>
          ) : latestSubmission ? (
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Submitted Work</h4>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(latestSubmission.submittedAt), 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Summary</Label>
                    <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                      {latestSubmission.summary}
                    </div>
                  </div>
                  
                  {latestSubmission.links.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Supporting Links</Label>
                      <div className="mt-1 space-y-2">
                        {latestSubmission.links.map((link, index) => (
                          <a
                            key={index}
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
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No submissions found for this task.
            </div>
          )}

          {/* Review Section */}
          {latestSubmission && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Review Decision</h4>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="review-note">Review Notes (Optional)</Label>
                    <Textarea
                      id="review-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add feedback, suggestions, or reasons for your decision..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleReview('REJECTED')}
                      disabled={loading}
                      variant="outline"
                      className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      {loading ? (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Reject Task
                    </Button>
                    
                    <Button
                      onClick={() => handleReview('APPROVED')}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Approve Task
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
