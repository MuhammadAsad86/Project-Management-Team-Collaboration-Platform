const mongoose = require("mongoose");
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

    // Validate project name
    if (
      typeof name !== "string" ||
      name.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Project name must be at least 2 characters",
      });
    }

    // Validate dates
    if (
      startDate &&
      Number.isNaN(new Date(startDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (
      endDate &&
      Number.isNaN(new Date(endDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date",
      });
    }

    if (
      startDate &&
      endDate &&
      new Date(endDate) < new Date(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });
    }

    // Validate teamMembers
    if (
      teamMembers !== undefined &&
      !Array.isArray(teamMembers)
    ) {
      return res.status(400).json({
        success: false,
        message: "teamMembers must be an array",
      });
    }

    if (
      Array.isArray(teamMembers) &&
      teamMembers.some(
        (memberId) =>
          !mongoose.Types.ObjectId.isValid(memberId)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more team member IDs are invalid",
      });
    }

    // Validate assigned Project Manager
    if (assignedManager) {
      if (
        !mongoose.Types.ObjectId.isValid(
          assignedManager
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid project manager ID",
        });
      }

      const manager = await User.findById(
        assignedManager
      );

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

    // Validate that all team members actually exist
    if (
      Array.isArray(teamMembers) &&
      teamMembers.length > 0
    ) {
      const teamMemberUsers = await User.find({
        _id: { $in: teamMembers },
      }).select("_id role");

      if (
        teamMemberUsers.length !==
        new Set(teamMembers.map(String)).size
      ) {
        return res.status(404).json({
          success: false,
          message: "One or more team members were not found",
        });
      }

      const invalidTeamMembers =
        teamMemberUsers.some(
          (user) => user.role !== "team_member"
        );

      if (invalidTeamMembers) {
        return res.status(400).json({
          success: false,
          message:
            "All selected team members must have the Team Member role",
        });
      }
    }

    const project = await Project.create({
      name: name.trim(),
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

    const currentPage = Number(page);
    const perPage = Number(limit);

    // Validate pagination
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
        message: "Limit must be between 1 and 100",
      });
    }

    // Validate assigned manager filter
    if (
      assignedManager &&
      !mongoose.Types.ObjectId.isValid(
        assignedManager
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project manager ID",
      });
    }

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

    if (
      assignedManager &&
      req.user.role === "admin"
    ) {
      query.assignedManager = assignedManager;
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
    // Validate project ID
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

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
    // Validate project ID
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

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

    // Project Manager cannot change
    // the assigned Project Manager.
    if (
      req.user.role === "project_manager" &&
      req.body.assignedManager !== undefined
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Project Managers cannot change the assigned Project Manager",
      });
    }

    // Validate project name
    if (
      req.body.name !== undefined &&
      (
        typeof req.body.name !== "string" ||
        req.body.name.trim().length < 2
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Project name must be at least 2 characters",
      });
    }

    // Validate dates
    if (
      req.body.startDate !== undefined &&
      req.body.startDate !== null &&
      req.body.startDate !== "" &&
      Number.isNaN(
        new Date(req.body.startDate).getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
      });
    }

    if (
      req.body.endDate !== undefined &&
      req.body.endDate !== null &&
      req.body.endDate !== "" &&
      Number.isNaN(
        new Date(req.body.endDate).getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid end date",
      });
    }

    const finalStartDate =
      req.body.startDate !== undefined
        ? req.body.startDate
        : project.startDate;

    const finalEndDate =
      req.body.endDate !== undefined
        ? req.body.endDate
        : project.endDate;

    if (
      finalStartDate &&
      finalEndDate &&
      new Date(finalEndDate) <
        new Date(finalStartDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date",
      });
    }

    // Validate assigned Project Manager
    if (
      req.body.assignedManager !== undefined
    ) {
      if (
        !req.body.assignedManager ||
        !mongoose.Types.ObjectId.isValid(
          req.body.assignedManager
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid project manager ID",
        });
      }

      const manager = await User.findById(
        req.body.assignedManager
      );

      if (!manager) {
        return res.status(404).json({
          success: false,
          message: "Project Manager not found",
        });
      }

      if (manager.role !== "project_manager") {
        return res.status(400).json({
          success: false,
          message:
            "Selected user is not a Project Manager",
        });
      }

      const alreadyAssigned =
        await Project.findOne({
          assignedManager: manager._id,
          _id: { $ne: project._id },
        });

      if (alreadyAssigned) {
        return res.status(400).json({
          success: false,
          message:
            "This Project Manager is already assigned to another project",
        });
      }
    }

    // Validate team members
    if (
      req.body.teamMembers !== undefined
    ) {
      if (!Array.isArray(req.body.teamMembers)) {
        return res.status(400).json({
          success: false,
          message:
            "teamMembers must be an array",
        });
      }

      if (
        req.body.teamMembers.some(
          (memberId) =>
            !mongoose.Types.ObjectId.isValid(
              memberId
            )
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more team member IDs are invalid",
        });
      }

      const teamMemberUsers =
        await User.find({
          _id: {
            $in: req.body.teamMembers,
          },
        }).select("_id role");

      const requestedMemberIds =
        new Set(
          req.body.teamMembers.map(String)
        );

      if (
        teamMemberUsers.length !==
        requestedMemberIds.size
      ) {
        return res.status(404).json({
          success: false,
          message:
            "One or more team members were not found",
        });
      }

      const hasInvalidRole =
        teamMemberUsers.some(
          (user) =>
            user.role !== "team_member"
        );

      if (hasInvalidRole) {
        return res.status(400).json({
          success: false,
          message:
            "All team members must have the Team Member role",
        });
      }
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
        updates[field] =
          field === "name"
            ? req.body[field].trim()
            : req.body[field];
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
    // Validate project ID
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const { managerId } = req.body;

    if (
      !managerId ||
      !mongoose.Types.ObjectId.isValid(
        managerId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project manager ID",
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
        _id: { $ne: project._id },
      });

    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message:
          "This Project Manager is already assigned to another project",
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
    // Validate project ID
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

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

    const uniqueMemberIds = [
      ...new Set(memberIds.map(String)),
    ];

    for (const memberId of uniqueMemberIds) {
      if (
        !mongoose.Types.ObjectId.isValid(
          memberId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid team member ID: ${memberId}`,
        });
      }

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
        !project.teamMembers.some(
          (id) =>
            id.toString() === memberId
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
    // Validate project ID
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const { memberId } = req.body;

    if (
      !memberId ||
      !mongoose.Types.ObjectId.isValid(
        memberId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID",
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
    // Validate project ID
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
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
    // Validate project ID
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

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

    const reviewTasks =
      tasks.filter(
        (task) =>
          task.status === "review"
      ).length;

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