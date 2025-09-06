export interface TaskView {
  id: number;
  title: string;
  description: string;
  dueAt: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'OVERDUE' | 'COMPLETED';
  priority: number;
  locked: boolean;
  assignedTo: MiniUser;
  assignedBy: MiniUser;
  createdAt: string;
  updatedAt: string;
  links?: string[];
}

export interface MiniUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

export interface TaskUpdateStatusDto {
  status: string;
}

export interface TaskCreateDto {
  title: string;
  description: string;
  dueAt: string; // ISO date string
  assignedToUserId: number;
  priority?: number;
  links?: string[];
}

export interface SubmissionView {
  id: number;
  taskId: number;
  submittedBy: MiniUser;
  summary: string;
  links: string[];
  submittedAt: string;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
  decisionNote?: string;
  decidedAt?: string;
  decidedBy?: MiniUser;
}
