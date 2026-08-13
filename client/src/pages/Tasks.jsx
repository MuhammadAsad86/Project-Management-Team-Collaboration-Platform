import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import {
  getTasks,
  getAssignedTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../services/taskService";

import { getUsers } from "../services/userService";

import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskFilters from "../components/tasks/TaskFilters";

import {
  FiCheckSquare,
  FiPlus,
  FiCalendar,
  FiUser,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCheckCircle,
  FiPlayCircle,
  FiList,
  FiFolder,
  FiArrowUpRight,
} from "react-icons/fi";

const Tasks = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isTeamMember = currentUser?.role === "team_member";
  const isAdmin = currentUser?.role === "admin";

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    sort: "",
    assignedTo: "",
  });

  // Debounced Search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [filters.search]);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const requestFilters = {
        search: debouncedSearch,
        status: filters.status,
        priority: filters.priority,
        sort: filters.sort,
        assignedTo: filters.assignedTo,
        page: pagination.page,
        limit: pagination.limit,
      };

      let response;

      if (isTeamMember) {
        response = await getAssignedTasks(requestFilters);
      } else {
        response = await getTasks(requestFilters);
      }

      setTasks(response.tasks || []);

      setPaginationInfo({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        hasNextPage: response.hasNextPage || false,
        hasPreviousPage: response.hasPreviousPage || false,
      });
    } catch (error) {
      console.error("Tasks API Error:", error);
      toast.error(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [
    isTeamMember,
    filters.status,
    filters.priority,
    filters.sort,
    filters.assignedTo,
    debouncedSearch,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch Users (Only Admin)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      try {
        const response = await getUsers({
          limit: 100,
        });

        setUsers(response.users || []);
      } catch (error) {
        console.error("Users API Error:", error);
      }
    };

    fetchUsers();
  }, [isAdmin]);

  // Filter Change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // Create Task
  const handleCreateTask = async (formData) => {
    try {
      setCreating(true);

      await createTask(formData);

      toast.success("Task created successfully.");

      setShowCreateModal(false);

      await fetchTasks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create task."
      );
    } finally {
      setCreating(false);
    }
  };

  // Update Task
  const handleUpdateTask = async (formData) => {
    try {
      setEditing(true);

      await updateTask(selectedTask._id, formData);

      toast.success("Task updated successfully.");

      setShowEditModal(false);
      setSelectedTask(null);

      await fetchTasks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update task."
      );
    } finally {
      setEditing(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this task?"
      );

      if (!confirmDelete) return;

      await deleteTask(id);

      toast.success("Task deleted successfully.");

      await fetchTasks();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete task."
      );
    }
  };

  // Team Member Status Update
  const handleStatusUpdate = async (id, status) => {
    try {
      await updateTaskStatus(id, status);

      toast.success("Task status updated successfully.");

      await fetchTasks();
    } catch (error) {
      console.error("Status Update Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update status."
      );
    }
  };

  // Helper for Status Badges
  const renderStatusBadge = (status = "") => {
    const formatted = status.replaceAll("_", " ");
    let bg = "#F1F5F9";
    let color = "#475569";
    let border = "#E2E8F0";

    switch (status?.toLowerCase()) {
      case "completed":
        bg = "rgba(16, 185, 129, 0.1)";
        color = "#047857";
        border = "rgba(16, 185, 129, 0.2)";
        break;
      case "in_progress":
        bg = "rgba(79, 70, 229, 0.1)";
        color = "#4338CA";
        border = "rgba(79, 70, 229, 0.2)";
        break;
      case "review":
        bg = "rgba(124, 58, 237, 0.1)";
        color = "#6D28D9";
        border = "rgba(124, 58, 237, 0.2)";
        break;
      case "todo":
      case "pending":
        bg = "rgba(245, 158, 11, 0.12)";
        color = "#B45309";
        border = "rgba(245, 158, 11, 0.2)";
        break;
      default:
        break;
    }

    return (
      <span
        className="inline-flex items-center rounded-full text-xs font-bold capitalize"
        style={{
          padding: "3px 10px",
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          whiteSpace: "nowrap",
        }}
      >
        {formatted}
      </span>
    );
  };

  // Helper for Priority Badges
  const renderPriorityBadge = (priority = "") => {
    let bg = "#F1F5F9";
    let color = "#475569";
    let border = "#E2E8F0";

    switch (priority?.toLowerCase()) {
      case "high":
      case "urgent":
        bg = "rgba(239, 68, 68, 0.1)";
        color = "#B91C1C";
        border = "rgba(239, 68, 68, 0.2)";
        break;
      case "medium":
        bg = "rgba(245, 158, 11, 0.12)";
        color = "#B45309";
        border = "rgba(245, 158, 11, 0.2)";
        break;
      case "low":
        bg = "rgba(59, 130, 246, 0.1)";
        color = "#1D4ED8";
        border = "rgba(59, 130, 246, 0.2)";
        break;
      default:
        break;
    }

    return (
      <span
        className="inline-flex items-center rounded-full text-xs font-bold capitalize"
        style={{
          padding: "3px 10px",
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          whiteSpace: "nowrap",
        }}
      >
        {priority || "Normal"}
      </span>
    );
  };

  // Stats Counters
  const todoCount = tasks.filter(
    (t) => t.status === "todo" || t.status === "pending"
  ).length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="flex w-full flex-col" style={{ gap: "24px" }}>
      {/* 1. PAGE HEADER */}
      <div
        className="flex w-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "18px 20px", gap: "16px" }}
      >
        <div className="flex flex-col" style={{ gap: "4px", minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span
              className="inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-50 text-xs font-semibold text-indigo-700"
              style={{ padding: "2px 10px", gap: "6px" }}
            >
              <FiCheckSquare className="h-3.5 w-3.5" />
              Task Workspace
            </span>
          </div>
          <h1
            className="truncate text-xl font-bold text-slate-900 sm:text-2xl"
            style={{ margin: 0 }}
          >
            Tasks
          </h1>
          <p
            className="truncate text-xs font-medium text-slate-500 sm:text-sm"
            style={{ margin: 0 }}
          >
            Track assigned deliverables, update progress, and coordinate milestones.
          </p>
        </div>

        {!isTeamMember && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 sm:text-sm"
              style={{
                padding: "10px 18px",
                gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              <FiPlus className="h-4 w-4 shrink-0" />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. STATS SUMMARY SECTION */}
      <div
        className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "18px" }}
      >
        <div
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              style={{ margin: 0 }}
            >
              Page Tasks
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {tasks.length}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <FiList className="h-5 w-5" />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              style={{ margin: 0 }}
            >
              To Do
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {todoCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
            <FiClock className="h-5 w-5" />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              style={{ margin: 0 }}
            >
              In Progress
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {inProgressCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
            <FiPlayCircle className="h-5 w-5" />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              style={{ margin: 0 }}
            >
              Completed
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {completedCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
            <FiCheckCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH AND FILTERS */}
      <TaskFilters
        filters={filters}
        setFilters={handleFilterChange}
        users={isAdmin ? users : []}
        isAdmin={isAdmin}
      />

      {/* LOADING BANNER */}
      {loading && (
        <div
          className="flex items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/60 font-medium text-indigo-600"
          style={{ padding: "14px 20px", gap: "10px" }}
        >
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-xs">Updating Tasks View...</span>
        </div>
      )}

      {/* 4. TASK CARDS GRID */}
      {tasks.length === 0 && !loading ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-center shadow-sm"
          style={{ padding: "48px 20px" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500"
            style={{ marginBottom: "12px" }}
          >
            <FiCheckSquare className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-800" style={{ margin: 0 }}>
            No tasks found.
          </p>
          <p
            className="max-w-sm text-xs text-slate-500"
            style={{ marginTop: "4px" }}
          >
            Try adjusting your search or filter parameters to find the task you are looking for.
          </p>
        </div>
      ) : (
        <div
          className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: "20px" }}
        >
          {tasks.map((task) => (
            <div
              key={task._id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-2 hover:border-indigo-300 hover:shadow-[0_18px_36px_rgba(79,70,229,0.12)]"
              style={{ padding: "20px", gap: "16px" }}
            >
              {/* Top: Header & Badges */}
              <div className="flex flex-col" style={{ gap: "10px" }}>
                <div
                  className="flex items-start justify-between"
                  style={{ gap: "10px" }}
                >
                  <div className="min-w-0 flex-1">
                    <h2
                      className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600"
                      style={{ margin: 0 }}
                    >
                      {task.title}
                    </h2>
                  </div>

                  <div
                    className="flex shrink-0 items-center"
                    style={{ gap: "6px" }}
                  >
                    {renderStatusBadge(task.status)}
                    {renderPriorityBadge(task.priority)}
                  </div>
                </div>

                {/* Description */}
                <p
                  className="line-clamp-2 text-xs leading-relaxed text-slate-500"
                  style={{ margin: 0, minHeight: "36px" }}
                >
                  {task.description || "No description provided."}
                </p>
              </div>

              {/* Middle: Details Grid */}
              <div
                className="grid grid-cols-1 gap-2 rounded-xl border border-slate-100 bg-slate-50/60 text-xs text-slate-600"
                style={{ padding: "12px" }}
              >
                <div
                  className="flex items-center"
                  style={{ gap: "6px", minWidth: 0 }}
                >
                  <FiFolder className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  <span className="truncate">
                    <strong className="font-semibold text-slate-700">
                      Project:
                    </strong>{" "}
                    {task.project?.name || "N/A"}
                  </span>
                </div>

                <div
                  className="flex items-center"
                  style={{ gap: "6px", minWidth: 0 }}
                >
                  <FiUser className="h-3.5 w-3.5 shrink-0 text-purple-500" />
                  <span className="truncate">
                    <strong className="font-semibold text-slate-700">
                      Assignee:
                    </strong>{" "}
                    {task.assignedTo?.name || "N/A"}
                  </span>
                </div>

                <div
                  className="flex items-center"
                  style={{ gap: "6px", minWidth: 0 }}
                >
                  <FiCalendar className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
                  <span className="truncate">
                    <strong className="font-semibold text-slate-700">
                      Due:
                    </strong>{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "Not set"}
                  </span>
                </div>
              </div>

              {/* Status History (if present) */}
              {task.statusHistory?.length > 0 && (
                <div
                  className="rounded-xl border border-slate-100 bg-slate-50/50"
                  style={{ padding: "10px 12px" }}
                >
                  <div
                    className="flex items-center text-xs font-bold text-slate-700"
                    style={{ gap: "6px", marginBottom: "6px" }}
                  >
                    <FiClock className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Status History</span>
                  </div>

                  <div className="flex flex-col space-y-1.5 max-h-24 overflow-y-auto">
                    {[...task.statusHistory]
                      .reverse()
                      .map((history) => (
                        <div
                          key={history._id}
                          className="border-l-2 border-indigo-400 text-[11px]"
                          style={{ paddingLeft: "8px", margin: "1px 0" }}
                        >
                          <p
                            className="font-semibold text-slate-800"
                            style={{ margin: 0 }}
                          >
                            <span className="capitalize">{history.from}</span> →{" "}
                            <span className="capitalize">{history.to}</span>
                          </p>
                          <p
                            className="text-[10px] text-slate-400"
                            style={{ margin: 0 }}
                          >
                            {history.changedBy} •{" "}
                            {new Date(history.changedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Bottom: Action Buttons */}
              <div
                className="flex items-center justify-between border-t border-slate-100"
                style={{ paddingTop: "12px" }}
              >
                <div
                  className="flex items-center"
                  style={{ gap: "8px", flexWrap: "wrap" }}
                >
                  {isTeamMember && (
                    <div
                      className="flex items-center rounded-xl border border-slate-200 bg-slate-50"
                      style={{ padding: "4px 8px", gap: "6px" }}
                    >
                      <span className="text-[11px] font-medium text-slate-400">
                        Status:
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusUpdate(task._id, e.target.value)
                        }
                        className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
                      >
                        <option value="todo">Todo</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  )}

                  {!isTeamMember && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowEditModal(true);
                      }}
                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
                      style={{
                        padding: "6px 12px",
                        gap: "6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FiEdit2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Edit</span>
                    </button>
                  )}

                  {!isTeamMember && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task._id)}
                      className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                      style={{
                        padding: "6px 12px",
                        gap: "6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FiTrash2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>

                <FiArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. PAGINATION */}
      <div
        className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "12px 20px", gap: "12px" }}
      >
        <span className="text-center text-xs font-semibold text-slate-500 sm:text-left">
          Page <span className="text-slate-800">{paginationInfo.currentPage}</span>{" "}
          of <span className="text-slate-800">{paginationInfo.totalPages}</span>
        </span>

        <div
          className="flex items-center justify-center"
          style={{ gap: "8px" }}
        >
          <button
            type="button"
            disabled={!paginationInfo.hasPreviousPage}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: prev.page - 1,
              }))
            }
            className="flex items-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ padding: "6px 12px", gap: "4px" }}
          >
            <FiChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <button
            type="button"
            disabled={!paginationInfo.hasNextPage}
            onClick={() =>
              setPagination((prev) => ({
                ...prev,
                page: prev.page + 1,
              }))
            }
            className="flex items-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ padding: "6px 12px", gap: "4px" }}
          >
            Next
            <FiChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* MODALS */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        loading={creating}
      />

      <CreateTaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleUpdateTask}
        loading={editing}
        title="Edit Task"
        initialData={selectedTask || {}}
      />
    </div>
  );
};

export default Tasks;