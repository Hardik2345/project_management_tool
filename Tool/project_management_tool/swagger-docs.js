/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - passwordConfirm
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the user
 *         name:
 *           type: string
 *           description: User's name
 *         email:
 *           type: string
 *           description: User's email address
 *         password:
 *           type: string
 *           description: User's password (not returned in responses)
 *         passwordConfirm:
 *           type: string
 *           description: Password confirmation (not returned in responses)
 *         role:
 *           type: string
 *           enum: [team member, admin, manager]
 *           description: User's role in the system
 *         authProvider:
 *           type: string
 *           enum: [local, google]
 *           description: Authentication provider
 *         googleId:
 *           type: string
 *           description: Google ID for users authenticated via Google
 *         active:
 *           type: boolean
 *           description: Whether the user account is active
 *       example:
 *         name: John Doe
 *         email: john@example.com
 *         password: password123
 *         passwordConfirm: password123
 *         role: team member
 *
 *     Project:
 *       type: object
 *       required:
 *         - name
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the project
 *         name:
 *           type: string
 *           description: Project name
 *         description:
 *           type: string
 *           description: Project description
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the project
 *         members:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of users who are members of the project
 *         tasks:
 *           type: array
 *           items:
 *             type: string
 *           description: IDs of tasks associated with the project
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the project was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the project was last updated
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Project deadline
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Project priority level
 *         status:
 *           type: string
 *           enum: [Not Started, In Progress, Completed, On Hold, Cancelled]
 *           description: Current status of the project
 *       example:
 *         name: Website Redesign
 *         description: Complete overhaul of the company website
 *         priority: high
 *         status: In Progress
 *         deadline: 2025-12-31T00:00:00.000Z
 *
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - assignedTo
 *         - project
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the task
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         status:
 *           type: string
 *           enum: [backlog, todo, in-progress, review, done]
 *           description: Current status of the task
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Task priority level
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Task due date
 *         assignedTo:
 *           type: string
 *           description: ID of the user to whom the task is assigned
 *         project:
 *           type: string
 *           description: ID of the project to which the task belongs
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the task was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the task was last updated
 *         estimatedHours:
 *           type: number
 *           description: Estimated hours to complete the task
 *       example:
 *         title: Create homepage mockup
 *         description: Design a mockup for the new homepage
 *         status: todo
 *         priority: high
 *         dueDate: 2025-08-15T00:00:00.000Z
 *         estimatedHours: 8
 *
 *     Client:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the client
 *         name:
 *           type: string
 *           description: Client name
 *         email:
 *           type: string
 *           description: Client email address
 *         phone:
 *           type: string
 *           description: Client phone number
 *         company:
 *           type: string
 *           description: Client company name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the client was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date and time when the client was last updated
 *       example:
 *         name: Acme Corporation
 *         email: contact@acme.com
 *         phone: "1234567890"
 *         company: Acme Inc.
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - bearerAuth: []
 */

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: User authentication
 *   - name: Users
 *     description: User management
 *   - name: Projects
 *     description: Project management
 *   - name: Tasks
 *     description: Task management
 *   - name: Clients
 *     description: Client management
 */

/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - passwordConfirm
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already in use
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Incorrect email or password
 */

/**
 * @swagger
 * /users/logout:
 *   get:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */

/**
 * @swagger
 * /users/forgotPassword:
 *   post:
 *     summary: Send a password reset token via email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token sent to email
 *       404:
 *         description: User with that email not found
 */

/**
 * @swagger
 * /users/resetPassword/{token}:
 *   patch:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         description: Password reset token
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - passwordConfirm
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid token or passwords don't match
 */

/**
 * @swagger
 * /users/auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google authentication
 */

/**
 * @swagger
 * /users/auth/google/return:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects after Google authentication
 */

/**
 * @swagger
 * /users/updateMyPassword:
 *   patch:
 *     summary: Update current user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordCurrent
 *               - password
 *               - passwordConfirm
 *             properties:
 *               passwordCurrent:
 *                 type: string
 *                 format: password
 *               password:
 *                 type: string
 *                 format: password
 *               passwordConfirm:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /users/updateMe:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
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
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /users/deleteMe:
 *   delete:
 *     summary: Deactivate current user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User account deactivated successfully
 */

/**
 * @swagger
 * /users/{id}/tasks:
 *   get:
 *     summary: Get all tasks assigned to a specific user
 *     tags: [Users, Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 */

/**
 * @swagger
 * /users/{id}/projects:
 *   get:
 *     summary: Get all projects associated with a specific user
 *     tags: [Users, Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       403:
 *         description: Not authorized. Admin access required.
 *   post:
 *     summary: Create a new user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Not authorized. Admin access required.
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a specific user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       403:
 *         description: Not authorized. Admin access required.
 *   patch:
 *     summary: Update a specific user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
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
 *               role:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       403:
 *         description: Not authorized. Admin access required.
 *   delete:
 *     summary: Delete a specific user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Not authorized. Admin access required.
 */

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     projects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Project'
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               status:
 *                 type: string
 *                 enum: [Not Started, In Progress, Completed, On Hold, Cancelled]
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get a specific project by ID
 *     tags: [Projects]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     project:
 *                       $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *   patch:
 *     summary: Update a specific project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               status:
 *                 type: string
 *                 enum: [Not Started, In Progress, Completed, On Hold, Cancelled]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Project not found
 *   delete:
 *     summary: Delete a specific project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /projects/{projectId}/add-member:
 *   patch:
 *     summary: Add a member to a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added to project successfully
 *       404:
 *         description: Project or user not found
 */

/**
 * @swagger
 * /projects/{projectId}/add-tags:
 *   patch:
 *     summary: Add tags to a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tags
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tags added to project successfully
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - assignedTo
 *               - project
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [backlog, todo, in-progress, review, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *               project:
 *                 type: string
 *               estimatedHours:
 *                 type: number
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *   patch:
 *     summary: Update a specific task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [backlog, todo, in-progress, review, done]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo:
 *                 type: string
 *               estimatedHours:
 *                 type: number
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a specific task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Task ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     clients:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Client'
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get a specific client by ID
 *     tags: [Clients]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Client ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     client:
 *                       $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *   patch:
 *     summary: Update a specific client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Client ID
 *         schema:
 *           type: string
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
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Client not found
 *   delete:
 *     summary: Delete a specific client
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Client ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 */

module.exports = {
  swaggerDocs: true
};
