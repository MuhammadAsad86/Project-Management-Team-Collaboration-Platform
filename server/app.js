const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const errorHandler = require("./middleware/errorMiddleware");

const checkUpcomingDeadlines = require("./utils/deadlineNotification");

const app = express();

// Required for Vercel proxy and express-rate-limit
app.set("trust proxy", 1);

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication requests. Please try again later.",
  },
});

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://project-management-team-collaborati-nine.vercel.app",
];

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(helmet());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// API Routes
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/tasks", commentRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/users", userRoutes);

app.use("/api/notifications", notificationRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Project Management API is running...",
  });
});

// Deadline notification checker
// Run once when server starts
checkUpcomingDeadlines();

// Run every hour
setInterval(() => {
  checkUpcomingDeadlines();
}, 60 * 60 * 1000);

// Global Error Handler
app.use(errorHandler);

module.exports = app;