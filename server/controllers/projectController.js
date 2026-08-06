const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

// Create Project
const createProject = async (req, res) => {
  try {
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

    const query = {
      projectManager: req.user.id,
    };

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
    const project = await Project.findOne({
      _id: req.params.id,
      projectManager: req.user.id,
    })
      .populate("projectManager", "name email")
      .populate("assignedManager", "name email")
      .populate("teamMembers", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
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
    const project = await Project.findOneAndUpdate(
      {
        _id: req.params.id,
        projectManager: req.user.id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
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
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      projectManager: req.user.id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

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
    const project = await Project.findOne({
      _id: req.params.id,
      assignedManager: req.user.id,
    })
      .populate("projectManager", "name email")
      .populate("assignedManager", "name email")
      .populate("teamMembers", "name email role");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
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