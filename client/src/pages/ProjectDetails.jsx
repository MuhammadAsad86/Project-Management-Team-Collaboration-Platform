import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getProjectById,
  getProjectWorkspace,
  addProjectMember,
  removeProjectMember,
} from "../services/projectService";

import {
  getTaskComments,
  addTaskComment,
  deleteTaskComment,
} from "../services/taskService";

import { getUsers } from "../services/userService";
import toast from "react-hot-toast";

import {
  FiFolder,
  FiUser,
  FiCheckSquare,
  FiUsers,
  FiMessageSquare,
  FiTrendingUp,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiX,
  FiSend,
  FiBarChart2,
} from "react-icons/fi";

const ProjectDetails = () => {
  const { id } = useParams();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [removingMember, setRemovingMember] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  // Discussion states
  const [discussionTask, setDiscussionTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(id);

        setProject(data.project);
        setTasks(data.tasks || []);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
          "Failed to load project"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
    fetchWorkspace();
  }, [id]);

  const fetchWorkspace = async () => {
    try {
      const data = await getProjectWorkspace(id);
      setWorkspace(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to load workspace"
      );
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await getUsers({
        role: "team_member",
      });

      const assignedIds =
        project?.teamMembers?.map(
          (member) => member._id
        ) || [];

      const availableUsers = (
        data.users || []
      ).filter(
        (user) =>
          !assignedIds.includes(user._id)
      );

      setUsers(availableUsers);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to load users"
      );
    }
  };

  const handleRemoveMember = async (memberId) => {
    setRemovingMember(memberId);

    try {
      await removeProjectMember(
        id,
        memberId
      );

      toast.success(
        "Member removed successfully"
      );

      const data = await getProjectById(id);

      setProject(data.project);
      setTasks(data.tasks || []);

      fetchWorkspace();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to remove member"
      );
    } finally {
      setRemovingMember(null);
    }
  };

  const fetchTaskComments = async (taskId) => {
    if (!taskId) return;

    setCommentsLoading(true);

    try {
      const data = await getTaskComments(taskId);
      setComments(data.comments || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to load comments"
      );

      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!discussionTask) {
      toast.error("Please select a task");
      return;
    }

    if (!commentMessage.trim()) {
      toast.error(
        "Comment message is required"
      );
      return;
    }

    if (
      commentMessage.trim().length > 1000
    ) {
      toast.error(
        "Comment cannot exceed 1000 characters"
      );
      return;
    }

    setCommentSubmitting(true);

    try {
      const data = await addTaskComment(
        discussionTask._id,
        commentMessage.trim()
      );

      toast.success(
        data.message ||
        "Comment added successfully"
      );

      setCommentMessage("");

      await fetchTaskComments(
        discussionTask._id
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to add comment"
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) {
      toast.error("Invalid comment");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const data = await deleteTaskComment(commentId);

      toast.success(
        data.message ||
        "Comment deleted successfully"
      );

      if (discussionTask?._id) {
        await fetchTaskComments(
          discussionTask._id
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to delete comment"
      );
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      user.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <div className="flex flex-col items-center" style={{ gap: "12px" }}>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-600" />
          <p className="text-xs font-medium text-slate-500">
            Loading project workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full rounded-2xl border border-red-200/80 bg-red-50/50 p-6 text-center">
        <p className="text-sm font-semibold text-red-600">
          Project not found.
        </p>
      </div>
    );
  }

  const totalTasks = workspace?.statistics?.totalTasks ?? 0;
  const completedTasks = workspace?.statistics?.completedTasks ?? 0;
  const inProgressTasks = workspace?.statistics?.inProgressTasks ?? 0;
  const reviewTasks = workspace?.statistics?.reviewTasks ?? 0;
  const pendingTasks = workspace?.statistics?.pendingTasks ?? 0;

  const progressPercentage =
    totalTasks === 0
      ? 0
      : Math.round(
        (completedTasks / totalTasks) * 100
      );

  // Helper for Status Badge Styling
  const renderStatusBadge = (status = "") => {
    const formatted = status.replaceAll("_", " ");
    switch (status?.toLowerCase()) {
      case "completed":
        return <span className="nf-badge nf-badge-success">{formatted}</span>;
      case "active":
      case "in_progress":
        return <span className="nf-badge nf-badge-primary">{formatted}</span>;
      case "pending":
      case "planning":
        return <span className="nf-badge nf-badge-warning">{formatted}</span>;
      case "cancelled":
      case "on_hold":
        return <span className="nf-badge nf-badge-danger">{formatted}</span>;
      default:
        return (
          <span className="nf-badge nf-badge-neutral capitalize">
            {formatted || "Draft"}
          </span>
        );
    }
  };

  // Helper for Priority Badge Styling
  const renderPriorityBadge = (priority = "") => {
    switch (priority?.toLowerCase()) {
      case "high":
      case "urgent":
        return <span className="nf-badge nf-badge-danger">High</span>;
      case "medium":
        return <span className="nf-badge nf-badge-warning">Medium</span>;
      case "low":
        return <span className="nf-badge nf-badge-info">Low</span>;
      default:
        return (
          <span className="nf-badge nf-badge-neutral capitalize">
            {priority || "Normal"}
          </span>
        );
    }
  };

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // SVG Multi-color Donut Chart Calculations
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  
  const completedFraction = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const completedLength = circumference * completedFraction;

  const inProgressFraction = totalTasks > 0 ? inProgressTasks / totalTasks : 0;
  const inProgressLength = circumference * inProgressFraction;
  const inProgressOffset = -completedLength;

  const reviewFraction = totalTasks > 0 ? reviewTasks / totalTasks : 0;
  const reviewLength = circumference * reviewFraction;
  const reviewOffset = -(completedLength + inProgressLength);

  const pendingFraction = totalTasks > 0 ? pendingTasks / totalTasks : 0;
  const pendingLength = circumference * pendingFraction;
  const pendingOffset = -(completedLength + inProgressLength + reviewLength);

  return (
    <div className="nf-page-enter flex w-full flex-col" style={{ gap: "24px" }}>
      {/* 1. PROJECT HEADER */}
      <div
        className="nf-depth-soft relative flex w-full flex-col justify-between rounded-2xl border border-white/80 bg-gradient-to-r from-white via-slate-50/80 to-indigo-50/30 shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "18px 20px", gap: "16px" }}
      >
        <div className="flex flex-col" style={{ gap: "6px", minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span
              className="inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-50 text-xs font-semibold text-indigo-700"
              style={{ padding: "4px 12px", gap: "6px", whiteSpace: "nowrap" }}
            >
              <FiFolder className="h-3.5 w-3.5 shrink-0" />
              Project Workspace
            </span>
          </div>
          <h1
            className="truncate text-xl font-bold text-slate-900 sm:text-2xl"
            style={{ margin: 0 }}
          >
            {project.name}
          </h1>
          <p
            className="line-clamp-2 text-xs font-medium text-slate-500 sm:text-sm"
            style={{ margin: 0 }}
          >
            {project.description || "No description provided."}
          </p>
        </div>

        <div className="flex shrink-0 items-center flex-wrap" style={{ gap: "8px" }}>
          {renderStatusBadge(project.status)}
          {renderPriorityBadge(project.priority)}
        </div>
      </div>

      {/* 2. WORKSPACE TABS NAVIGATION */}
      <div 
        className="flex w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        style={{ padding: "12px 16px", gap: "8px" }}
      >
        {[
          { id: "overview", label: "Overview", icon: FiFolder },
          { id: "tasks", label: "Tasks", icon: FiCheckSquare },
          { id: "members", label: "Members", icon: FiUsers },
          { id: "discussion", label: "Discussion", icon: FiMessageSquare },
          { id: "progress", label: "Progress", icon: FiTrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "border border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100"
              }`}
              style={{ padding: "8px 16px", gap: "8px", whiteSpace: "nowrap" }}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* --- OVERVIEW TAB --- */}
      {activeTab === "overview" && (
        <div className="flex flex-col" style={{ gap: "20px" }}>
          <div
            className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            style={{ padding: "24px", gap: "20px" }}
          >
            <h2 className="text-base font-bold text-slate-900 sm:text-lg" style={{ margin: 0, marginBottom: "16px" }}>
              Project Information Summary
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div
                className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/60"
                style={{ padding: "14px 16px", gap: "4px" }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </span>
                <span className="text-sm font-bold text-slate-800 capitalize">
                  {project.status}
                </span>
              </div>

              <div
                className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/60"
                style={{ padding: "14px 16px", gap: "4px" }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Priority
                </span>
                <span className="text-sm font-bold text-slate-800 capitalize">
                  {project.priority}
                </span>
              </div>

              <div
                className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/60"
                style={{ padding: "14px 16px", gap: "4px" }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Project Manager
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <FiUser className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">
                    {project.assignedManager?.name ||
                      project.projectManager?.name ||
                      "Not Assigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
            style={{ padding: "24px" }}
          >
            <h2 className="text-base font-bold text-slate-900 sm:text-lg" style={{ margin: 0, marginBottom: "16px" }}>
              Workspace Statistics
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ margin: 0 }}>
                  Total Tasks
                </p>
                <p className="text-2xl font-black text-slate-900" style={{ margin: "4px 0 0" }}>
                  {totalTasks}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600" style={{ margin: 0 }}>
                  Completed
                </p>
                <p className="text-2xl font-black text-emerald-700" style={{ margin: "4px 0 0" }}>
                  {completedTasks}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600" style={{ margin: 0 }}>
                  In Progress
                </p>
                <p className="text-2xl font-black text-indigo-700" style={{ margin: "4px 0 0" }}>
                  {inProgressTasks}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-purple-100 bg-purple-50/40 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600" style={{ margin: 0 }}>
                  Review
                </p>
                <p className="text-2xl font-black text-purple-700" style={{ margin: "4px 0 0" }}>
                  {reviewTasks}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center rounded-xl border border-amber-100 bg-amber-50/40 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600" style={{ margin: 0 }}>
                  Pending
                </p>
                <p className="text-2xl font-black text-amber-700" style={{ margin: "4px 0 0" }}>
                  {pendingTasks}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TASKS TAB --- */}
      {activeTab === "tasks" && (
        <div
          className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "24px" }}
        >
          <div className="flex items-center justify-between border-b border-slate-100" style={{ paddingBottom: "16px", marginBottom: "20px" }}>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg" style={{ margin: 0 }}>
              Project Deliverable Tasks
            </h2>
            <span className="nf-badge nf-badge-primary">
              {tasks.length} Assigned
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: "40px 20px" }}>
              <FiCheckSquare className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700" style={{ margin: 0 }}>No tasks found</p>
              <p className="text-xs text-slate-400 mt-1">There are no tasks linked to this project yet.</p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: "16px" }}>
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:border-indigo-200 hover:shadow-sm sm:flex-row sm:items-center"
                  style={{ padding: "18px 20px", gap: "16px" }}
                >
                  <div className="min-w-0 flex-1 flex flex-col" style={{ gap: "6px" }}>
                    <h3 className="text-sm font-bold text-slate-900 truncate" style={{ margin: 0 }}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate" style={{ margin: 0 }}>
                      {task.description || "No description provided"}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {renderStatusBadge(task.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- MEMBERS TAB --- */}
      {activeTab === "members" && (
        <div
          className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "24px" }}
        >
          <div className="flex items-center justify-between border-b border-slate-100" style={{ paddingBottom: "16px", marginBottom: "20px" }}>
            <div className="flex flex-col" style={{ gap: "4px", minWidth: 0 }}>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg" style={{ margin: 0 }}>
                Project Team Members
              </h2>
              <p className="text-xs text-slate-500" style={{ margin: 0 }}>
                Manage team access and collaborative permissions.
              </p>
            </div>

            {user?.role !== "team_member" && (
              <button
                type="button"
                onClick={() => {
                  setShowMemberModal(true);
                  fetchUsers();
                }}
                className="flex items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 shrink-0"
                style={{ padding: "8px 16px", gap: "6px" }}
              >
                <FiPlus className="h-3.5 w-3.5 shrink-0" />
                <span>Add Member</span>
              </button>
            )}
          </div>

          {project.teamMembers?.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center" style={{ padding: "40px 20px" }}>
              <FiUsers className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700" style={{ margin: 0 }}>No team members assigned</p>
              <p className="text-xs text-slate-400 mt-1">
                {user?.role !== "team_member" ? "Click the button above to assign users to this project." : "No team members are currently assigned."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col" style={{ gap: "16px" }}>
              {project.teamMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-2xs"
                  style={{ gap: "16px" }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                      style={{
                        background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                      }}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div className="flex flex-col min-w-0" style={{ gap: "2px" }}>
                      <span className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                        {member.name}
                      </span>
                      <span className="truncate text-xs text-slate-500 font-medium">
                        {member.email}
                      </span>
                    </div>
                  </div>

                  {user?.role !== "team_member" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={removingMember === member._id}
                      className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50"
                      style={{ padding: "8px 16px", gap: "6px" }}
                    >
                      <FiTrash2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{removingMember === member._id ? "Removing..." : "Remove"}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- DISCUSSION TAB --- */}
      {activeTab === "discussion" && (
        <div
          className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "24px" }}
        >
          <h2 className="text-base font-bold text-slate-900 sm:text-lg" style={{ margin: 0, marginBottom: "20px" }}>
            Task Discussion & Comments
          </h2>

          {(() => {
            const discussionTasks =
              user?.role === "team_member"
                ? tasks.filter(
                    (task) =>
                      task.assignedTo?._id === user.id ||
                      task.assignedTo === user.id
                  )
                : tasks;

            return discussionTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center" style={{ padding: "40px 20px" }}>
                <FiMessageSquare className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700" style={{ margin: 0 }}>No tasks available for discussion</p>
                <p className="text-xs text-slate-400 mt-1">You must have assigned tasks to view discussions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: "24px" }}>
                {/* Task Select Column */}
                <div className="flex flex-col" style={{ gap: "10px" }}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400" style={{ margin: "0 0 4px 0" }}>
                    Select Task
                  </p>
                  <div className="flex flex-col max-h-[420px] overflow-y-auto pr-1" style={{ gap: "12px" }}>
                    {discussionTasks.map((task) => (
                      <button
                        key={task._id}
                        type="button"
                        onClick={() => {
                          setDiscussionTask(task);
                          setComments([]);
                          setCommentMessage("");
                          fetchTaskComments(task._id);
                        }}
                        className={`flex flex-col rounded-xl border text-left transition-all ${
                          discussionTask?._id === task._id
                            ? "border-indigo-500 bg-indigo-50/50 shadow-xs"
                            : "border-slate-200/80 bg-white hover:bg-slate-50"
                        }`}
                        style={{ padding: "14px 16px", gap: "8px" }}
                      >
                        <span className="text-xs font-bold text-slate-900 truncate" style={{ margin: 0 }}>
                          {task.title}
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500 truncate max-w-[130px]" style={{ margin: 0 }}>
                            {task.description || "No description"}
                          </span>
                          {renderStatusBadge(task.status)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Task Comments Column */}
                <div 
                  className="lg:col-span-2 flex flex-col rounded-2xl border border-slate-200/80 bg-slate-50/40" 
                  style={{ padding: "24px", gap: "20px" }}
                >
                  {!discussionTask ? (
                    <div className="flex flex-col items-center justify-center text-center py-20">
                      <p className="text-xs font-medium text-slate-400">
                        Select a task from the list to view and post discussion comments.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="border-b border-slate-200" style={{ paddingBottom: "12px" }}>
                        <h3 className="text-sm font-bold text-slate-900" style={{ margin: 0 }}>
                          {discussionTask.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5" style={{ margin: 0 }}>
                          Active Discussion thread
                        </p>
                      </div>

                      <div className="flex flex-col space-y-3 max-h-[260px] overflow-y-auto pr-1">
                        {commentsLoading ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            Loading comments...
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="text-center py-6 text-xs text-slate-400">
                            No comments yet. Start the conversation below!
                          </div>
                        ) : (
                          comments.map((comment) => (
                            <div
                              key={comment._id}
                              className="rounded-xl border border-slate-200 bg-white shadow-2xs"
                              style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800">
                                    {comment.user?.name || "Unknown User"}
                                  </span>
                                  <span className="text-[10px] font-semibold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                    {comment.user?.role?.replace("_", " ") || "Member"}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                              </div>

                              <p className="text-xs text-slate-700 leading-relaxed" style={{ margin: "4px 0 0" }}>
                                {comment.message}
                              </p>

                              {comment.user?._id === user?.id && (
                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700"
                                  >
                                    <FiTrash2 className="h-3 w-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div 
                        className="border-t border-slate-200" 
                        style={{ paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}
                      >
                        <textarea
                          value={commentMessage}
                          onChange={(e) => setCommentMessage(e.target.value)}
                          placeholder="Write your comment..."
                          maxLength={1000}
                          rows={3}
                          className="w-full rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                          style={{ padding: "14px 16px" }}
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {commentMessage.length}/1000 chars
                          </span>

                          <button
                            type="button"
                            onClick={handleAddComment}
                            disabled={commentSubmitting || !commentMessage.trim()}
                            className="flex items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ padding: "9px 18px", gap: "6px" }}
                          >
                            <FiSend className="h-3.5 w-3.5 shrink-0" />
                            <span>{commentSubmitting ? "Posting..." : "Post Comment"}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* --- PROGRESS TAB --- */}
      {activeTab === "progress" && (
        <div
          className="rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "24px", gap: "20px" }}
        >
          <div className="flex items-center border-b border-slate-100 pb-4 mb-6" style={{ gap: "12px" }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FiBarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg" style={{ margin: 0 }}>
                Project Lifecycle & Progress Breakdown
              </h2>
              <p className="text-xs text-slate-500" style={{ margin: 0 }}>
                Real-time task completion analytics and metrics
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 items-center">
            {/* Left: Multi-color Segmented Donut Chart */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
              <div className="relative flex items-center justify-center">
                <svg className="h-40 w-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="16"
                    className="text-slate-200"
                    fill="transparent"
                  />
                  {completedTasks > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#10B981"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${completedLength} ${circumference}`}
                    />
                  )}
                  {inProgressTasks > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#4F46E5"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${inProgressLength} ${circumference}`}
                      strokeDashoffset={inProgressOffset}
                    />
                  )}
                  {reviewTasks > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#7C3AED"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${reviewLength} ${circumference}`}
                      strokeDashoffset={reviewOffset}
                    />
                  )}
                  {pendingTasks > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#F59E0B"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${pendingLength} ${circumference}`}
                      strokeDashoffset={pendingOffset}
                    />
                  )}
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900">{progressPercentage}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed</span>
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-600" style={{ margin: "20px 0 0 0" }}>
                {completedTasks} of {totalTasks} Tasks Finished
              </p>
            </div>

            {/* Right: Metric Breakdown Cards */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ margin: 0 }}>
                  Total Tasks
                </p>
                <p className="text-2xl font-black text-slate-900" style={{ margin: "4px 0 0" }}>
                  {totalTasks}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600" style={{ margin: 0 }}>
                  Completed
                </p>
                <p className="text-2xl font-black text-emerald-700" style={{ margin: "4px 0 0" }}>
                  {completedTasks}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600" style={{ margin: 0 }}>
                  In Progress
                </p>
                <p className="text-2xl font-black text-indigo-700" style={{ margin: "4px 0 0" }}>
                  {inProgressTasks}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center rounded-xl border border-purple-100 bg-purple-50/40 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600" style={{ margin: 0 }}>
                  Review
                </p>
                <p className="text-2xl font-black text-purple-700" style={{ margin: "4px 0 0" }}>
                  {reviewTasks}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/70 p-5" style={{ gap: "12px" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center" style={{ gap: "8px" }}>
                <FiBarChart2 className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700">Overall Completion Progress Bar</span>
              </div>
              <span className="text-xs font-extrabold text-indigo-600">{progressPercentage}%</span>
            </div>

            <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-200/80 p-0.5 shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${progressPercentage}%`,
                  background: "linear-gradient(90deg, #4F46E5, #7C3AED, #06B6D4, #10B981)",
                  boxShadow: "0 2px 8px rgba(79, 70, 229, 0.4)"
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- ADD MEMBER MODAL --- */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900" style={{ margin: 0 }}>
                Add Team Member
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowMemberModal(false);
                  setSelectedMember(null);
                  setSearch("");
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mb-4">
              <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
              />
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
              {users.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  No assignable team members found.
                </p>
              ) : filteredUsers.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">
                  No matching members found.
                </p>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedMember?._id === user._id;

                  return (
                    <div
                      key={user._id}
                      className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/30"
                          : "border-slate-200/80 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-800 truncate" style={{ margin: 0 }}>
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5" style={{ margin: 0 }}>
                          {user.email}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedMember(user)}
                        className={`rounded-xl text-xs font-semibold shadow-2xs transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                        style={{ padding: "6px 12px", whiteSpace: "nowrap" }}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {selectedMember && (
              <p className="mt-3 text-xs font-semibold text-indigo-600">
                Selected: {selectedMember.name}
              </p>
            )}

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowMemberModal(false);
                  setSelectedMember(null);
                  setSearch("");
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (!selectedMember) {
                    toast.error("Please select a member");
                    return;
                  }

                  setAddingMember(true);

                  try {
                    await addProjectMember(
                      id,
                      selectedMember._id
                    );

                    toast.success(
                      `${selectedMember.name} added successfully`
                    );

                    setShowMemberModal(false);
                    setSelectedMember(null);
                    setSearch("");

                    const data = await getProjectById(id);

                    setProject(data.project);
                    setTasks(data.tasks || []);

                    fetchWorkspace();
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message ||
                      "Failed to add member"
                    );
                  } finally {
                    setAddingMember(false);
                  }
                }}
                disabled={addingMember || !selectedMember}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {addingMember ? "Adding..." : "Confirm & Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;