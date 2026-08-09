const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createComment,
  getTaskComments,
} = require("../controllers/commentController");

// Create Comment
router.post(
  "/:taskId/comments",
  protect,
  createComment
);

// Get Task Comments
router.get(
  "/:taskId/comments",
  protect,
  getTaskComments
);

module.exports = router;