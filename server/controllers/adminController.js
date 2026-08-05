const User = require("../models/User");
const Project = require("../models/Project");

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalProjects = await Project.countDocuments();

    const activeProjects = await Project.countDocuments({
      status: "active",
    });

    const pendingProjects = await Project.countDocuments({
      status: "pending",
    });

    const completedProjects = await Project.countDocuments({
      status: "completed",
    });

    const totalProjectManagers = await User.countDocuments({
      role: "project_manager",
    });

    const totalTeamMembers = await User.countDocuments({
      role: "team_member",
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProjects,
        activeProjects,
        pendingProjects,
        completedProjects,
        totalProjectManagers,
        totalTeamMembers,
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
  getDashboardStats,
};