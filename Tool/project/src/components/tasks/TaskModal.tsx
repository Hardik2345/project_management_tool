import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../contexts/AppContext";
import TaskService from "../../services/taskService";
import { ApiTask } from "../../types";
import { X, Trash2, Save, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
// removed Badge import as tags section is removed
import { format } from "date-fns";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string | null;
  onDelete?: (id: string) => void;
}

export function TaskModal({
  isOpen,
  onClose,
  taskId,
  onDelete,
}: TaskModalProps) {
  const { state, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // removed newTag state
  const modalRef = useRef<HTMLDivElement>(null);

  const task = taskId ? state.tasks.find((t) => t.id === taskId) : null;
  const project = task
    ? state.projects.find((p) => p.id === task.project_id)
    : null;

  type FormData = {
    title: string;
    description: string;
    status: ApiTask["status"];
    priority: ApiTask["priority"];
    project_id: string;
    assignee_id: string;
    due_date: string;
    estimated_hours: number;
    tags: string[];
  };
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    status: "backlog",
    priority: "medium",
    project_id: "",
    assignee_id: "",
    due_date: "",
    estimated_hours: 1,
    tags: [],
  });

  // Time tracking data
  const timeEntries = task
    ? state.allTimeEntries.filter((te) => te.task_id === task.id)
    : [];
  console.log("Here is the task:", task);
  console.log("Time Entries:", state.allTimeEntries);
  const loggedHours =
    timeEntries.reduce((sum, te) => sum + te.duration, 0) / 60;

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        project_id: task.project_id,
        assignee_id: task.assignee_id,
        due_date: task.due_date
          ? format(new Date(task.due_date), "yyyy-MM-dd")
          : "",
        estimated_hours: task.estimated_hours,
        tags: project?.tags || [],
      });
      setHasChanges(false);
    }
  }, [task, project]);

  // Close modal on escape key
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !task) return null;

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // removed handleAddTag

  // removed handleRemoveTag

  const handleSave = async () => {
    if (!task) return;
    // Prepare updated task for optimistic UI
    const updatedContextTask = {
      id: task.id,
      title: formData.title,
      description: formData.description,
      project_id: formData.project_id,
      assignee_id: formData.assignee_id,
      priority: formData.priority,
      status: formData.status,
      estimated_hours: formData.estimated_hours,
      due_date: formData.due_date
        ? new Date(formData.due_date).toISOString()
        : undefined,
      created_at: task.created_at,
      updated_at: new Date().toISOString(),
      assignee: task.assignee,
      project: task.project,
      subtasks: task.subtasks,
    };
    // Optimistically update context and close modal
    dispatch({ type: "UPDATE_TASK", payload: updatedContextTask });
    setHasChanges(false);
    onClose();
    setLoading(true);
    try {
      // Persist update to API
      await TaskService.updateTask(task.id, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        project: formData.project_id,
        assignedTo: formData.assignee_id,
        estimatedHours: formData.estimated_hours,
        dueDate: formData.due_date
          ? new Date(formData.due_date).toISOString()
          : undefined,
      });
      // Update project tags if necessary
      if (
        project &&
        JSON.stringify(project.tags) !== JSON.stringify(formData.tags)
      ) {
        const updatedProject = {
          ...project,
          tags: formData.tags,
          updated_at: new Date().toISOString(),
        };
        dispatch({ type: "UPDATE_PROJECT", payload: updatedProject });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      // TODO: rollback optimistic update if needed
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    setLoading(true);
    try {
      await TaskService.deleteTask(task.id);
      if (onDelete) onDelete(task.id);
      onClose();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (confirmed) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "done";

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                task.status === "done"
                  ? "bg-green-100"
                  : task.status === "in-progress"
                  ? "bg-blue-100"
                  : task.status === "review"
                  ? "bg-purple-100"
                  : "bg-gray-100"
              }`}
            >
              <CheckCircle
                className={`w-5 h-5 ${
                  task.status === "done"
                    ? "text-green-600"
                    : task.status === "in-progress"
                    ? "text-blue-600"
                    : task.status === "review"
                    ? "text-purple-600"
                    : "text-gray-600"
                }`}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Task Details
              </h2>
              <p className="text-sm text-gray-600">{project?.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-amber-600 mr-4">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              icon={X}
              className="p-2"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
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
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe the task in detail..."
              />
            </div>

            {/* Two Column Layout */}
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
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
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
                      value={formData.priority}
                      onChange={(e) =>
                        handleInputChange("priority", e.target.value)
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
                      value={formData.project_id}
                      onChange={(e) =>
                        handleInputChange("project_id", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {state.projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignee
                    </label>
                    <select
                      value={formData.assignee_id}
                      onChange={(e) =>
                        handleInputChange("assignee_id", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {state.profiles
                        .filter((u) => u.role !== "client")
                        .map((user) => (
                          <option key={user.id} value={user.id}>
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
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) =>
                        handleInputChange("due_date", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isOverdue
                          ? "border-red-300 bg-red-50"
                          : "border-gray-300"
                      }`}
                    />
                    {isOverdue && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {isOverdue && (
                    <p className="text-sm text-red-600 mt-1">
                      This task is overdue
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={formData.estimated_hours}
                      onChange={(e) =>
                        handleInputChange(
                          "estimated_hours",
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logged Hours
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-gray-900 font-medium">
                        {Math.round(loggedHours * 10) / 10}h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              icon={Trash2}
            >
              Delete Task
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleClose}>
              {hasChanges ? "Cancel" : "Close"}
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={!hasChanges || !formData.title.trim()}
              icon={Save}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Task
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to delete "{task.title}"? This will
                permanently remove the task and all associated time entries.
              </p>

              <div className="flex items-center justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  loading={loading}
                  icon={Trash2}
                >
                  Delete Task
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
