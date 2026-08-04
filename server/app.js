const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const authorize = require("./middleware/roleMiddleware");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Project Management API is running...",
  });
});

// Temporary RBAC Test Route
app.get(
  "/api/admin/test",
  protect,
  authorize("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin route working.",
    });
  }
);

module.exports = app;