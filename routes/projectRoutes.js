const express = require("express");
const projectController = require("../controllers/projectController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(projectController.getAllProjects)
  .post(authController.protect, projectController.createProject);

router
  .route("/:id")
  .get(projectController.getProject)
  .patch(authController.protect, projectController.updateProject)
  .delete(authController.protect, projectController.deleteProject);

router.patch("/:projectId/add-member", projectController.addMember);
router.patch("/:projectId/add-tags", projectController.addTags);

module.exports = router;
