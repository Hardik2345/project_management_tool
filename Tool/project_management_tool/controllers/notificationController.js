const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// Get all notifications for the authenticated user
exports.getNotifications = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Notification.find({ user: req.user._id, archived: false }),
    req.query
  )
    .sort('-createdAt') // Latest first
    .limitFields()
    .paginate();

  const notifications = await features.query;

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications,
    },
  });
});

// Get unread notification count for the authenticated user
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    read: false,
    archived: false,
  });

  res.status(200).json({
    status: 'success',
    data: {
      count,
    },
  });
});

// Mark a specific notification as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id, // Ensure user can only mark their own notifications
    },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      status: 'fail',
      message: 'Notification not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification,
    },
  });
});

// Mark all notifications as read for the authenticated user
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    {
      user: req.user._id,
      read: false,
      archived: false,
    },
    { read: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

// Archive a specific notification
exports.archiveNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user._id, // Ensure user can only archive their own notifications
    },
    { archived: true, read: true }, // Mark as both archived and read
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      status: 'fail',
      message: 'Notification not found',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      notification,
    },
  });
});

// Helper function to create a new notification (used by other controllers)
exports.createNotification = async (userId, title, message, type = 'info', relatedTaskId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedTaskId,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
