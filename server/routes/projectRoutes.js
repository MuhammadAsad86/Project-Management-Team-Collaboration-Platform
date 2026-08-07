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
  getAssignedProjects,
  getProjectWorkspace,
  getProjectManagerStats,
} = require("../controllers/projectController");

// Create Project (Admin Only)
router.post(
  "/",
  protect,
  authorize("admin"),
  createProject
);

// Get All Projects
router.get("/", protect, getProjects);

// Get Assigned Projects (Project Manager)
router.get(
  "/assigned",
  protect,
  authorize("project_manager"),
  getAssignedProjects
);

// Project Manager Dashboard Stats
router.get(
  "/stats",
  protect,
  authorize("project_manager"),
  getProjectManagerStats
);

// Get Project Workspace
router.get(
  "/:id/workspace",
  protect,
  authorize("admin", "project_manager"),
  getProjectWorkspace
);

// Get Single Project
router.get("/:id", protect, getProjectById);

// Update Project (Admin Only)
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateProject
);

// Assign Project Manager (Admin Only)
router.patch(
  "/:id/manager",
  protect,
  authorize("admin"),
  assignProjectManager
);

// Add Team Members
router.patch(
  "/:id/members",
  protect,
  authorize("admin", "project_manager"),
  manageTeamMembers
);

// Remove Team Member
router.patch(
  "/:id/members/remove",
  protect,
  authorize("admin", "project_manager"),
  removeTeamMember
);

// Delete Project (Admin Only)
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteProject
);

module.exports = router;