// src/types/auth.ts

import { ReactNode } from "react";

// Request payload for login
export interface LoginRequest {
  email: string;
  password: string;
}

// Response payload from /api/auth/login
export interface LoginResponse {
  token: string;
}

// Response payload from /api/auth/me
export interface User {
  department: ReactNode;
  id: number;
  name: string;
  email: string;
  role: string;
}

// Context value shape for AuthContext
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}
