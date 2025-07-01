const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *               riotTag:
 *                 type: string
 *               riotUsername:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post("/signup", authController.signup);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Logout the current user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.get("/logout", authController.logout);

/**
 * @swagger
 * /users/forgotPassword:
 *   post:
 *     summary: Request a password reset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset token sent to email
 */
router.post("/forgotPassword", authController.forgotPassword);

/**
 * @swagger
 * /users/resetPassword/{token}:
 *   patch:
 *     summary: Reset user password
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.patch("/resetPassword/:token", authController.resetPassword);

/**
 * @swagger
 * /users/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users", userController.getAllUsers);

/**
 * @swagger
 * /users/auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Redirects to Google login page
 */
router.get("/auth/google", authController.googleAuth);

/**
 * @swagger
 * /users/auth/google/return:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Users]
 *     responses:
 *       302:
 *         description: Redirects to frontend after authentication
 */
router.get("/auth/google/return", authController.googleCallback);

// Protect all routes after this middleware using Passport
router.use(authController.protect);

/**
 * @swagger
 * /users/updateMyPassword:
 *   patch:
 *     summary: Update current user's password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passwordCurrent:
 *                 type: string
 *               password:
 *                 type: string
 *               passwordConfirm:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 */
router.patch("/updateMyPassword", authController.updatePassword);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get("/me", userController.getMe, userController.getUser);

/**
 * @swagger
 * /users/updateMe:
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch(
  "/updateMe",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);

/**
 * @swagger
 * /users/deleteMe:
 *   delete:
 *     summary: Deactivate current user's account
 *     tags: [Users]
 *     responses:
 *       204:
 *         description: User deleted successfully
 */
router.delete("/deleteMe", userController.deleteMe);

// Admin only routes
router.use(authController.restrictTo("admin"));

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