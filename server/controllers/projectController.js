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

    // If an assignedManager is provided at creation time, validate it
    // the same way assignProjectManager() does: must exist, must have
    // the project_manager role, and must not already be assigned to
    // another project.
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
          message: "This Project Manager is already assigned to another project",
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

// Get All Projects (Search + Filter + Sorting + Pagination)
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

    // Role-based base query:
    // - Admin: can see every project
    // - Project Manager: sees projects assigned to them
    // - Otherwise (project creator): sees projects they created
    let query = {};

    if (req.user.role === "admin") {
      query = {};
    } else if (req.user.role === "project_manager") {
      query.assignedManager = req.user.id;
    } else {
      query.projectManager = req.user.id;
    }

    if (search) {
      query.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedManager) query.assignedManager = assignedManager;

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

    const totalRecords = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate("projectManager", "name email")
      .populate("assignedManager", "name email")
      .populate("teamMembers", "name email role")
      .sort(sortOption)
      .skip(skip)
      .limit(perPage);

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage,
      totalPages: Math.ceil(totalRecords / perPage),
      hasNextPage: currentPage * perPage < totalRecords,
      hasPreviousPage: currentPage > 1,
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
    // Fetch by ID first so we can authorize based on role
    // (Admin / assignedManager / projectManager).
    const project = await Project.findById(req.params.id)
      .populate("projectManager", "name email")
      .populate("assignedManager", "name email")
      .populate("teamMembers", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: Admin can view any project. The creator
    // (projectManager) and the assigned Project Manager can also view it.
    const isAdmin = req.user.role === "admin";
    const isProjectManager =
      project.projectManager?._id?.toString() === req.user.id;
    const isAssignedManager =
      project.assignedManager?._id?.toString() === req.user.id;

    if (!isAdmin && !isProjectManager && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this project",
      });
    }

    res.status(200).json({
      success: true,
      project,
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
    // Fetch the project first so we can authorize based on role
    // (Admin / assignedManager / projectManager) before updating.
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: Only Admin can update a project.
    const isAdmin = req.user.role === "admin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this project",
      });
    }

    // Whitelist: only these fields may be updated. This prevents
    // unexpected/protected fields from being overwritten via req.body.
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

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
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
const assignProjectManager = async (req, res) => {
  try {
    const { managerId } = req.body;

    const manager = await User.findById(managerId);

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

    // Ensure this manager is not already the assigned manager of
    // another project (one-project-per-manager rule).
    const alreadyAssigned = await Project.findOne({
      assignedManager: manager._id,
      _id: { $ne: req.params.id },
    });

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "This Project Manager is already assigned to another project",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    project.assignedManager = manager._id;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project Manager assigned successfully",
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
const manageTeamMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: Only Admin or the Project Manager assigned to
    // THIS specific project may manage its team members (not just
    // any user with a project_manager role).
    const isAdmin = req.user.role === "admin";
    const isAssignedManager =
      project.assignedManager?.toString() === req.user.id;

    if (!isAdmin && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this project's team members",
      });
    }

    // Validate memberIds is a non-empty array before processing.
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "memberIds must be a non-empty array",
      });
    }

    for (const memberId of memberIds) {
      const user = await User.findById(memberId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User not found: ${memberId}`,
        });
      }

      if (user.role !== "team_member") {
        return res.status(400).json({
          success: false,
          message: `${user.name} is not a Team Member`,
        });
      }

      if (!project.teamMembers.includes(memberId)) {
        project.teamMembers.push(memberId);
      }
    }

    await project.save();

    res.status(200).json({
      success: true,
      message: "Team members updated successfully",
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
const removeTeamMember = async (req, res) => {
  try {
    const { memberId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: Only Admin or the Project Manager assigned to
    // THIS specific project may remove its team members.
    const isAdmin = req.user.role === "admin";
    const isAssignedManager =
      project.assignedManager?.toString() === req.user.id;

    if (!isAdmin && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this project's team members",
      });
    }

    // Ensure the member actually exists in this project's team
    // before attempting to remove them.
    const memberExists = project.teamMembers.some(
      (id) => id.toString() === memberId
    );

    if (!memberExists) {
      return res.status(404).json({
        success: false,
        message: "This member is not part of the project's team",
      });
    }

    project.teamMembers = project.teamMembers.filter(
      (id) => id.toString() !== memberId
    );

    await project.save();

    res.status(200).json({
      success: true,
      message: "Team member removed successfully",
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
const deleteProject = async (req, res) => {
  try {
    // Fetch by ID first so we can authorize based on role
    // (Admin / projectManager) before deleting.
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: Admin can delete any project. The creator
    // (projectManager) can delete their own project.
    const isAdmin = req.user.role === "admin";
    const isProjectManager =
      project.projectManager?.toString() === req.user.id;

    if (!isAdmin && !isProjectManager) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this project",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    // Cascade delete: remove all tasks belonging to this project
    // so no orphaned Task records remain.
    await Task.deleteMany({ project: project._id });

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Assigned Projects (Project Manager)
const getAssignedProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      assignedManager: req.user.id,
    })
      .populate("projectManager", "name email")
      .populate("assignedManager", "name email")
      .populate("teamMembers", "name email role")
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
const getProjectWorkspace = async (req, res) => {
  try {
    // Fetch by ID first so we can authorize based on role
    // (Admin / projectManager / assignedManager).
    const project = await Project.findById(req.params.id)
      .populate("projectManager", "name email")
      .populate("assignedManager", "name email")
      .populate("teamMembers", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Authorization: Admin can view any workspace. The creator
    // (projectManager) and the assigned Project Manager can also view it.
    const isAdmin = req.user.role === "admin";
    const isProjectManager =
      project.projectManager?._id?.toString() === req.user.id;
    const isAssignedManager =
      project.assignedManager?._id?.toString() === req.user.id;

    if (!isAdmin && !isProjectManager && !isAssignedManager) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this project workspace",
      });
    }

    const tasks = await Task.find({
      project: project._id,
    })
      .populate("assignedTo", "name email role")
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
// Project Manager Dashboard Stats
const getProjectManagerStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({
      assignedManager: req.user.id,
    });

    const activeProjects = await Project.countDocuments({
      assignedManager: req.user.id,
      status: "active",
    });

    const completedProjects = await Project.countDocuments({
      assignedManager: req.user.id,
      status: "completed",
    });

    const totalTasks = await Task.countDocuments({
      assignedTo: req.user.id,
    });

    const completedTasks = await Task.countDocuments({
      assignedTo: req.user.id,
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