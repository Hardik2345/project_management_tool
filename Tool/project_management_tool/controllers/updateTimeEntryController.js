// Update a time entry
const Timer = require("../models/timerModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.updateTimeEntry = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { duration, date, description } = req.body;
  const timer = await Timer.findById(id);
  if (!timer) {
    return next(new AppError("No time entry found with that ID", 404));
  }
  if (duration !== undefined) timer.duration = duration;
  if (date !== undefined) {
    // Update both startTime and endTime to match the new date, keeping the time part
    const start = new Date(timer.startTime);
    const end = new Date(timer.endTime);
    if (!isNaN(start)) start.setFullYear(...date.split('-'));
    if (!isNaN(end)) end.setFullYear(...date.split('-'));
    timer.startTime = start;
    timer.endTime = end;
  }
  if (description !== undefined) timer.description = description;
  timer.updatedAt = new Date();
  await timer.save();
  res.status(200).json({ status: "success", data: { timer } });
});
