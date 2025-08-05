const Timer = require("../models/timerModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const handlerFactory = require("./handlerFactory");

// Start timer (set startTime)
exports.startTimer = catchAsync(async (req, res, next) => {
  const { userId, projectId, taskId, description } = req.body;
  if (!userId || !projectId || !taskId) {
    return next(
      new AppError("userId, projectId, and taskId are required", 400)
    );
  }
  let timer = await Timer.findOne({
    user: userId,
    project: projectId,
    task: taskId,
    endTime: null,
  });
  if (!timer) {
    timer = await Timer.create({
      user: userId,
      project: projectId,
      task: taskId,
      startTime: new Date(),
      description: description || "Timer session",
    });
  } else {
    timer.startTime = new Date();
    timer.endTime = null;
    await timer.save();
  }
  res.status(200).json({ status: "success", data: { timer } });
});

// Stop timer (set endTime and calculate duration)
exports.stopTimer = catchAsync(async (req, res, next) => {
  const { userId, projectId, taskId, description } = req.body;
  if (!userId || !projectId || !taskId) {
    return next(
      new AppError("userId, projectId, and taskId are required", 400)
    );
  }
  const timer = await Timer.findOne({
    user: userId,
    project: projectId,
    task: taskId,
    endTime: null,
  });
  if (!timer) {
    return next(
      new AppError(
        "No running timer found for this user, project, and task",
        404
      )
    );
  }
  
  timer.endTime = new Date();
  
  // Calculate duration excluding paused time
  const totalTime = timer.endTime.getTime() - timer.startTime.getTime();
  const pausedTime = timer.totalPausedTime || 0;
  timer.duration = Math.round((totalTime - pausedTime) / 60000); // Convert to minutes
  
  // Update description if provided
  if (description) timer.description = description;
  
  // Reset pause-related fields
  timer.isPaused = false;
  timer.pausedAt = null;
  
  await timer.save();
  res.status(200).json({ status: "success", data: { timer } });
});

// Get all timers for a user
exports.getTimersForUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const timers = await Timer.find({ user: userId }).populate("project task");
  res.status(200).json({ status: "success", data: { timers } });
});

// Get all timers for a project
exports.getTimersForProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const timers = await Timer.find({ project: projectId }).populate("user task");
  res.status(200).json({ status: "success", data: { timers } });
});

// Log manual time (create timer with all fields and calculated duration)
exports.logManualTime = catchAsync(async (req, res, next) => {
  const { user, project, task, startTime, endTime, description } = req.body;
  if (!user || !project || !task || !startTime || !endTime) {
    return next(
      new AppError(
        "user, project, task, startTime, and endTime are required",
        400
      )
    );
  }
  
  // Calculate duration for manual entries
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationInMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
  
  const timer = await Timer.create({
    user,
    project,
    task,
    startTime: start,
    endTime: end,
    duration: durationInMinutes,
    description: description || "Manual time entry",
    isPaused: false,
    totalPausedTime: 0,
  });
  res.status(201).json({ status: "success", data: { timer } });
});

// Pause timer
exports.pauseTimer = catchAsync(async (req, res, next) => {
  const { userId, projectId, taskId } = req.body;
  if (!userId || !projectId || !taskId) {
    return next(
      new AppError("userId, projectId, and taskId are required", 400)
    );
  }
  
  const timer = await Timer.findOne({
    user: userId,
    project: projectId,
    task: taskId,
    endTime: null,
    isPaused: false,
  });
  
  if (!timer) {
    return next(
      new AppError("No running timer found to pause", 404)
    );
  }
  
  timer.isPaused = true;
  timer.pausedAt = new Date();
  await timer.save();
  
  res.status(200).json({ status: "success", data: { timer } });
});

// Resume timer
exports.resumeTimer = catchAsync(async (req, res, next) => {
  const { userId, projectId, taskId } = req.body;
  if (!userId || !projectId || !taskId) {
    return next(
      new AppError("userId, projectId, and taskId are required", 400)
    );
  }
  
  const timer = await Timer.findOne({
    user: userId,
    project: projectId,
    task: taskId,
    endTime: null,
    isPaused: true,
  });
  
  if (!timer) {
    return next(
      new AppError("No paused timer found to resume", 404)
    );
  }
  
  // Calculate and add paused time
  if (timer.pausedAt) {
    const pauseDuration = new Date().getTime() - timer.pausedAt.getTime();
    timer.totalPausedTime = (timer.totalPausedTime || 0) + pauseDuration;
  }
  
  timer.isPaused = false;
  timer.pausedAt = null;
  await timer.save();
  
  res.status(200).json({ status: "success", data: { timer } });
});

// Delete a time entry
exports.deleteTimeEntry = handlerFactory.deleteOne(Timer);
