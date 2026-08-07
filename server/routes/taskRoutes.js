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

// Create Task (Admin + Project Manager)
router.post(
  "/",
  protect,
  authorize("admin", "project_manager"),
  createTask
);
// Get All Tasks
router.get("/", protect, getTasks);

// Get Assigned Tasks (Team Member Only)
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
router.get("/:id", protect, getTaskById);

// Update Task (General)
router.put("/:id", protect, updateTask);

// Update Task Status (Team Member Only)
router.patch(
  "/:id/status",
  protect,
  authorize("team_member"),
  updateTaskStatus
);

// Delete Task
router.delete("/:id", protect, deleteTask);

module.exports = router;