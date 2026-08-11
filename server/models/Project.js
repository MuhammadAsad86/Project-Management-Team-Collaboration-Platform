const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // User who created the project
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Assigned Project Manager
    assignedManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Team Members
    teamMembers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
      validate: {
        validator: function (members) {
          const ids = members.map((id) =>
            id.toString()
          );

          return ids.length === new Set(ids).size;
        },
        message:
          "A team member cannot be added more than once",
      },
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      default: "pending",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value || !this.startDate) {
            return true;
          }

          return value >= this.startDate;
        },
        message:
          "End date cannot be before start date",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model("Project", projectSchema);