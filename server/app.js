const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/database");

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

// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

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
];

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const isAllowedVercelDomain =
        /^https:\/\/project-management-team-collaborat[a-z0-9-]*\.vercel\.app$/.test(
          origin || ""
        );

      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isAllowedVercelDomain
      ) {
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
app.get("/api/cron/check-deadlines", async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    await checkUpcomingDeadlines();

    return res.json({
      success: true,
      message: "Deadline check completed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;s