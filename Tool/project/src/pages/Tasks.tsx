import React, { useState, useEffect } from "react";
import { useApp } from "../contexts/AppContext";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  LayoutGrid,
  List,
  Clock,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { TaskModal } from "../components/tasks/TaskModal";
import { format } from "date-fns";
import { UserService } from "../services/userService";
import { TaskService } from "../services/taskService";
import { ProjectService } from "../services/projectService";
import { useAuth } from "../hooks/useAuth";

// Types
import { ApiTask, ApiUser, ApiProject } from "../types";

export function Tasks() {
  const { state, dispatch } = useApp(); // removed unused dispatch
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "medium" as const,
    status: "backlog" as const,
    estimatedHours: 1,
    dueDate: "",
  });
  // Adapt context tasks to ApiTask shape so downstream UI logic can remain unchanged
  const allTasks = state.tasks.map((t) => ({
    _id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.due_date,
    assignedTo: { _id: t.assignee_id },
    project: { _id: t.project_id },
    estimatedHours: t.estimated_hours,
  })) as unknown as ApiTask[];
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [projects, setProjects] = useState<ApiProject[]>([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        if (!user || !user._id) return;
        const [usersRes, apiProjects] = await Promise.all([
          UserService.getAllUsers(),
          ProjectService.getAllProjects(),
        ]);
        // Populate users and projects for dropdowns
        setUsers(usersRes.data?.data || []);
        console.log("apiProjects:", apiProjects);
        setProjects(apiProjects.filter(Boolean));
        console.log("Fetched projects:");
      } catch (error) {
        console.error("Failed to fetch users or projects:", error);
      }
    };
    fetchMeta();
  }, [user]);

  // Type guard for valid tasks
  function isValidTask(task: unknown): task is ApiTask {
    return (
      typeof task === "object" &&
      task !== null &&
      "title" in task &&
      typeof (task as any).title === "string" &&
      "_id" in task &&
      typeof (task as any)._id === "string"
    );
  }
  function isValidProject(project: unknown): project is ApiProject {
    return (
      typeof project === "object" &&
      project !== null &&
      "name" in project &&
      typeof (project as any).name === "string" &&
      "_id" in project &&
      typeof (project as any)._id === "string"
    );
  }

  // Determine base tasks: if no filters/search, limit to current user; otherwise all tasks
  const baseTasks =
    searchTerm === "" &&
    statusFilter === "all" &&
    assigneeFilter === "all" &&
    projectFilter === "all"
      ? allTasks.filter((t) => t.assignedTo._id === user?._id)
      : allTasks;
  const filteredTasks = baseTasks.filter(isValidTask).filter((task) => {
    console.log("Filtering task:", task);
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false);
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesAssignee =
      assigneeFilter === "all" || task.assignedTo._id === assigneeFilter;
    const matchesProject =
      projectFilter === "all" ||
      (typeof task.project === "object"
        ? isValidProject(task.project) && task.project._id === projectFilter
        : task.project === projectFilter);
    return matchesSearch && matchesStatus && matchesAssignee && matchesProject;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newTask.title,
        description: newTask.description,
        project: newTask.project,
        assignedTo: newTask.assignedTo,
        priority: newTask.priority,
        status: newTask.status,
        estimatedHours: newTask.estimatedHours,
        dueDate: newTask.dueDate,
      };
      const res = await TaskService.createTask(payload);
      // console.log("Created task:", res);
      // On success, dispatch to global context for optimistic UI
      const created = res.data?.data;
      if (created) {
        dispatch({
          type: "ADD_TASK",
          payload: {
            id: created._id || "",
            title: created.title,
            description: created.description || "",
            project_id: created.project,
            assignee_id: created.assignedTo,
            priority: created.priority,
            status: created.status,
            estimated_hours: created.estimatedHours || 0,
            due_date: created.dueDate || "",
            created_at: created.createdAt || "",
            updated_at: created.updatedAt || "",
            assignee: undefined,
            project: undefined,
            subtasks: [],
          },
        });
      }
      setShowCreateModal(false);
      setNewTask({
        title: "",
        description: "",
        project: "",
        assignedTo: "",
        priority: "medium",
        status: "backlog",
        estimatedHours: 1,
        dueDate: "",
      });
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: ApiTask["status"]
  ) => {
    // Optimistically dispatch status update to context
    const existing = state.tasks.find((t) => t.id === taskId);
    if (existing) {
      dispatch({
        type: "UPDATE_TASK",
        payload: { ...existing, status: newStatus },
      });
    }
    try {
      await TaskService.updateTask(taskId, { status: newStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
      // Could dispatch rollback here
    }
  };

  const handleTaskClick = (taskId: string, event: React.MouseEvent) => {
    // Prevent team members from opening task details
    if (user?.role === "team member") return;
    // Prevent opening modal if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (
      target.closest("select") ||
      target.closest("button") ||
      target.closest("a")
    ) {
      return;
    }
    setSelectedTaskId(taskId);
    setShowTaskModal(true);
  };

  const statusColumns = [
    { id: "backlog", title: "Backlog", color: "bg-gray-100" },
    { id: "todo", title: "To Do", color: "bg-blue-100" },
    { id: "in-progress", title: "In Progress", color: "bg-yellow-100" },
    { id: "review", title: "Review", color: "bg-purple-100" },
    { id: "done", title: "Done", color: "bg-green-100" },
  ];

  // Update TaskCard and table to use correct properties
  const TaskCard = ({ task }: { task: ApiTask }) => {
    const assignee = users.find((u) => u._id === task.assignedTo._id);
    const project =
      typeof task.project === "object"
        ? task.project
        : projects.find((p) => p._id === task.project);
    const timeEntries = state.timeEntries.filter(
      (te) => te.task_id === task._id
    );
    const totalTimeSpent =
      timeEntries.reduce((sum, te) => sum + te.duration, 0) / 60;
    const isOverdue =
      task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== "done";
    return (
      <div
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-3 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
        onClick={(e) => handleTaskClick(task._id!, e)}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-900 text-sm leading-tight group-hover:text-blue-600 transition-colors">
              {task.title}
            </h4>
            <Badge
              variant={
                task.priority === "critical"
                  ? "danger"
                  : task.priority === "high"
                  ? "warning"
                  : task.priority === "medium"
                  ? "info"
                  : "secondary"
              }
              size="sm"
            >
              {task.priority}
            </Badge>
          </div>

          <p className="text-xs text-gray-600 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{project?.name}</span>
            {task.dueDate && (
              <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
          </div>

          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="w-3 h-3 text-gray-600" />
              </div>
              <span className="ml-2 text-xs text-gray-600">
                {assignee?.name}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <div className="flex items-center space-x-3">
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === "kanban"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 text-sm font-medium rounded-r-lg transition-colors ${
                viewMode === "table"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            {user?.role !== "team member" && (
              <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
                New Task
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Select Member</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {statusColumns.map((column) => {
            const columnTasks = filteredTasks.filter(
              (task) => task.status === column.id
            );
            return (
              <div key={column.id} className="flex flex-col">
                <div
                  className={`${column.color} rounded-lg p-3 mb-4 border border-gray-200`}
                >
                  <h3 className="font-medium text-gray-900 text-sm">
                    {column.title} ({columnTasks.length})
                  </h3>
                </div>

                <div className="flex-1 space-y-3 min-h-[400px]">
                  {columnTasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-500">No tasks</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => {
                  const assignee = users.find((u) => u._id === task.assignedTo);
                  const project =
                    typeof task.project === "object"
                      ? task.project
                      : projects.find((p) => p._id === task.project._id);
                  const timeEntries = state.timeEntries.filter(
                    (te) => te.task_id === task._id
                  );
                  const totalTimeSpent =
                    timeEntries.reduce((sum, te) => sum + te.duration, 0) / 60;
                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    task.status !== "done";
                  return (
                    <tr
                      key={task._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => handleTaskClick(task._id, e)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {task.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {assignee?.avatar ? (
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                          <span className="text-sm text-gray-900">
                            {assignee?.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task._id, e.target.value);
                          }}
                          className="text-sm rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">To Do</option>
                          <option value="in-progress">In Progress</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            task.priority === "critical"
                              ? "danger"
                              : task.priority === "high"
                              ? "warning"
                              : task.priority === "medium"
                              ? "info"
                              : "secondary"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.dueDate ? (
                          <span
                            className={
                              isOverdue ? "text-red-600 font-medium" : ""
                            }
                          >
                            {format(new Date(task.dueDate), "MMM d, yyyy")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round(totalTimeSpent)}h / {task.estimatedHours}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal - Matching TaskModal Layout Exactly */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        size="xl"
      >
        <form onSubmit={handleCreateTask} className="space-y-6">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                required
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full text-lg font-semibold px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe the task in detail..."
              />
            </div>

            {/* Two Column Layout - Matching TaskModal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Status & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newTask.status}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          status: e.target.value as ApiTask["status"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          priority: e.target.value as ApiTask["priority"],
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Project & Assignee */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project
                    </label>
                    <select
                      required
                      value={newTask.project}
                      onChange={(e) =>
                        setNewTask({ ...newTask, project: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <select
                      required
                      value={newTask.assignedTo}
                      onChange={(e) =>
                        setNewTask({ ...newTask, assignedTo: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Assigned To</option>
                      {users
                        .filter((u) => u.role !== "client")
                        .map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Estimated Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={newTask.estimatedHours}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        estimatedHours: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Matching TaskModal */}
          <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50 space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !newTask.title.trim() || !newTask.project || !newTask.assignedTo
              }
            >
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTaskId(null);
        }}
        taskId={selectedTaskId}
        onDelete={(deletedId: string) => {
          // Optimistically remove the deleted task from context state
          const remaining = state.tasks.filter((t) => t.id !== deletedId);
          dispatch({ type: "SET_TASKS", payload: remaining });
        }}
      />
    </div>
  );
}

// Add a new method to TaskService:
// getTasksForUser(userId: string): Promise<any> {
//   return axios.get(`/api/v1/users/${userId}/tasks`);
// }
