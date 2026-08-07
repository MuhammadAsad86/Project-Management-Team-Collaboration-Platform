// Projects.jsx

import { useEffect, useState, useCallback, useRef } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/projectService";

import CreateProjectModal from "../components/projects/CreateProjectModal";
import ProjectFilters from "../components/projects/ProjectFilters";

const SEARCH_DEBOUNCE_MS = 400;

const Projects = () => {
  // Current user's role, used to conditionally show the
  // "Create Project" button (Admin only). Adjust this line if your
  // app stores the logged-in user differently (e.g. an auth context).
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = currentUser?.role === "admin";
  const currentUserId = currentUser?._id || currentUser?.id;

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // `filters` holds the immediate/typed values shown in the UI.
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    sort: "",
  });

  // `debouncedFilters` holds the values actually used to fetch data.
  // This is what prevents an API call on every keystroke.
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

  // Skip the debounce delay on the very first render so the initial
  // load isn't unnecessarily delayed.
  const isFirstRender = useRef(true);

  // Debounce: wait until the user pauses typing/changing filters
  // before pushing the values into debouncedFilters.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDebouncedFilters(filters);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
      // Reset to page 1 whenever search/filters change.
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(handler);
  }, [filters]);

  // Fetch Projects (memoized so useEffect deps stay stable and
  // don't cause unnecessary re-fetches).
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getProjects({
        ...debouncedFilters,
        page: pagination.page,
        limit: pagination.limit,
      });

      // Safely handle the response in case `projects` is missing.
      setProjects(response.projects || []);

      setPaginationInfo({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
      });
    } catch (error) {
      console.error("Projects API Error:", error);
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

      alert("Project created successfully.");

      setShowCreateModal(false);

      await fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create project.");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateProject = async (formData) => {
    try {
      setEditing(true);

      await updateProject(selectedProject._id, formData);

      alert("Project updated successfully.");

      setShowEditModal(false);
      setSelectedProject(null);

      await fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update project.");
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

      alert("Project deleted successfully.");

      // If this was the last project on a page beyond page 1,
      // step back a page so we don't land on an empty page
      // (same behavior as Tasks.jsx).
      if (projects.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        await fetchProjects();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete project.");
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="rounded-lg bg-blue-50 p-3 text-center text-blue-600">
          Loading Projects...
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            + Create Project
          </button>
        )}
      </div>

      <ProjectFilters filters={filters} setFilters={setFilters} />

      {projects.length === 0 ? (
        <p>No projects found.</p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project._id} className="rounded-lg bg-white p-5 shadow">
              <h2 className="text-xl font-semibold">{project.name}</h2>

              <p>{project.description}</p>

              <div className="mt-3 flex gap-5 text-sm">
                <span>Status: {project.status}</span>

                <span>Priority: {project.priority}</span>
              </div>

              <div className="mt-4 flex gap-3">
                {(isAdmin ||
                  project.assignedManager?._id === currentUserId ||
                  project.assignedManager === currentUserId) && (
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setShowEditModal(true);
                    }}
                    className="bg-yellow-500 px-4 py-2 text-white"
                  >
                    Edit
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    className="bg-red-600 px-4 py-2 text-white"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4">
        <button
          disabled={!paginationInfo.hasPreviousPage}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
          }
          className="rounded-lg bg-gray-200 px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        <span className="font-medium">
          Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
        </span>

        <button
          disabled={!paginationInfo.hasNextPage}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>

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