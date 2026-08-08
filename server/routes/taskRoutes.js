const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getAssignedTasks,
  updateTaskStatus,
  getMyTaskStats,
} = require("../controllers/taskController");

// Create Task
// Admin + Project Manager
router.post(
  "/",
  protect,
  authorize("admin", "project_manager"),
  createTask
);

// Get All Tasks
// Admin + Project Manager
router.get(
  "/",
  protect,
  authorize("admin", "project_manager"),
  getTasks
);

// Get Assigned Tasks
// Team Member only
router.get(
  "/assigned",
  protect,
  authorize("team_member"),
  getAssignedTasks
);

// Team Member Dashboard Stats
router.get(
  "/my-stats",
  protect,
  authorize("team_member"),
  getMyTaskStats
);

// Get Single Task
// Controller performs ownership/project authorization
router.get(
  "/:id",
  protect,
  getTaskById
);

// Update Task
// Controller allows Admin + assigned PM
router.put(
  "/:id",
  protect,
  authorize("admin", "project_manager"),
  updateTask
);

// Update Task Status
// Team Member only
router.patch(
  "/:id/status",
  protect,
  authorize("team_member"),
  updateTaskStatus
);

// Delete Task
// Controller allows Admin + assigned PM
router.delete(
  "/:id",
  protect,
  authorize("admin", "project_manager"),
  deleteTask
);

module.exports = router;