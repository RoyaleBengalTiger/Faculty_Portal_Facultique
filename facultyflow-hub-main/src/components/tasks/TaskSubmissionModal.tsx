import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TaskView } from '@/types/task';
import { taskApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Send, Link as LinkIcon, X, Plus } from 'lucide-react';

interface TaskSubmissionModalProps {
  task: TaskView;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}

export const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({
  task,
  open,
  onOpenChange,
  onSubmit
}) => {
  const { toast } = useToast();
  const [summary, setSummary] = useState('');
  const [links, setLinks] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  const handleAddLink = () => {
    setLinks([...links, '']);
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!summary.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a summary of your work',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Filter out empty links
      const validLinks = links.filter(link => link.trim() !== '');
      
      await taskApi.submitTask(task.id, summary.trim(), validLinks);
      
      toast({
        title: 'Success',
        description: 'Task submitted successfully for review!',
      });

      // Reset form
      setSummary('');
      setLinks(['']);
      onSubmit();
      onOpenChange(false);
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit task',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Submit Task: {task.title}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Info */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{task.title}</h3>
              <Badge variant="outline">{task.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Work Summary *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe what you have completed, methods used, results achieved, etc."
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Provide a detailed summary of your completed work
            </p>
          </div>

          {/* Links */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Supporting Links (Optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLink}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Link
              </Button>
            </div>
            
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <LinkIcon className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder="https://example.com/your-work"
                    type="url"
                  />
                  {links.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveLink(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Add links to documents, repositories, presentations, or other relevant materials
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Task
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
