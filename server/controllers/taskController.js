const mongoose = require("mongoose");
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const createNotification = require("../utils/notificationHelper");

const allowedPriorities = [
  "low",
  "medium",
  "high",
];

const allowedStatuses = [
  "todo",
  "in_progress",
  "review",
  "completed",
];

// Create Task
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      status,
      dueDate,
    } = req.body;

    if (
      typeof title !== "string" ||
      title.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Task title must be at least 2 characters",
      });
    }

    if (!project || !assignedTo) {
      return res.status(400).json({
        success: false,
        message:
          "Project and assigned user are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned user ID",
      });
    }

    if (
      priority !== undefined &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    // New tasks must always start from todo.
    if (
      status !== undefined &&
      status !== "todo"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New tasks must start with todo status",
      });
    }

    if (
      dueDate !== undefined &&
      dueDate !== null &&
      dueDate !== "" &&
      Number.isNaN(new Date(dueDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    const projectExists = await Project.findById(project);

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isAssignedManager =
      req.user.role === "project_manager" &&
      projectExists.assignedManager?.toString() ===
        req.user.id;

    if (!isAdmin && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this project",
      });
    }

    const userExists = await User.findById(assignedTo);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      });
    }

    // Tasks can only be assigned to Team Members.
    if (userExists.role !== "team_member") {
      return res.status(400).json({
        success: false,
        message:
          "Tasks can only be assigned to Team Members",
      });
    }

    // Assigned Team Member must belong to this project.
    const isProjectTeamMember =
      projectExists.teamMembers?.some(
        (memberId) =>
          memberId.toString() === assignedTo
      );

    if (!isProjectTeamMember) {
      return res.status(400).json({
        success: false,
        message:
          "Assigned user is not a member of this project team",
      });
    }

    let task = await Task.create({
      title: title.trim(),
      description,
      project,
      assignedTo,
      createdBy: req.user.id,
      priority: priority || "medium",
      status: "todo",
      dueDate,
    });

    task = await Task.findById(task._id)
      .populate("project", "name assignedManager")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .populate("statusHistory.changedBy", "name email role");

    await createNotification({
      user: assignedTo,
      title: "New Task Assigned",
      message: `You have been assigned a new task: ${task.title}`,
      type: "task_assigned",
      relatedTask: task._id,
      relatedProject: task.project,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Tasks
const getTasks = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      assignedTo,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    if (
      !Number.isInteger(perPage) ||
      perPage < 1 ||
      perPage > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Limit must be between 1 and 100",
      });
    }

    if (
      assignedTo &&
      !mongoose.Types.ObjectId.isValid(assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned user ID",
      });
    }

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (
      priority &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    let query = {};

    if (req.user.role === "project_manager") {
      const projects = await Project.find({
        assignedManager: req.user.id,
      }).select("_id");

      query.project = {
        $in: projects.map(
          (project) => project._id
        ),
      };
    }

    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (
      assignedTo &&
      req.user.role === "admin"
    ) {
      query.assignedTo = assignedTo;
    }

    let sortOption = {};

    switch (sort) {
      case "newest":
        sortOption = {
          createdAt: -1,
        };
        break;

      case "oldest":
        sortOption = {
          createdAt: 1,
        };
        break;

      case "title_asc":
        sortOption = {
          title: 1,
        };
        break;

      case "title_desc":
        sortOption = {
          title: -1,
        };
        break;

      case "priority":
        sortOption = {
          priority: 1,
        };
        break;

      case "dueDate":
        sortOption = {
          dueDate: 1,
        };
        break;

      case "updatedAt":
        sortOption = {
          updatedAt: -1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
    }

    const skip = (currentPage - 1) * perPage;

    const totalRecords =
      await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate(
        "project",
        "name assignedManager"
      )
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "statusHistory.changedBy",
        "name email role"
      )
      .sort(sortOption)
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage,
      totalPages: Math.ceil(
        totalRecords / perPage
      ),
      hasNextPage:
        currentPage * perPage < totalRecords,
      hasPreviousPage: currentPage > 1,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Task
const getTaskById = async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(
      req.params.id
    )
      .populate(
        "project",
        "name assignedManager"
      )
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "statusHistory.changedBy",
        "name email role"
      );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isProjectManager =
      req.user.role === "project_manager" &&
      task.project?.assignedManager
        ?.toString() === req.user.id;

    const isAssignedTeamMember =
      req.user.role === "team_member" &&
      task.assignedTo?._id
        ?.toString() === req.user.id;

    if (
      !isAdmin &&
      !isProjectManager &&
      !isAssignedTeamMember
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    let task = await Task.findById(
      req.params.id
    ).populate(
      "project",
      "name assignedManager teamMembers"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isAssignedManager =
      req.user.role === "project_manager" &&
      task.project?.assignedManager
        ?.toString() === req.user.id;

    if (!isAdmin && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this task",
      });
    }

    if (
      req.body.title !== undefined &&
      (
        typeof req.body.title !== "string" ||
        req.body.title.trim().length < 2
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Task title must be at least 2 characters",
      });
    }

    if (
      req.body.assignedTo !== undefined &&
      !mongoose.Types.ObjectId.isValid(
        req.body.assignedTo
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned user ID",
      });
    }

    if (
      req.body.assignedTo !== undefined
    ) {
      const assignedUser =
        await User.findById(
          req.body.assignedTo
        );

      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: "Assigned user not found",
        });
      }

      if (
        assignedUser.role !== "team_member"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tasks can only be assigned to Team Members",
        });
      }

      const isProjectTeamMember =
        task.project?.teamMembers?.some(
          (memberId) =>
            memberId.toString() ===
            req.body.assignedTo
        );

      if (!isProjectTeamMember) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned user is not a member of this project team",
        });
      }
    }

    if (
      req.body.priority !== undefined &&
      !allowedPriorities.includes(
        req.body.priority
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    // Status must only be changed through
    // PATCH /tasks/:id/status.
    if (req.body.status !== undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Task status must be changed through the status endpoint",
      });
    }

    if (
      req.body.dueDate !== undefined &&
      req.body.dueDate !== null &&
      req.body.dueDate !== "" &&
      Number.isNaN(
        new Date(req.body.dueDate).getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "assignedTo",
      "priority",
      "dueDate",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        task[field] =
          field === "title"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    await task.save();

    task = await Task.findById(task._id)
      .populate("project", "name assignedManager")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .populate("statusHistory.changedBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findById(
      req.params.id
    ).populate(
      "project",
      "name assignedManager"
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const isAdmin = req.user.role === "admin";

    const isAssignedManager =
      req.user.role === "project_manager" &&
      task.project?.assignedManager
        ?.toString() === req.user.id;

    if (!isAdmin && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this task",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Assigned Tasks
const getAssignedTasks = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Number(page);
    const perPage = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer",
      });
    }

    if (
      !Number.isInteger(perPage) ||
      perPage < 1 ||
      perPage > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Limit must be between 1 and 100",
      });
    }

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (
      priority &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    const query = {
      assignedTo: req.user.id,
    };

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    let sortOption = {
      createdAt: -1,
    };

    switch (sort) {
      case "title":
        sortOption = {
          title: 1,
        };
        break;

      case "priority":
        sortOption = {
          priority: 1,
        };
        break;

      case "dueDate":
        sortOption = {
          dueDate: 1,
        };
        break;

      default:
        sortOption = {
          createdAt: -1,
        };
    }

    const skip = (currentPage - 1) * perPage;

    const totalRecords =
      await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate("project", "name")
      .populate(
        "assignedTo",
        "name email role"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "statusHistory.changedBy",
        "name email role"
      )
      .sort(sortOption)
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage,
      totalPages: Math.ceil(
        totalRecords / perPage
      ),
      hasNextPage:
        currentPage * perPage < totalRecords,
      hasPreviousPage: currentPage > 1,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Task Status
const updateTaskStatus = async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    let task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message:
          "Task not found or not assigned to you",
      });
    }

    const currentStatus = task.status;

    if (currentStatus === status) {
      return res.status(400).json({
        success: false,
        message:
          "Task is already in this status",
      });
    }

    const allowedTransitions = {
      todo: ["in_progress"],
      in_progress: ["review"],
      review: ["completed"],
      completed: [],
    };

    const nextStatuses =
      allowedTransitions[currentStatus] || [];

    if (!nextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid status transition from ${currentStatus} to ${status}`,
      });
    }

    task.statusHistory.push({
      from: currentStatus,
      to: status,
      changedBy: req.user.id,
      changedAt: new Date(),
    });

    task.status = status;

    await task.save();

    task = await Task.findById(task._id)
      .populate("project", "name assignedManager")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email")
      .populate("statusHistory.changedBy", "name email role");

    const project = await Project.findById(
      task.project
    ).select("assignedManager");

    const projectManagerId =
      project?.assignedManager;

    if (projectManagerId) {
      await createNotification({
        user: projectManagerId,
        title: "Task Status Updated",
        message:
          `Task "${task.title}" status changed from ${currentStatus} to ${status}.`,
        type: "task_status_updated",
        relatedTask: task._id,
        relatedProject: task.project,
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Task status updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Team Member Dashboard Stats
const getMyTaskStats = async (req, res) => {
  try {
    const totalTasks =
      await Task.countDocuments({
        assignedTo: req.user.id,
      });

    const todoTasks =
      await Task.countDocuments({
        assignedTo: req.user.id,
        status: "todo",
      });

    const inProgressTasks =
      await Task.countDocuments({
        assignedTo: req.user.id,
        status: "in_progress",
      });

    const reviewTasks =
      await Task.countDocuments({
        assignedTo: req.user.id,
        status: "review",
      });

    const completedTasks =
      await Task.countDocuments({
        assignedTo: req.user.id,
        status: "completed",
      });

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        reviewTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getAssignedTasks,
  updateTaskStatus,
  getMyTaskStats,
};