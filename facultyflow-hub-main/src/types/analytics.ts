export interface FacultyPerformanceDto {
  facultyId: number;
  facultyName: string;
  facultyEmail: string;
  department: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksOverdue: number;
  averageCompletionTime: number;
  performanceScore: number;
  lastActiveDate: string;
}

export interface PerformanceSummary {
  totalFaculty: number;
  totalTasksAssigned: number;
  totalTasksCompleted: number;
  averagePerformanceScore: number;
  facultyPerformances: FacultyPerformanceDto[];
}

export interface TaskTrend {
  month: string;
  assigned: number;
  completed: number;
  overdue: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  department?: string;
}
