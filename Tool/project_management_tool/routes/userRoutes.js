const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const userTaskController = require("../controllers/userTaskController");
const userProjectController = require("../controllers/userProjectController");

const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);

router.patch("/resetPassword/:token", authController.resetPassword);

router.get("/users", userController.getAllUsers);

router.get("/auth/google", authController.googleAuth);

router.get("/auth/google/return", authController.googleCallback);

// Protect all routes after this middleware using Passport
router.use(authController.protect);

router.patch("/updateMyPassword", authController.updatePassword);

router.get("/me", userController.getMe, userController.getUser);

router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

router.delete("/deleteMe", userController.deleteMe);

router.get("/:id/tasks", userTaskController.getTasksByUser);

router.get("/:id/projects", userProjectController.getProjectsByUser);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
