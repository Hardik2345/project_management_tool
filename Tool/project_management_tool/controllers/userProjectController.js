const Project = require("../models/projectModel");
const catchAsync = require("../utils/catchAsync");

exports.getProjectsByUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const projects = await Project.find({
    $or: [{ createdBy: userId }, { members: userId }],
  })
    .populate({
      path: "client",
      select: "name",
    })
    .populate({
      path: "tasks",
      select:
        "title description status dueDate assignedTo project estimatedHours",
      populate: {
        path: "assignedTo",
        select: "name email",
      },
    });
  res.status(200).json({
    status: "success",
    results: projects.length,
    data: {
      data: projects,
    },
  });
});
