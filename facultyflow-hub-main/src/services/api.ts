import { LoginRequest, LoginResponse, User } from '@/types/auth';
import { TaskView, TaskUpdateStatusDto, TaskCreateDto, SubmissionView } from '@/types/task';
import { PortfolioView, PortfolioCreateDto } from '@/types/portfolio';
import { AnalyticsFilters, PerformanceSummary, TaskTrend } from '@/types/analytics';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const getAuthToken = () => localStorage.getItem('token');

const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(errorData.error || errorData.message || 'An error occurred', response.status);
    }

    // Handle 204 No Content responses (common for DELETE)
    if (response.status === 204) {
      return undefined as unknown as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        localStorage.removeItem('token');
      }
      throw error;
    }
    throw new ApiError('Network error', 0);
  }
};

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string }> => {
    return apiRequest<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },
};

export const taskApi = {
  getTasks: async (status?: string): Promise<TaskView[]> => {
    const query = status ? `?status=${status}` : '';
    return apiRequest<TaskView[]>(`/tasks${query}`);
  },

  getTask: async (id: number): Promise<TaskView> => {
    return apiRequest<TaskView>(`/tasks/${id}`);
  },

  updateTaskStatus: async (id: number, status: string): Promise<any> => {
    return apiRequest<any>(`/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  startTask: async (id: number): Promise<TaskView> => {
    return apiRequest<TaskView>(`/tasks/${id}/start`, {
      method: 'PATCH',
    });
  },

  submitTask: async (id: number, summary: string, links: string[]): Promise<TaskView> => {
    return apiRequest<TaskView>(`/tasks/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ summary, links }),
    });
  },

  reviewTask: async (id: number, decision: 'APPROVED' | 'REJECTED', note?: string): Promise<SubmissionView> => {
    return apiRequest<SubmissionView>(`/tasks/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, note }),
    });
  },

  getSubmissionHistory: async (id: number): Promise<SubmissionView[]> => {
    return apiRequest<SubmissionView[]>(`/tasks/${id}/submissions`);
  },

  createTask: async (taskData: TaskCreateDto): Promise<TaskView> => {
    return apiRequest<TaskView>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  getTasksByUser: async (userId: number, status?: string): Promise<TaskView[]> => {
    const query = status ? `?status=${status}` : '';
    return apiRequest<TaskView[]>(`/tasks/by-user/${userId}${query}`);
  },
};

export const portfolioApi = {
  getMyPortfolio: async (): Promise<PortfolioView> => {
    return apiRequest<PortfolioView>('/portfolio/me');
  },

  createOrUpdateMyPortfolio: async (data: PortfolioCreateDto): Promise<PortfolioView> => {
    return apiRequest<PortfolioView>('/portfolio/me', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteMyPortfolio: async (): Promise<void> => {
    return apiRequest<void>('/portfolio/me', {
      method: 'DELETE',
    });
  },

  getPortfolioByUserId: async (userId: number): Promise<PortfolioView> => {
    return apiRequest<PortfolioView>(`/portfolio/user/${userId}`);
  },

  getAllPortfolios: async (): Promise<PortfolioView[]> => {
    return apiRequest<PortfolioView[]>('/portfolio/all');
  },

  updateUserPortfolio: async (userId: number, data: PortfolioCreateDto): Promise<PortfolioView> => {
    return apiRequest<PortfolioView>(`/portfolio/user/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteUserPortfolio: async (userId: number): Promise<void> => {
    return apiRequest<void>(`/portfolio/user/${userId}`, {
      method: 'DELETE',
    });
  },
};

// ✅ FIXED: Analytics API with only the endpoints that exist in your backend
export const analyticsApi = {
  // Get faculty performance analytics
  getFacultyPerformance: async (filters?: AnalyticsFilters): Promise<PerformanceSummary> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.department) params.append('department', filters.department);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<PerformanceSummary>(`/analytics/faculty-performance${query}`);
  },

  // Get task completion trends
  getTaskTrends: async (filters?: AnalyticsFilters): Promise<TaskTrend[]> => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<TaskTrend[]>(`/analytics/task-trends${query}`);
  },

  // ✅ REMOVED: getDepartmentStats - doesn't exist in your backend
};

export { ApiError };
