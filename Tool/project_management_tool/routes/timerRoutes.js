const express = require("express");
const timerController = require("../controllers/timerController");
const authController = require("../controllers/authController");
const router = express.Router();

// Start timer (requires userId, projectId, taskId)
router.patch("/start", authController.protect, timerController.startTimer);
// Stop timer (requires userId, projectId, taskId)
router.patch("/stop", authController.protect, timerController.stopTimer);
// Get all timers for a user
router.get(
  "/user/:userId",
  authController.protect,
  timerController.getTimersForUser
);
// Get all timers for a project
router.get(
  "/project/:projectId",
  authController.protect,
  timerController.getTimersForProject
);
// Log manual time (create timer with all fields)
router.post("/log", authController.protect, timerController.logManualTime);
// Delete a time entry by ID
router.delete("/:id", authController.protect, timerController.deleteTimeEntry);

module.exports = router;
