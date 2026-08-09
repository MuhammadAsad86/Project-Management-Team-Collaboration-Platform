const Task = require("../models/Task");
const createNotification = require("./notificationHelper");

const checkUpcomingDeadlines = async () => {
  try {
    const now = new Date();

    // Check tasks whose deadline is within the next 24 hours
    const next24Hours = new Date(
      now.getTime() + 24 * 60 * 60 * 1000
    );

    const tasks = await Task.find({
      dueDate: {
        $gt: now,
        $lte: next24Hours,
      },
      status: {
        $ne: "completed",
      },
    }).populate("project", "name assignedManager");

    for (const task of tasks) {
      if (!task.assignedTo) {
        continue;
      }

      // Prevent duplicate deadline notifications.
      const Notification = require("../models/Notification");

      const alreadyNotified =
        await Notification.findOne({
          user: task.assignedTo,
          relatedTask: task._id,
          type: "deadline_approaching",
        });

      if (alreadyNotified) {
        continue;
      }

      await createNotification({
        user: task.assignedTo,
        title: "Deadline Approaching",
        message: `Task "${task.title}" is due within the next 24 hours.`,
        type: "deadline_approaching",
        relatedTask: task._id,
        relatedProject:
          task.project?._id || task.project,
      });
    }

    console.log(
      `Deadline check completed. ${tasks.length} upcoming task(s) found.`
    );
  } catch (error) {
    console.error(
      "Deadline notification check error:",
      error.message
    );
  }
};

module.exports = checkUpcomingDeadlines;