// API Types based on swagger documentation
export interface ApiUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  passwordConfirm?: string;
  role: "team member" | "admin" | "manager";
  authProvider?: "local" | "google";
  googleId?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProject {
  _id?: string;
  name: string;
  description?: string;
  createdBy: string;
  tasks?: string[];
  createdAt?: string;
  updatedAt?: string;
  deadline?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "Not Started" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  client: string; // client _id
  owner: string; // owner _id
  monthlyHours: number;
  tags: string[];
}

export interface ApiTask {
  _id?: string;
  title: string;
  description?: string;
  status: "backlog" | "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  assignedTo: string;
  project: string;
  createdAt?: string;
  updatedAt?: string;
  estimatedHours?: number;
}

export interface ApiClient {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type?: "One Time" | "Retainer";
  createdAt?: string;
  updatedAt?: string;
}

// Auth API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface UpdatePasswordRequest {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  passwordConfirm: string;
}

// API Response Types
export interface ApiResponse<T> {
  status: string;
  data?: T;
  token?: string;
  results?: number;
  message?: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: ApiUser;
  };
}

export interface ErrorResponse {
  status: string;
  message: string;
  error?: unknown;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "project_manager" | "team_member" | "client";
  avatar?: string;
  weeklyCapacity: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  /** One Time or Retainer client type */
  type?: "One Time" | "Retainer";
  hourlyRate: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientId?: string;
  ownerId: string;
  teamMemberIds: string[];
  priority: "low" | "medium" | "high" | "critical";
  status: "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled";
  deadline?: Date;
  monthlyHourAllocation: number;
  tags: string[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "backlog" | "todo" | "in_progress" | "review" | "done";
  estimatedHours: number;
  dueDate?: Date;
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  date: Date;
  duration: number; // in minutes
  description: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectIds: string[];
  period: {
    start: Date;
    end: Date;
  };
  totalHours: number;
  hourlyRate: number;
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid";
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  createdAt: Date;
}
