import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowLeft, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { taskApi, authApi } from '@/services/api';
import { TaskCreateDto, MiniUser } from '@/types/task';
import { cn } from '@/lib/utils';
import { Link as LinkIcon, Plus, Trash2 } from 'lucide-react';

export const CreateTask: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [links, setLinks] = useState<string[]>(['']);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>();
  const [assignedToUserId, setAssignedToUserId] = useState<string>('');
  const [priority, setPriority] = useState<string>('5');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [facultyMembers, setFacultyMembers] = useState<MiniUser[]>([]);

  // Fetch faculty members on component mount
  useEffect(() => {
    const fetchFacultyMembers = async () => {
      try {
        // You'll need to add this API endpoint
        const response = await fetch('http://localhost:8080/api/users/faculty', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const faculty = await response.json();
          setFacultyMembers(faculty);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch faculty members',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching faculty:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch faculty members',
          variant: 'destructive'
        });
      } finally {
        setFacultyLoading(false);
      }
    };

    fetchFacultyMembers();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task title is required',
        variant: 'destructive'
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Task description is required',
        variant: 'destructive'
      });
      return;
    }

    if (!dueDate) {
      toast({
        title: 'Validation Error',
        description: 'Due date is required',
        variant: 'destructive'
      });
      return;
    }

    if (!assignedToUserId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a faculty member to assign this task to',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const taskData: TaskCreateDto = {
        title: title.trim(),
        description: description.trim(),
        dueAt: dueDate.toISOString(),
        assignedToUserId: parseInt(assignedToUserId),
        priority: parseInt(priority),
        links: links.filter((l) => l.trim() !== '')
      };

      await taskApi.createTask(taskData);
      
      toast({
        title: 'Success',
        description: 'Task created successfully!',
        variant: 'default'
      });

      // Navigate back to tasks list
      navigate('/tasks');
      
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create task',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = (value: string) => {
    const num = parseInt(value);
    if (num >= 8) return 'High Priority';
    if (num >= 5) return 'Medium Priority';
    return 'Low Priority';
  };

  const getPriorityColor = (value: string) => {
    const num = parseInt(value);
    if (num >= 8) return 'text-destructive';
    if (num >= 5) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/tasks')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Task</h1>
          <p className="text-muted-foreground">
            Assign a new task to a faculty member
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Task Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed task description..."
                rows={4}
                required
              />
            </div>

            {/* Links */}
            <div className="space-y-2">
              <Label>Reference Links</Label>
              {links.map((link, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    type="url"
                    placeholder="Enter link..."
                    value={link}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index] = e.target.value;
                      setLinks(newLinks);
                    }}
                  />
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setLinks(links.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => setLinks([...links, ''])}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Link
              </Button>
            </div>
            
            {/* Due Date */}
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select due date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Assign To Faculty */}
            <div className="space-y-2">
              <Label>Assign To Faculty *</Label>
              {facultyLoading ? (
                <div className="text-sm text-muted-foreground">Loading faculty members...</div>
              ) : (
                <Select value={assignedToUserId} onValueChange={setAssignedToUserId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a faculty member" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyMembers.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{faculty.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {faculty.email} • {faculty.department}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority Level</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">
                    <span className={getPriorityColor("2")}>Low Priority (1-4)</span>
                  </SelectItem>
                  <SelectItem value="5">
                    <span className={getPriorityColor("5")}>Medium Priority (5-7)</span>
                  </SelectItem>
                  <SelectItem value="8">
                    <span className={getPriorityColor("8")}>High Priority (8-10)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Current: <span className={getPriorityColor(priority)}>{getPriorityLabel(priority)}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tasks')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || facultyLoading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                    Creating Task...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
