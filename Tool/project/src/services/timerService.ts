import api from "../lib/api";

export interface Timer {
  _id: string;
  user: string;
  project: string;
  task: string;
  startTime: string | null;
  endTime: string | null;
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
    return api
      .patch("/timers/start", {
        userId: toObjectId(userId),
        projectId: toObjectId(projectId),
        taskId: toObjectId(taskId),
      })
      .then((res) => res.data);
  }
  static async stopTimer(userId: string, projectId: string, taskId: string) {
    return api
      .patch("/timers/stop", {
        userId: toObjectId(userId),
        projectId: toObjectId(projectId),
        taskId: toObjectId(taskId),
      })
      .then((res) => res.data);
  }
  static async getTimersForUser(userId: string) {
    const res = await api.get(`/timers/user/${userId}`);
    return res.data;
  }
  static async getTimersForProject(projectId: string) {
    const res = await api.get(`/timers/project/${projectId}`);
    return res.data;
  }
  static async logManualTime({
    user,
    project,
    task,
    startTime,
    endTime,
  }: {
    user: string;
    project: string;
    task: string;
    startTime: string;
    endTime: string;
  }) {
    // All IDs should be valid ObjectId strings, and times should be ISO strings
    return api
      .post("/timers/log", {
        user: toObjectId(user),
        project: toObjectId(project),
        task: toObjectId(task),
        startTime,
        endTime,
      })
      .then((res) => res.data);
  }
  static async deleteTimeEntry(id: string) {
    return api.delete(`/timers/${id}`).then((res) => res.data);
  }
}
