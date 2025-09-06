import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDetailsModal } from '@/components/tasks/TaskDetailsModal';
import { useAuth } from '@/contexts/AuthContext';
import { taskApi } from '@/services/api';
import { TaskView } from '@/types/task';
import { Search, Filter, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STATUS_ALL = 'all';

export const TaskList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<TaskView[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_ALL);

  const [selectedTask, setSelectedTask] = useState<TaskView | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isCompletedOpen, setIsCompletedOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await taskApi.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to fetch tasks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const base = tasks.filter((t) => {
      if (statusFilter !== STATUS_ALL && t.status !== statusFilter) return false;
      if (!term) return true;
      const hay = `${t.title} ${t.description}`.toLowerCase();
      return hay.includes(term);
    });

    // 🔑 sort by updatedAt DESC
    return base.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [tasks, searchTerm, statusFilter]);

  const activeTasks = useMemo(
    () =>
      statusFilter === STATUS_ALL
        ? filteredTasks.filter((t) => t.status !== 'COMPLETED')
        : filteredTasks,
    [filteredTasks, statusFilter]
  );

  const completedTasks = useMemo(
    () =>
      statusFilter === STATUS_ALL
        ? filteredTasks.filter((t) => t.status === 'COMPLETED')
        : [],
    [filteredTasks, statusFilter]
  );

  const handleTaskAction = async (taskId: number, action: string) => {
    try {
      if (action === 'start') {
        await taskApi.startTask(taskId);
        toast({ title: 'Success', description: 'Task started' });
        fetchTasks();
        return;
      }

      if (action === 'refresh') {
        fetchTasks();
        return;
      }

      if (action === 'view') {
        const task = tasks.find((t) => t.id === taskId) || null;
        setSelectedTask(task);
        setIsModalOpen(!!task);
        return;
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Action failed',
        variant: 'destructive'
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const getPageTitle = () =>
    user?.role === 'FACULTY' ? 'My Tasks' : 'All Tasks';

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading tasks…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
            <p className="text-muted-foreground">Browse and manage tasks</p>
          </div>
          <Button onClick={fetchTasks}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={statusFilter}
                  onValueChange={(val) => setStatusFilter(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={STATUS_ALL}>All statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter(STATUS_ALL);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {activeTasks.length === 0 && completedTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No tasks match your filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeTasks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onAction={handleTaskAction}
                  />
                ))}
              </div>
            )}

            {statusFilter === STATUS_ALL && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsCompletedOpen((v) => !v)}
                  className="w-full flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {isCompletedOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">Completed</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {completedTasks.length}
                  </span>
                </button>

                {isCompletedOpen && (
                  completedTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onAction={handleTaskAction}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No completed tasks yet.
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      <TaskDetailsModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
