const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

// Create Project
const createProject = async (req, res) => {
  try {
    // Authorization: Only Admin can create a project.
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to create a project",
      });
    }

    const {
      name,
      description,
      priority,
      status,
      assignedManager,
      startDate,
      endDate,
      teamMembers,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    // Validate assigned Project Manager
    if (assignedManager) {
      const manager = await User.findById(assignedManager);

      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (manager.role !== "project_manager") {
        return res.status(400).json({
          success: false,
          message: "Selected user is not a Project Manager",
        });
      }

      const alreadyAssigned = await Project.findOne({
        assignedManager: manager._id,
      });

      if (alreadyAssigned) {
        return res.status(400).json({
          success: false,
          message:
            "This Project Manager is already assigned to another project",
        });
      }
    }

    const project = await Project.create({
      name,
      description,
      priority,
      status,
      assignedManager,
      startDate,
      endDate,
      teamMembers,
      projectManager: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Projects
// Search + Filter + Sorting + Pagination
const getProjects = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      assignedManager,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (req.user.role === "admin") {
      query = {};
    } else if (req.user.role === "project_manager") {
      query.assignedManager = req.user.id;
    } else if (req.user.role === "team_member") {
      query.teamMembers = req.user.id;
    } else {
      query.projectManager = req.user.id;
    }

    if (search) {
      query.name = {
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

    if (assignedManager) {
      if (req.user.role === "admin") {
        query.assignedManager = assignedManager;
      }
    }

    let sortOption = {};

    switch (sort) {
      case "name":
        sortOption = { name: 1 };
        break;

      case "priority":
        sortOption = { priority: 1 };
        break;

      case "startDate":
        sortOption = { startDate: 1 };
        break;

      case "endDate":
        sortOption = { endDate: 1 };
        break;

      default:
        sortOption = { createdAt: -1 };
    }

    const currentPage = Number(page);
    const perPage = Number(limit);
    const skip = (currentPage - 1) * perPage;

    const totalRecords =
      await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate("projectManager", "name email")
      .populate("assignedManager", "name email")
      .populate(
        "teamMembers",
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
      hasPreviousPage:
        currentPage > 1,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Project
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(
      req.params.id
    )
      .populate("projectManager", "name email")
      .populate("assignedManager", "name email")
      .populate(
        "teamMembers",
        "name email role"
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const isProjectManager =
      project.projectManager?._id?.toString() ===
      req.user.id;

    const isAssignedManager =
      project.assignedManager?._id?.toString() ===
      req.user.id;

    const isTeamMember =
      req.user.role === "team_member" &&
      project.teamMembers?.some(
        (member) =>
          member._id?.toString() ===
          req.user.id
      );

    if (
      !isAdmin &&
      !isProjectManager &&
      !isAssignedManager &&
      !isTeamMember
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this project",
      });
    }

    const tasks = await Task.find({
      project: project._id,
    })
      .populate(
        "assignedTo",
        "name email role"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      project,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const isAssignedManager =
      project.assignedManager?.toString() ===
      req.user.id;

    if (
      !isAdmin &&
      !isAssignedManager
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this project",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "priority",
      "status",
      "assignedManager",
      "startDate",
      "endDate",
      "teamMembers",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updatedProject =
      await Project.findByIdAndUpdate(
        req.params.id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

    res.status(200).json({
      success: true,
      message:
        "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Assign Project Manager
const assignProjectManager = async (
  req,
  res
) => {
  try {
    const { managerId } = req.body;

    const manager =
      await User.findById(managerId);

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      manager.role !== "project_manager"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected user is not a Project Manager",
      });
    }

    const alreadyAssigned =
      await Project.findOne({
        assignedManager: manager._id,
        _id: { $ne: req.params.id },
      });

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message:
          "This Project Manager is already assigned to another project",
      });
    }

    const project =
      await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.assignedManager =
      manager._id;

    await project.save();

    res.status(200).json({
      success: true,
      message:
        "Project Manager assigned successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Manage Team Members
const manageTeamMembers = async (
  req,
  res
) => {
  try {
    const { memberIds } = req.body;

    const project =
      await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const isAssignedManager =
      project.assignedManager?.toString() ===
      req.user.id;

    if (
      !isAdmin &&
      !isAssignedManager
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this project's team members",
      });
    }

    if (
      !Array.isArray(memberIds) ||
      memberIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "memberIds must be a non-empty array",
      });
    }

    for (const memberId of memberIds) {
      const user =
        await User.findById(memberId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User not found: ${memberId}`,
        });
      }

      if (
        user.role !== "team_member"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${user.name} is not a Team Member`,
        });
      }

      if (
        !project.teamMembers.includes(
          memberId
        )
      ) {
        project.teamMembers.push(
          memberId
        );
      }
    }

    await project.save();

    res.status(200).json({
      success: true,
      message:
        "Team members updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove Team Member
const removeTeamMember = async (
  req,
  res
) => {
  try {
    const { memberId } = req.body;

    const project =
      await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const isAssignedManager =
      project.assignedManager?.toString() ===
      req.user.id;

    if (
      !isAdmin &&
      !isAssignedManager
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to manage this project's team members",
      });
    }

    const memberExists =
      project.teamMembers.some(
        (id) =>
          id.toString() === memberId
      );

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message:
          "This member is not part of the project's team",
      });
    }

    project.teamMembers =
      project.teamMembers.filter(
        (id) =>
          id.toString() !== memberId
      );

    await project.save();

    res.status(200).json({
      success: true,
      message:
        "Team member removed successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Project
const deleteProject = async (
  req,
  res
) => {
  try {
    const project =
      await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const isProjectManager =
      project.projectManager?.toString() ===
      req.user.id;

    if (
      !isAdmin &&
      !isProjectManager
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to delete this project",
      });
    }

    await Project.findByIdAndDelete(
      req.params.id
    );

    // Cascade delete project tasks
    await Task.deleteMany({
      project: project._id,
    });

    res.status(200).json({
      success: true,
      message:
        "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Assigned Projects
const getAssignedProjects = async (
  req,
  res
) => {
  try {
    const projects = await Project.find({
      assignedManager: req.user.id,
    })
      .populate(
        "projectManager",
        "name email"
      )
      .populate(
        "assignedManager",
        "name email"
      )
      .populate(
        "teamMembers",
        "name email role"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Project Workspace
const getProjectWorkspace = async (
  req,
  res
) => {
  try {
    const project =
      await Project.findById(req.params.id)
        .populate(
          "projectManager",
          "name email"
        )
        .populate(
          "assignedManager",
          "name email"
        )
        .populate(
          "teamMembers",
          "name email role"
        );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const isProjectManager =
      project.projectManager?._id?.toString() ===
      req.user.id;

    const isAssignedManager =
      project.assignedManager?._id?.toString() ===
      req.user.id;

    const isTeamMember =
      req.user.role === "team_member" &&
      project.teamMembers?.some(
        (member) =>
          member._id?.toString() ===
          req.user.id
      );

    if (
      !isAdmin &&
      !isProjectManager &&
      !isAssignedManager &&
      !isTeamMember
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this project workspace",
      });
    }

    const tasks = await Task.find({
      project: project._id,
    })
      .populate(
        "assignedTo",
        "name email role"
      )
      .sort({ createdAt: -1 });

    const totalTasks = tasks.length;

    const completedTasks =
      tasks.filter(
        (task) =>
          task.status === "completed"
      ).length;

    const inProgressTasks =
      tasks.filter(
        (task) =>
          task.status === "in_progress"
      ).length;

    // Review Tasks
    const reviewTasks =
      tasks.filter(
        (task) =>
          task.status === "review"
      ).length;

    // Pending Tasks
    const pendingTasks =
      tasks.filter(
        (task) =>
          task.status === "todo"
      ).length;

    res.status(200).json({
      success: true,
      project,
      tasks,
      statistics: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        reviewTasks,
        pendingTasks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Project Manager Dashboard Stats
const getProjectManagerStats = async (
  req,
  res
) => {
  try {
    // Get projects assigned to the logged-in Project Manager
    const assignedProjects = await Project.find({
      assignedManager: req.user.id,
    }).select("_id status");

    const projectIds = assignedProjects.map(
      (project) => project._id
    );

    const totalProjects =
      assignedProjects.length;

    const activeProjects =
      assignedProjects.filter(
        (project) =>
          project.status === "active"
      ).length;

    const completedProjects =
      assignedProjects.filter(
        (project) =>
          project.status === "completed"
      ).length;

    // Count all tasks belonging to the PM's assigned projects
    const totalTasks =
      await Task.countDocuments({
        project: { $in: projectIds },
      });

    // Count completed tasks belonging to the PM's assigned projects
    const completedTasks =
      await Task.countDocuments({
        project: { $in: projectIds },
        status: "completed",
      });

    res.status(200).json({
      success: true,
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
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
};