const Notification = require("../models/Notification");

const createNotification = async ({
  user,
  title,
  message,
  type,
  relatedTask = null,
  relatedProject = null,
}) => {
  try {
    if (!user) {
      return null;
    }

    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      relatedTask,
      relatedProject,
    });

    return notification;
  } catch (error) {
    console.error(
      "Notification creation error:",
      error.message
    );

    return null;
  }
};

module.exports = createNotification;