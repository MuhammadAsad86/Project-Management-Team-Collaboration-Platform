const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createComment,
  getTaskComments,
  deleteComment,
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

// Delete Own Comment
router.delete(
  "/comments/:commentId",
  protect,
  deleteComment
);

module.exports = router;