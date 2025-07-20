import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { ProjectService } from "../services/projectService";
import { TaskService } from "../services/taskService";
import { TimerService } from "../services/timerService";
import { UserService } from "../services/userService";
import { ApiProject, ApiTask } from "../types";

// Type definitions
export type Profile = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "project_manager" | "team_member" | "client";
  avatar?: string;
  weekly_capacity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Client = {
  id: string;
  name: string;
  email: string;
  company: string;
  type?: "One Time" | "Retainer";
  hourly_rate: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  client_id?: string;
  owner_id: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "Not Started" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
  deadline?: string;
  monthly_hour_allocation: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  client?: Client;
  owner?: Profile;
  team_members?: Profile[];
};

type Task = {
  id: string;
  title: string;
  description: string;
  project_id: string;
  assignee_id: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "backlog" | "todo" | "in-progress" | "review" | "done";
  estimated_hours: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  assignee?: Profile;
  project?: Project;
  subtasks: never[];
};

type TimeEntry = {
  id: string;
  task_id: string;
  project_id: string;
  user_id: string;
  date: string;
  duration: number;
  description: string;
  created_at: string;
};

type Invoice = {
  id: string;
  client_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  hourly_rate: number;
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid";
  created_at: string;
  updated_at: string;
  client?: Client;
  projects?: Project[];
};

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  created_at: string;
};

interface AppState {
  profiles: Profile[];
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  invoices: Invoice[];
  notifications: Notification[];
  isLoading: boolean;
}

type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_PROFILES"; payload: Profile[] }
  | { type: "SET_CLIENTS"; payload: Client[] }
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "SET_TIME_ENTRIES"; payload: TimeEntry[] }
  | { type: "SET_INVOICES"; payload: Invoice[] }
  | { type: "SET_NOTIFICATIONS"; payload: Notification[] }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: Project }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: Task }
  | { type: "ADD_TIME_ENTRY"; payload: TimeEntry }
  | { type: "ADD_CLIENT"; payload: Client }
  | { type: "UPDATE_CLIENT"; payload: Client }
  | { type: "DELETE_CLIENT"; payload: string }
  | { type: "ADD_INVOICE"; payload: Invoice }
  | { type: "MARK_NOTIFICATION_READ"; payload: string };

const initialState: AppState = {
  profiles: [],
  clients: [],
  projects: [],
  tasks: [],
  timeEntries: [],
  invoices: [],
  notifications: [],
  isLoading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_PROFILES":
      return { ...state, profiles: action.payload };
    case "SET_CLIENTS":
      return { ...state, clients: action.payload };
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };
    case "SET_TASKS":
      return { ...state, tasks: action.payload };
    case "SET_TIME_ENTRIES":
      return { ...state, timeEntries: action.payload };
    case "SET_INVOICES":
      return { ...state, invoices: action.payload };
    case "SET_NOTIFICATIONS":
      return { ...state, notifications: action.payload };
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload] };
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "ADD_TIME_ENTRY":
      return { ...state, timeEntries: [...state.timeEntries, action.payload] };
    case "ADD_CLIENT":
      return { ...state, clients: [...state.clients, action.payload] };
    case "UPDATE_CLIENT":
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "DELETE_CLIENT":
      return {
        ...state,
        clients: state.clients.filter((c) => c.id !== action.payload),
      };
    case "ADD_INVOICE":
      return { ...state, invoices: [...state.invoices, action.payload] };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    default:
      return state;
  }
}

// Mock current user
const mockCurrentUser: Profile = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@techit.com",
  role: "admin",
  avatar:
    "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
  weekly_capacity: 40,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  currentUser: Profile | null;
  reloadTasksAndMeta: () => Promise<void>;
  reloadTimeEntries: () => Promise<void>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();
  const [currentUserProfile, setCurrentUserProfile] =
    React.useState<Profile | null>(null);

  // New: reloadTasksAndMeta function
  const reloadTasksAndMeta = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Fetch users (profiles)
      const usersRes = await UserService.getAllUsers();
      const apiUsers = usersRes.data?.data || [];
      const mappedProfiles: Profile[] = apiUsers.map((u) => ({
        id: u._id || "",
        name: u.name,
        email: u.email,
        role:
          u.role === "manager"
            ? "project_manager"
            : u.role === "team member"
            ? "team_member"
            : "admin",
        avatar: u.photo || "",
        weekly_capacity: 40,
        is_active: u.active ?? true,
        created_at: u.createdAt || "",
        updated_at: u.updatedAt || "",
      }));
      dispatch({ type: "SET_PROFILES", payload: mappedProfiles });
      // Fetch clients from backend
      const clientsRes = await import("../services/clientService").then((m) =>
        m.ClientService.getAllClients()
      );
      console.log(clientsRes);
      // Extract raw clients array from response
      const rawClients = Array.isArray(clientsRes)
        ? clientsRes
        : (clientsRes.data as any)?.data ||
          (clientsRes.data as any)?.clients ||
          [];
      // Map API client objects to internal Client shape
      const mappedClients = (rawClients as any[]).map((c) => ({
        id: c._id || c.id || "",
        name: c.name,
        email: c.email || "",
        company: c.company || "",
        type: (c as any).type || "One Time",
        hourly_rate: (c as any).hourly_rate || 0,
        is_active: c.active ?? true,
        created_at: c.createdAt || "",
        updated_at: c.updatedAt || "",
      }));
      dispatch({ type: "SET_CLIENTS", payload: mappedClients });
      // Fetch projects for the current user from backend
      let projects: Project[] = [];
      if (user && user._id) {
        const apiProjects = await ProjectService.getAllProjects();
        // Map API project shape to context Project shape
        projects = apiProjects.map((p: any) => ({
          id: p._id || p.id || "",
          name: p.name,
          description: p.description || "",
          client_id:
            typeof p.client === "string" ? p.client : p.client?._id || "",
          owner_id: p.createdBy || p.owner || "",
          priority: p.priority,
          status: p.status,
          deadline: p.deadline || "",
          monthly_hour_allocation: p.monthlyHours || 0,
          tags: p.tags || [],
          created_at: p.createdAt || "",
          updated_at: p.updatedAt || "",
        }));
      }
      dispatch({ type: "SET_PROJECTS", payload: projects });
      // Fetch all tasks from backend so TaskModal can show tasks for any assignee
      try {
        const tasksRes = await TaskService.getAllTasks();
        console.log("Fetched tasks:", tasksRes);
        // ApiResponse.data contains { tasks: ApiTask[] }
        const apiTasks = tasksRes.data.tasks || [];
        const tasks = apiTasks.map((t) => ({
          id: t._id || "",
          title: t.title,
          description: t.description || "",
          project_id:
            typeof t.project === "string"
              ? t.project
              : (t.project as any)?._id || "",
          assignee_id:
            typeof t.assignedTo === "string"
              ? t.assignedTo
              : (t.assignedTo as any)?._id || "",
          priority: t.priority,
          status: t.status,
          estimated_hours: t.estimatedHours || 0,
          due_date: t.dueDate || "",
          created_at: t.createdAt || "",
          updated_at: t.updatedAt || "",
          assignee: undefined,
          project: undefined,
          subtasks: [],
        }));
        dispatch({ type: "SET_TASKS", payload: tasks });
      } catch {
        dispatch({ type: "SET_TASKS", payload: [] });
      }
      // Optionally fetch invoices and notifications from backend if needed
      // dispatch({ type: "SET_INVOICES", payload: [] });
      // dispatch({ type: "SET_NOTIFICATIONS", payload: [] });
    } catch {
      dispatch({ type: "SET_TASKS", payload: [] });
      dispatch({ type: "SET_PROJECTS", payload: [] });
      dispatch({ type: "SET_PROFILES", payload: [] });
      dispatch({ type: "SET_CLIENTS", payload: [] });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // New: reloadTimeEntries function
  const reloadTimeEntries = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      if (user && user._id) {
        const res = await TimerService.getTimersForUser(user._id);
        // Robustly extract timers array
        let timers = [];
        if (Array.isArray(res)) {
          timers = res;
        } else if (Array.isArray(res.data?.timers)) {
          timers = res.data.timers;
        } else if (Array.isArray(res.timers)) {
          timers = res.timers;
        } else if (Array.isArray(res.data)) {
          timers = res.data;
        }
        // Map timers to TimeEntry[] shape if needed
        const timeEntries = timers.map((t: any) => ({
          id: t._id || t.id || "",
          task_id: t.task,
          project_id: t.project,
          user_id: t.user,
          date: t.startTime ? t.startTime.split("T")[0] : "",
          duration:
            t.duration ||
            (t.endTime && t.startTime
              ? Math.round(
                  (new Date(t.endTime).getTime() -
                    new Date(t.startTime).getTime()) /
                    60000
                )
              : 0),
          description: t.description || "",
          created_at: t.createdAt || t.startTime || "",
        }));
        dispatch({ type: "SET_TIME_ENTRIES", payload: timeEntries });
      } else {
        dispatch({ type: "SET_TIME_ENTRIES", payload: [] });
      }
    } catch (error) {
      dispatch({ type: "SET_TIME_ENTRIES", payload: [] });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    // Only fetch meta (profiles, clients, projects, tasks) when user changes
    reloadTasksAndMeta();
    // Always fetch time entries when user changes
    reloadTimeEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch current user's full profile
  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await UserService.getMe();
        const u = res.data?.data;
        if (u) {
          setCurrentUserProfile({
            id: u._id || "",
            name: u.name,
            email: u.email,
            role:
              u.role === "manager"
                ? "project_manager"
                : u.role === "team member"
                ? "team_member"
                : "admin",
            avatar: u.photo || "",
            weekly_capacity: 40,
            is_active: u.active ?? true,
            created_at: u.createdAt || "",
            updated_at: u.updatedAt || "",
          });
        }
      } catch (err) {
        console.error("Failed to load current user", err);
      }
    }
    loadCurrentUser();
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        currentUser: currentUserProfile,
        reloadTasksAndMeta,
        reloadTimeEntries,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
