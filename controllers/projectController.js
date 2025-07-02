const Project = require("../models/projectModel");
const handlerFactory = require("./handlerFactory");
const catchAsync = require("../utils/catchAsync");

exports.getAllProjects = catchAsync(async (req, res, next) => {
  const projects = await Project.find()
    .populate({
      path: "client",
      select: "name",
    })
    .populate({
      path: "tasks",
      select: "title description status dueDate assignedTo estimatedHours",
      populate: {
        path: "assignedTo",
        select: "name email",
      },
    })
    .populate({
      path: "members",
      select: "name email",
    });
  res.status(200).json({
    status: "success",
    results: projects.length,
    data: {
      data: projects,
    },
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate({
      path: "client",
      select: "name",
    })
    .populate({
      path: "tasks",
      populate: {
        path: "assignedTo",
        select: "name email",
      },
    })
    .populate({
      path: "members",
      select: "name email",
    });
  if (!project) {
    return next(new Error("No project found with that ID"));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: project,
    },
  });
});

exports.createProject = handlerFactory.createOne(Project);
exports.updateProject = handlerFactory.updateOne(Project);
exports.deleteProject = handlerFactory.deleteOne(Project);
exports.addMember = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { memberId } = req.body;
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { members: memberId } }, // $addToSet prevents duplicates
    { new: true }
  );
  if (!project) {
    return next(new Error("No project found with that ID"));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: project,
    },
  });
});
exports.addTags = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { tags } = req.body; // tags should be an array of strings
  if (!Array.isArray(tags)) {
    return res
      .status(400)
      .json({ status: "fail", message: "Tags must be an array of strings." });
  }
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { tags: { $each: tags } } }, // $addToSet ensures uniqueness
    { new: true }
  );
  if (!project) {
    return next(new Error("No project found with that ID"));
  }
  res.status(200).json({
    status: "success",
    data: {
      data: project,
    },
  });
});
