import { useEffect, useState } from "react";
import { ProjectService, TaskService, UserService } from "../../services";
import { ApiProject, ApiTask } from "../../types";

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  totalUsers: number;
  completedTasks: number;
  inProgressTasks: number;
}

export function ApiDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalTasks: 0,
    totalUsers: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState<ApiProject[]>([]);
  const [recentTasks, setRecentTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [projectsResponse, tasksResponse, usersResponse] =
          await Promise.all([
            ProjectService.getAllProjects(),
            TaskService.getAllTasks(),
            UserService.getAllUsers().catch(() => ({ data: { users: [] } })), // Might fail if not admin
          ]);

        const projects = projectsResponse.data?.projects || [];
        const tasks = tasksResponse.data?.tasks || [];
        const users = usersResponse.data?.users || [];

        // Calculate stats
        const completedTasks = tasks.filter(
          (task) => task.status === "done"
        ).length;
        const inProgressTasks = tasks.filter(
          (task) => task.status === "in-progress"
        ).length;

        setStats({
          totalProjects: projects.length,
          totalTasks: tasks.length,
          totalUsers: users.length,
          completedTasks,
          inProgressTasks,
        });

        // Set recent items (last 5)
        setRecentProjects(projects.slice(-5).reverse());
        setRecentTasks(tasks.slice(-5).reverse());
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const createSampleProject = async () => {
    try {
      const newProject = {
        name: `Sample Project ${Date.now()}`,
        description:
          "This is a sample project created from the API integration demo",
        createdBy: "507f1f77bcf86cd799439011", // Replace with actual user ID
        priority: "medium" as const,
        status: "In Progress" as const,
      };

      const response = await ProjectService.createProject(newProject);
      console.log("Created project:", response);

      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Failed to create project:", err);
      alert("Failed to create project. Make sure you are authenticated.");
    }
  };

  const createSampleTask = async () => {
    try {
      const newTask = {
        title: `Sample Task ${Date.now()}`,
        description:
          "This is a sample task created from the API integration demo",
        status: "todo" as const,
        priority: "medium" as const,
        assignedTo: "507f1f77bcf86cd799439011", // Replace with actual user ID
        project: recentProjects[0]?._id || "507f1f77bcf86cd799439012", // Use first project or placeholder
        estimatedHours: 4,
      };

      const response = await TaskService.createTask(newTask);
      console.log("Created task:", response);

      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Failed to create task:", err);
      alert(
        "Failed to create task. Make sure you are authenticated and have projects available."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          API Integration Dashboard
        </h1>
        <p className="text-gray-600">
          This dashboard demonstrates the integrated Project Management API
          functionality.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalProjects}
          </div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {stats.totalTasks}
          </div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalUsers}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-500">
            {stats.completedTasks}
          </div>
          <div className="text-sm text-gray-600">Completed Tasks</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-500">
            {stats.inProgressTasks}
          </div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={createSampleProject}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Create Sample Project
        </button>
        <button
          onClick={createSampleTask}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Create Sample Task
        </button>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Projects
            </h2>
          </div>
          <div className="p-6">
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project._id}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <h3 className="font-medium text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded ${
                          project.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : project.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          project.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : project.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {project.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No projects found
              </p>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Tasks
            </h2>
          </div>
          <div className="p-6">
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="border-l-4 border-green-500 pl-4"
                  >
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span
                        className={`px-2 py-1 rounded ${
                          task.status === "done"
                            ? "bg-green-100 text-green-800"
                            : task.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : task.status === "review"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {task.status}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                      {task.estimatedHours && (
                        <span className="text-gray-500">
                          {task.estimatedHours}h estimated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks found</p>
            )}
          </div>
        </div>
      </div>

      {/* API Information */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          API Integration Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Projects API:</strong>{" "}
            {stats.totalProjects > 0 ? "✅ Connected" : "❌ No data"}
          </div>
          <div>
            <strong>Tasks API:</strong>{" "}
            {stats.totalTasks > 0 ? "✅ Connected" : "❌ No data"}
          </div>
          <div>
            <strong>Users API:</strong>{" "}
            {stats.totalUsers > 0 ? "✅ Connected" : "⚠️ Limited access"}
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-600">
          This dashboard is powered by the integrated Project Management API.
          Check the browser console for detailed API call logs.
        </p>
      </div>
    </div>
  );
}

export default ApiDashboard;
