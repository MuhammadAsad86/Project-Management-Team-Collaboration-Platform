const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const createNotification = require("../utils/notificationHelper");

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

    if (!title || !project || !assignedTo) {
      return res.status(400).json({
        success: false,
        message:
          "Title, project and assigned user are required",
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

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user.id,
      priority,
      status,
      dueDate,
    });

    // Notify assigned Team Member
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
// Admin + Project Manager only
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

    let query = {};

    // Project Manager only sees tasks
    // belonging to their assigned projects.
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

    // Search by task title OR description
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

    // Only Admin can arbitrarily filter
    // by assignedTo.
    if (
      assignedTo &&
      req.user.role === "admin"
    ) {
      query.assignedTo = assignedTo;
    }

    // Sorting
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

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const totalRecords = await Task.countDocuments(query);

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
// Admin + assigned Project Manager
const updateTask = async (req, res) => {
  try {
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
          "You are not authorized to update this task",
      });
    }

    // Status MUST NOT be changed through
    // the normal PUT endpoint.
    // Status changes must use:
    // PATCH /tasks/:id/status

    const allowedFields = [
      "title",
      "description",
      "assignedTo",
      "priority",
      "dueDate",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    }

    await task.save();

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
// Admin + assigned Project Manager
const deleteTask = async (req, res) => {
  try {
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
// Team Member only
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

    const currentPage = Number(page);
    const perPage = Number(limit);
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
// Assigned Team Member only
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "todo",
      "in_progress",
      "review",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const task = await Task.findOne({
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

    // Prevent same status update
    if (currentStatus === status) {
      return res.status(400).json({
        success: false,
        message:
          "Task is already in this status",
      });
    }

    // Allowed workflow transitions
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

    // Save status history
    task.statusHistory.push({
      from: currentStatus,
      to: status,
      changedBy: req.user.id,
      changedAt: new Date(),
    });

    // Update current status
    task.status = status;

    await task.save();

    // Find the Project Manager responsible
    // for this project.
    const project = await Project.findById(
      task.project
    ).select("assignedManager");

    const projectManagerId =
      project?.assignedManager;

    // Notify the Project Manager
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