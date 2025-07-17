const Task = require("../models/taskModel");
const catchAsync = require("../utils/catchAsync");

exports.getTasksByUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const tasks = await Task.find({ assignedTo: userId }).populate({
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
