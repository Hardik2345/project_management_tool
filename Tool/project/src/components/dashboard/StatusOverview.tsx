import React from "react";
import { useApp } from "../../contexts/AppContext";
import {
  AlertTriangle,
  CheckCircle,
  Target,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { differenceInCalendarDays, startOfToday } from "date-fns";

export function StatusOverview() {
  const { state, currentUser } = useApp();

  // Get user's tasks
  const userTasks = state.tasks.filter(
    (task) => task.assignee_id === currentUser?.id
  );

  // Calculate metrics
  const totalTasks = userTasks.length;
  const completedTasks = userTasks.filter(
    (task) => task.status === "done"
  ).length;
  // Count tasks with due_date before today as overdue
  const overdueTasks = userTasks.filter((task) => {
    if (!task.due_date || task.status === "done") return false;
    const dueDate = new Date(task.due_date);
    return differenceInCalendarDays(dueDate, startOfToday()) < 0;
  }).length;
  // Count tasks due today or within next 2 days as at risk (excluding overdue)
  const atRiskTasks = userTasks.filter((task) => {
    if (!task.due_date || task.status === "done") return false;
    const dueDate = new Date(task.due_date);
    const diffDays = differenceInCalendarDays(dueDate, startOfToday());
    return diffDays >= 0 && diffDays <= 2;
  }).length;

  // Removed sprint completion logic

  // Weekly progress comparison (mock data)
  const weeklyProgress = {
    current: completedTasks,
    previous: Math.max(0, completedTasks - 3),
    trend: "up" as "up" | "down",
  };

  const metrics = [
    {
      title: "Total Assigned",
      value: totalTasks,
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Active tasks",
    },
    {
      title: "At Risk",
      value: atRiskTasks + overdueTasks,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: `${overdueTasks} overdue, ${atRiskTasks} due soon`,
      alert: atRiskTasks + overdueTasks > 0,
    },
    {
      title: "Completion Rate",
      value: `${
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }%`,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: `${completedTasks} of ${totalTasks} completed`,
      progress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Status Overview</h3>
        <div className="flex items-center space-x-1">
          {weeklyProgress.trend === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className="text-xs text-gray-600">
            {weeklyProgress.current > weeklyProgress.previous ? "+" : ""}
            {weeklyProgress.current - weeklyProgress.previous} this week
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-sm ${
              metric.alert
                ? "border-red-200 bg-red-50"
                : `${metric.borderColor} ${metric.bgColor}`
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
              </div>
              {metric.alert && (
                <Badge variant="danger" size="sm">
                  Alert
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <div className="text-xl font-bold text-gray-900">
                {metric.value}
              </div>
              <div className="text-sm font-medium text-gray-700">
                {metric.title}
              </div>
              <div className="text-xs text-gray-500">{metric.description}</div>
            </div>

            {/* Progress bar for completion metrics */}
            {metric.progress !== undefined && (
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      metric.title.includes("Sprint")
                        ? "bg-purple-600"
                        : "bg-green-600"
                    }`}
                    style={{ width: `${metric.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {(overdueTasks > 0 || atRiskTasks > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">
              Quick Actions
            </h4>
            <div className="space-y-1">
              {overdueTasks > 0 && (
                <button className="text-xs text-red-600 hover:text-red-800 font-medium block">
                  Review {overdueTasks} overdue task
                  {overdueTasks > 1 ? "s" : ""}
                </button>
              )}
              {atRiskTasks > 0 && (
                <button className="text-xs text-orange-600 hover:text-orange-800 font-medium block">
                  Check {atRiskTasks} at-risk task{atRiskTasks > 1 ? "s" : ""}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
