import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Clock, CheckCircle } from 'lucide-react';
import LoadingScreen from '../components/ui/LoadingScreen';
import { TaskService } from '../services/taskService';
import { ApiTask } from '../types';

interface TaskDetailData {
  _id: string;
  title: string;
  description?: string;
  status: "backlog" | "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  project?: {
    _id: string;
    name: string;
  } | string;
  estimatedHours?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await TaskService.getTaskById(id);
        if (response.data?.task) {
          setTask(response.data.task as TaskDetailData);
        }
      } catch (err: any) {
        console.error('Failed to fetch task:', err);
        setError(err.response?.data?.message || 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {error || 'Task not found'}
          </h2>
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tasks
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
        </div>

        {/* Task Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            {/* Status and Priority Row */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900 mr-2">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                </span>
              </div>
              
              <div className="flex items-center">
                <Tag className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900 mr-2">Priority:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Task Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assigned To */}
              {task.assignedTo && typeof task.assignedTo === 'object' && (
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Assigned To:</span>
                    <p className="text-sm text-gray-700">{task.assignedTo.name}</p>
                    <p className="text-xs text-gray-500">{task.assignedTo.email}</p>
                  </div>
                </div>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Due Date:</span>
                    <p className="text-sm text-gray-700">
                      {new Date(task.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Project */}
              {task.project && typeof task.project === 'object' && (
                <div className="flex items-center">
                  <Tag className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Project:</span>
                    <p className="text-sm text-gray-700">{task.project.name}</p>
                  </div>
                </div>
              )}

              {/* Created Date */}
              {task.createdAt && (
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Created:</span>
                    <p className="text-sm text-gray-700">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
