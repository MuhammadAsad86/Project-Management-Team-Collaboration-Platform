import { useEffect, useState, useCallback, useRef } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/projectService";

import { useNavigate } from "react-router-dom";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import ProjectFilters from "../components/projects/ProjectFilters";
import toast from "react-hot-toast";

import {
  FiFolder,
  FiPlus,
  FiCalendar,
  FiUser,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiBriefcase,
  FiClock,
  FiCheckCircle,
  FiActivity,
  FiArrowUpRight,
  FiLayers,
} from "react-icons/fi";

const SEARCH_DEBOUNCE_MS = 400;

const Projects = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";
  const currentUserId = currentUser?._id || currentUser?.id;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    sort: "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

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

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDebouncedFilters(filters);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [filters]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getProjects({
        ...debouncedFilters,
        page: pagination.page,
        limit: pagination.limit,
      });

      setProjects(response.projects || []);

      setPaginationInfo({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
      });
    } catch (error) {
      console.error("Projects API Error:", error);
      toast.error(error.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (formData) => {
    try {
      setCreating(true);

      await createProject(formData);

      toast.success("Project created successfully.");

      setShowCreateModal(false);

      await fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      setEditing(true);

      await updateProject(selectedProject._id, formData);

      toast.success("Project updated successfully.");

      setShowEditModal(false);
      setSelectedProject(null);

      await fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update project.");
    } finally {
      setEditing(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this project?"
      );

      if (!confirmDelete) return;

      await deleteProject(id);

      toast.success("Project deleted successfully.");

      if (projects.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        await fetchProjects();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project.");
    }
  };

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

  // Derived stats from current view
  const activeCount = projects.filter(
    (p) => p.status === "active" || p.status === "in_progress"
  ).length;
  const completedCount = projects.filter((p) => p.status === "completed").length;
  const pendingCount = projects.filter(
    (p) => p.status === "pending" || p.status === "planning"
  ).length;

  return (
    <div className="nf-page-enter flex w-full flex-col" style={{ gap: "24px" }}>
      {/* 1. PAGE HEADER */}
      <div
        className="nf-depth-soft relative flex w-full flex-col justify-between rounded-2xl border border-white/80 bg-gradient-to-r from-white via-slate-50/80 to-indigo-50/30 sm:flex-row sm:items-center"
        style={{ padding: "18px 20px", gap: "16px" }}
      >
        <div className="flex flex-col" style={{ gap: "4px", minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span className="nf-badge nf-badge-primary">
              <FiLayers className="h-3.5 w-3.5" />
              Project Portfolio
            </span>
          </div>
          <h1
            className="truncate text-xl font-bold text-slate-900 sm:text-2xl"
            style={{ margin: 0 }}
          >
            Projects
          </h1>
          <p
            className="truncate text-xs font-medium text-slate-500 sm:text-sm"
            style={{ margin: 0 }}
          >
            Manage team workflows, milestones, and deliverable lifecycles.
          </p>
        </div>

        {isAdmin && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 active:scale-95 sm:text-sm"
              style={{
                padding: "10px 18px",
                gap: "8px",
                whiteSpace: "nowrap",
              }}
            >
              <FiPlus className="h-4 w-4 shrink-0" />
              <span>Create Project</span>
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
              Page Projects
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {projects.length}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <FiFolder className="h-5 w-5" />
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
              Active
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {activeCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
            <FiActivity className="h-5 w-5" />
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
              Pending
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {pendingCount}
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
      <ProjectFilters filters={filters} setFilters={setFilters} />

      {/* LOADING BANNER */}
      {loading && (
        <div
          className="flex items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50/60 font-medium text-indigo-600"
          style={{ padding: "14px 20px", gap: "10px" }}
        >
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-xs">Updating Projects View...</span>
        </div>
      )}

      {/* 4. PROJECTS LIST / CARDS */}
      {projects.length === 0 && !loading ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-center shadow-sm"
          style={{ padding: "48px 20px" }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500"
            style={{ marginBottom: "12px" }}
          >
            <FiFolder className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-800" style={{ margin: 0 }}>
            No projects found
          </p>
          <p
            className="max-w-sm text-xs text-slate-500"
            style={{ marginTop: "4px" }}
          >
            Try adjusting your search or filter parameters to find the project
            you are looking for.
          </p>
        </div>
      ) : (
        <div
          className="grid w-full grid-cols-1 md:grid-cols-2"
          style={{ gap: "20px" }}
        >
          {projects.map((project) => {
            const managerName =
              project.assignedManager?.name ||
              project.projectManager?.name ||
              "Not assigned";

            return (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="nf-depth-card nf-interactive flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm hover:border-indigo-200"
                style={{ padding: "20px", gap: "16px" }}
              >
                {/* Top: Header & Badges */}
                <div className="flex flex-col" style={{ gap: "10px" }}>
                  <div
                    className="flex items-start justify-between"
                    style={{ gap: "12px" }}
                  >
                    <div className="min-w-0 flex-1">
                      <h2
                        className="truncate text-base font-bold text-slate-900 group-hover:text-indigo-600 sm:text-lg"
                        style={{ margin: 0 }}
                      >
                        {project.name}
                      </h2>
                    </div>

                    <div
                      className="flex shrink-0 items-center"
                      style={{ gap: "6px" }}
                    >
                      {renderStatusBadge(project.status)}
                      {renderPriorityBadge(project.priority)}
                    </div>
                  </div>

                  {/* Description */}
                  <p
                    className="line-clamp-2 text-xs leading-relaxed text-slate-500"
                    style={{ margin: 0 }}
                  >
                    {project.description || "No description provided."}
                  </p>
                </div>

                {/* Middle: Details Grid */}
                <div
                  className="grid grid-cols-1 gap-2 rounded-xl border border-slate-100 bg-slate-50/60 text-xs text-slate-600 sm:grid-cols-2"
                  style={{ padding: "12px 14px" }}
                >
                  <div
                    className="flex items-center"
                    style={{ gap: "6px", minWidth: 0 }}
                  >
                    <FiCalendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">
                      <strong className="font-semibold text-slate-700">
                        Start:
                      </strong>{" "}
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString()
                        : "Not set"}
                    </span>
                  </div>

                  <div
                    className="flex items-center"
                    style={{ gap: "6px", minWidth: 0 }}
                  >
                    <FiClock className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">
                      <strong className="font-semibold text-slate-700">
                        End:
                      </strong>{" "}
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString()
                        : "Not set"}
                    </span>
                  </div>

                  <div
                    className="flex items-center sm:col-span-2"
                    style={{ gap: "6px", minWidth: 0 }}
                  >
                    <FiUser className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">
                      <strong className="font-semibold text-slate-700">
                        Manager:
                      </strong>{" "}
                      {managerName}
                    </span>
                  </div>
                </div>

                {/* Bottom: Action Buttons */}
                <div
                  className="flex items-center justify-between border-t border-slate-100"
                  style={{ paddingTop: "12px" }}
                >
                  <div
                    className="flex items-center"
                    style={{ gap: "8px", flexWrap: "wrap" }}
                  >
                    {/* View Overview */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project._id}`);
                      }}
                      className="flex items-center justify-center rounded-xl bg-indigo-50 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                      style={{
                        padding: "6px 12px",
                        gap: "6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FiEye className="h-3.5 w-3.5 shrink-0" />
                      <span>Overview</span>
                    </button>

                    {/* Edit */}
                    {(isAdmin ||
                      project.assignedManager?._id === currentUserId ||
                      project.assignedManager === currentUserId) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setShowEditModal(true);
                        }}
                        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
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

                    {/* Delete */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project._id);
                        }}
                        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-600"
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
            );
          })}
        </div>
      )}

      {/* 5. PAGINATION */}
      <div
        className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "12px 20px", gap: "12px" }}
      >
        <span className="text-center text-xs font-semibold text-slate-500 sm:text-left">
          Showing page{" "}
          <span className="text-slate-800">
            {paginationInfo.currentPage || 1}
          </span>{" "}
          of{" "}
          <span className="text-slate-800">
            {paginationInfo.totalPages || 1}
          </span>
        </span>

        <div
          className="flex items-center justify-center"
          style={{ gap: "8px" }}
        >
          <button
            type="button"
            disabled={!paginationInfo.hasPreviousPage}
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
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
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
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
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        loading={creating}
      />

      <CreateProjectModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProject(null);
        }}
        onSubmit={handleUpdateProject}
        loading={editing}
        title="Edit Project"
        initialData={selectedProject || {}}
      />
    </div>
  );
};

export default Projects;