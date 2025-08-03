const express = require('express');
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all notification routes - user must be authenticated
// router.use(authController.protect);

// Get all notifications for authenticated user
router.get('/', authController.protect, notificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', authController.protect, notificationController.getUnreadCount);

// Mark specific notification as read
router.patch('/:id/read', authController.protect, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', authController.protect, notificationController.markAllAsRead);

module.exports = router;
