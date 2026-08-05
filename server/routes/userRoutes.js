const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserRole,
} = require("../controllers/userController");


// Create User
router.post(
  "/",
  protect,
  authorize("admin"),
  createUser
);


// Get All Users
// Admin + Project Manager + Team Member can view users
router.get(
  "/",
  protect,
  getUsers
);


// Get Single User
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getUserById
);


// Update User
router.put(
  "/:id",
  protect,
  authorize("admin"),
  updateUser
);


// Delete User
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);


// Change User Role
router.patch(
  "/:id/role",
  protect,
  authorize("admin"),
  changeUserRole
);


module.exports = router;