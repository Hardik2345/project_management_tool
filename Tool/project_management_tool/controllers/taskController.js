const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel"); // import User model
const { sendTaskAssignmentEmail } = require("../utils/mail"); // import email helper
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
    const assignee = await User.findById(task.assignedTo).select("email");
    if (assignee && assignee.email) {
      sendTaskAssignmentEmail(assignee.email, task);
    }
  } catch (err) {
    console.error("Failed to send task assignment email:", err);
  }

  res.status(201).json({
    status: "success",
    data: {
      data: task,
    },
  });
});

exports.updateTask = handlerFactory.updateOne(Task);
exports.deleteTask = handlerFactory.deleteOne(Task);
