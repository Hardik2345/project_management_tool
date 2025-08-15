import { apiWithRetry } from "../lib/api";

export interface Timer {
  _id: string;
  user: string;
  project: string;
  task: string;
  startTime: string | null;
  endTime: string | null;
  duration: number; // in minutes
  isPaused: boolean;
  pausedAt: string | null;
  totalPausedTime: number; // in milliseconds
  description?: string;
  createdAt: string;
  updatedAt: string;
}

function toObjectId(id: string): string {
  // If already a 24-char hex string, return as is; else throw error or convert
  if (/^[a-fA-F0-9]{24}$/.test(id)) return id;
  throw new Error("Invalid ObjectId: " + id);
}

export class TimerService {
  static async startTimer(userId: string, projectId: string, taskId: string) {
    // Ensure all IDs are valid ObjectId strings
    return apiWithRetry
      .patch("/timers/start", {
        userId: toObjectId(userId),
        projectId: toObjectId(projectId),
        taskId: toObjectId(taskId),
      })
      .then((res) => res.data);
  }
  
  static async stopTimer(
    userId: string,
    projectId: string,
    taskId: string,
    description?: string
  ) {
    // Allow optional description when stopping a timer
    return apiWithRetry
      .patch("/timers/stop", {
        userId: toObjectId(userId),
        projectId: toObjectId(projectId),
        taskId: toObjectId(taskId),
        description,
      })
      .then((res) => res.data);
  }
  
  static async pauseTimer(userId: string, projectId: string, taskId: string) {
    return apiWithRetry
      .patch("/timers/pause", {
        userId: toObjectId(userId),
        projectId: toObjectId(projectId),
        taskId: toObjectId(taskId),
      })
      .then((res) => res.data);
  }
  
  static async resumeTimer(userId: string, projectId: string, taskId: string) {
    return apiWithRetry
      .patch("/timers/resume", {
        userId: toObjectId(userId),
        projectId: toObjectId(projectId),
        taskId: toObjectId(taskId),
      })
      .then((res) => res.data);
  }
  
  static async getTimersForUser(userId: string) {
    const res = await apiWithRetry.get(`/timers/user/${userId}`);
    return res.data;
  }
  static async getTimersForProject(projectId: string) {
    const res = await apiWithRetry.get(`/timers/project/${projectId}`);
    return res.data;
  }
  static async logManualTime({
    user,
    project,
    task,
    startTime,
    endTime,
    description,
  }: {
    user: string;
    project: string;
    task: string;
    startTime: string;
    endTime: string;
    description?: string;
  }) {
    // All IDs should be valid ObjectId strings, times should be ISO strings, and optional description
    return apiWithRetry
      .post("/timers/log", {
        user: toObjectId(user),
        project: toObjectId(project),
        task: toObjectId(task),
        startTime,
        endTime,
        description,
      })
      .then((res) => res.data);
  }
  static async updateTimeEntry(id: string, data: { duration?: number; date?: string; description?: string }) {
    // PATCH /timers/:id with updated fields
    return apiWithRetry.patch(`/timers/${id}`, data).then((res) => res.data);
  }
  static async deleteTimeEntry(id: string) {
    return apiWithRetry.delete(`/timers/${id}`).then((res) => res.data);
  }
}
