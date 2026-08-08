const mongoose = require("mongoose");

const taskStatusHistorySchema = new mongoose.Schema(
  {
    from: {
      type: String,
      enum: [
        "todo",
        "in_progress",
        "review",
        "completed",
      ],
      required: true,
    },

    to: {
      type: String,
      enum: [
        "todo",
        "in_progress",
        "review",
        "completed",
      ],
      required: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "todo",
        "in_progress",
        "review",
        "completed",
      ],
      default: "todo",
    },

    statusHistory: {
      type: [taskStatusHistorySchema],
      default: [],
    },

    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);