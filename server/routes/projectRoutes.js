const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  assignProjectManager,
  manageTeamMembers,
  removeTeamMember,
  deleteProject,
} = require("../controllers/projectController");

// Create Project
router.post("/", protect, createProject);

// Get All Projects
router.get("/", protect, getProjects);

// Get Single Project
router.get("/:id", protect, getProjectById);

// Update Project
router.put("/:id", protect, updateProject);

// Assign Project Manager (Admin Only)
router.patch(
  "/:id/manager",
  protect,
  authorize("admin"),
  assignProjectManager
);

// Add Team Members (Admin Only)
router.patch(
  "/:id/members",
  protect,
  authorize("admin"),
  manageTeamMembers
);

// Remove Team Member (Admin Only)
router.patch(
  "/:id/members/remove",
  protect,
  authorize("admin"),
  removeTeamMember
);

// Delete Project
router.delete("/:id", protect, deleteProject);

module.exports = router;