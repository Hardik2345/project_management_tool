const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: null,
  },
  endTime: {
    type: Date,
    default: null,
  },
  duration: {
    type: Number,
    default: 0,
    // Duration in minutes
  },
  isPaused: {
    type: Boolean,
    default: false,
  },
  pausedAt: {
    type: Date,
    default: null,
  },
  totalPausedTime: {
    type: Number,
    default: 0,
    // Total paused time in milliseconds
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual field for backward compatibility - calculates duration if not set
timerSchema.virtual('calculatedDuration').get(function() {
  if (this.duration > 0) {
    return this.duration;
  }
  if (this.endTime && this.startTime) {
    const totalTime = this.endTime.getTime() - this.startTime.getTime();
    const pausedTime = this.totalPausedTime || 0;
    return Math.round((totalTime - pausedTime) / 60000); // Convert to minutes
  }
  return 0;
});

// Pre-save middleware to update duration and updatedAt
timerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate duration if endTime is set and duration is not manually set
  if (this.endTime && this.startTime && this.duration === 0) {
    const totalTime = this.endTime.getTime() - this.startTime.getTime();
    const pausedTime = this.totalPausedTime || 0;
    this.duration = Math.round((totalTime - pausedTime) / 60000);
  }
  
  next();
});

timerSchema.index({ user: 1, project: 1 });

const Timer = mongoose.model("Timer", timerSchema);
module.exports = Timer;
