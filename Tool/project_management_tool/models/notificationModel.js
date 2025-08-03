const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification must belong to a user'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Notification must have a title'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Notification must have a message'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success', 'task_assignment', 'task_update', 'general'],
    default: 'info',
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  relatedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for efficient querying
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
