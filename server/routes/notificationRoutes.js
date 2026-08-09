const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

// Get logged-in user's notifications
router.get(
  "/",
  protect,
  getMyNotifications
);

// Mark all notifications as read
router.patch(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

// Mark notification as read
router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

module.exports = router;