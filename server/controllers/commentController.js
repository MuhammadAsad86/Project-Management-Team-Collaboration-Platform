const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const createNotification = require("../utils/notificationHelper");
const canAccessTask = (task, user) => {
  // Admin can access all task discussions.
  if (user.role === "admin") {
    return true;
  }

  // Project Manager can access tasks
  // belonging to projects assigned to them.
  if (
    user.role === "project_manager" &&
    task.project?.assignedManager?.toString() === user.id
  ) {
    return true;
  }

  // Team Member can access only their own assigned task.
  const assignedUserId =
    task.assignedTo?._id?.toString() ||
    task.assignedTo?.toString();

  if (
    user.role === "team_member" &&
    assignedUserId === user.id
  ) {
    return true;
  }

  return false;
};

// Create Comment
const createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { message } = req.body;

    // Validate Task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // Validate comment message
    if (
      typeof message !== "string" ||
      message.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment message is required",
      });
    }

    // Prevent excessively long comments.
    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot exceed 1000 characters",
      });
    }

    // Find task and project information
    // required for authorization and notifications.
    const task = await Task.findById(taskId)
      .populate("project", "name assignedManager")
      .populate("assignedTo", "name email role");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Task-level authorization
    if (!canAccessTask(task, req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this task discussion",
      });
    }

    // User comes from authenticated JWT,
    // not frontend input.
    const comment = await Comment.create({
      task: task._id,
      user: req.user.id,
      message: message.trim(),
    });

    // Determine the correct notification recipient.
    let notificationRecipient = null;

    // Team Member comment → notify Project Manager
    if (req.user.role === "team_member") {
      notificationRecipient = task.project?.assignedManager;
    }

    // Project Manager comment → notify assigned Team Member
    else if (req.user.role === "project_manager") {
      notificationRecipient =
        task.assignedTo?._id || task.assignedTo;
    }

    // Create notification only when there is
    // a valid recipient and it is not the commenter.
    if (
      notificationRecipient &&
      notificationRecipient.toString() !==
        req.user.id.toString()
    ) {
      await createNotification({
        user: notificationRecipient,
        title: "New Comment",
        message: `A new comment was added to task "${task.title}".`,
        type: "new_comment",
        relatedTask: task._id,
        relatedProject:
          task.project?._id || task.project,
      });
    }

    // Return populated comment.
    const populatedComment = await Comment.findById(
      comment._id
    ).populate("user", "name email role");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Task Comments
const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;

    // Validate Task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    // Find task and required authorization information.
    const task = await Task.findById(taskId).populate(
      "project",
      "name assignedManager"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Task-level authorization
    if (!canAccessTask(task, req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to access this task discussion",
      });
    }

    // Oldest → newest
    const comments = await Comment.find({
      task: task._id,
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createComment,
  getTaskComments,
};