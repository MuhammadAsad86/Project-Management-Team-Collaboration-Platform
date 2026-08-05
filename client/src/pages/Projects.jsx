// Projects.jsx

import { useEffect, useState } from "react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/projectService";

import CreateProjectModal from "../components/projects/CreateProjectModal";
import ProjectFilters from "../components/projects/ProjectFilters";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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


  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await getProjects({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      setProjects(response.projects);

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
  };


  useEffect(() => {
    fetchProjects();
  }, [filters, pagination.page]);


  const handleCreateProject = async (formData) => {
    try {
      setCreating(true);

      await createProject(formData);

      alert("Project created successfully.");

      setShowCreateModal(false);

      await fetchProjects();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to create project."
      );

    } finally {
      setCreating(false);
    }
  };


  const handleUpdateProject = async (formData) => {
    try {
      setEditing(true);

      await updateProject(
        selectedProject._id,
        formData
      );

      alert("Project updated successfully.");

      setShowEditModal(false);
      setSelectedProject(null);

      await fetchProjects();

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

      await fetchProjects();

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Failed to delete project."
      );

    }
  };


  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        Loading Projects...
      </div>
    );
  }


  return (
    <div className="space-y-6">


      <div className="flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          Projects
        </h1>

        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          + Create Project
        </button>

      </div>


      <ProjectFilters
        filters={filters}
        setFilters={setFilters}
      />



      {projects.length === 0 ? (

        <p>No projects found.</p>

      ) : (

        <div className="space-y-4">

          {projects.map((project) => (

            <div
              key={project._id}
              className="rounded-lg bg-white p-5 shadow"
            >

              <h2 className="text-xl font-semibold">
                {project.name}
              </h2>

              <p>
                {project.description}
              </p>


              <div className="mt-3 flex gap-5 text-sm">

                <span>
                  Status: {project.status}
                </span>

                <span>
                  Priority: {project.priority}
                </span>

              </div>


              <div className="mt-4 flex gap-3">

                <button
                  onClick={() => {
                    setSelectedProject(project);
                    setShowEditModal(true);
                  }}
                  className="bg-yellow-500 px-4 py-2 text-white"
                >
                  Edit
                </button>


                <button
                  onClick={() =>
                    handleDeleteProject(project._id)
                  }
                  className="bg-red-600 px-4 py-2 text-white"
                >
                  Delete
                </button>

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
            setPagination({
              ...pagination,
              page: pagination.page - 1,
            })
          }
          className="rounded-lg bg-gray-200 px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>


        <span className="font-medium">
          Page {paginationInfo.currentPage} of{" "}
          {paginationInfo.totalPages}
        </span>


        <button
          disabled={!paginationInfo.hasNextPage}
          onClick={() =>
            setPagination({
              ...pagination,
              page: pagination.page + 1,
            })
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