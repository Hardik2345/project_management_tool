const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel"); // import User model
const { sendTaskAssignmentEmail } = require("../utils/mail"); // import email helper
const { createNotification } = require("./notificationController"); // import notification helper
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Task.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tasks = await features.query
    .populate({
      path: "assignedTo",
      select: "name email",
    })
    .populate({
      path: "project",
      select: "name",
    });
  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: {
      data: tasks,
    },
  });
});

exports.getTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate({
      path: "assignedTo",
      select: "name email",
    })
    .populate({
      path: "project",
      select: "name",
    });
  if (!task) {
    return next(new Error("No task found with that ID"));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: task,
    },
  });
});

exports.createTask = catchAsync(async (req, res, next) => {
  const task = await Task.create(req.body);
  // Add the new task to the project's tasks array
  await Project.findByIdAndUpdate(task.project, { $push: { tasks: task._id } });

  // Send assignment email to the user
  try {
    const assignee = await User.findById(task.assignedTo).select("email name");
    if (assignee && assignee.email) {
      sendTaskAssignmentEmail(assignee.email, task);
    }
  } catch (err) {
    console.error("Failed to send task assignment email:", err);
  }

  // Create in-app notification for the assigned user
  try {
    if (task.assignedTo) {
      const notification=await createNotification(
        task.assignedTo,
        "New Task Assigned",
        `You have been assigned a new task: "${task.title}"`,
        "task_assignment",
        task._id
      );
      console.log("Notification created:", notification);
    }
  } catch (err) {
    console.error("Failed to create task assignment notification:", err);
  }

  res.status(201).json({
    status: "success",
    data: {
      data: task,
    },
  });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  // Get the current task to check if assignee is changing
  const currentTask = await Task.findById(req.params.id);
  if (!currentTask) {
    return next(new Error("No task found with that ID"));
  }

  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Check if assignedTo field changed and send notification
  if (req.body.assignedTo && req.body.assignedTo !== currentTask.assignedTo?.toString()) {
    try {
      await createNotification(
        req.body.assignedTo,
        "Task Assigned to You",
        `You have been assigned to task: "${task.title}"`,
        "task_assignment",
        task._id
      );
    } catch (err) {
      console.error("Failed to create task assignment notification:", err);
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      data: task,
    },
  });
});

exports.deleteTask = handlerFactory.deleteOne(Task);
