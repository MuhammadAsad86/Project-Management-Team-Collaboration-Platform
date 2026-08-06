import axiosInstance from "../utils/axiosInstance";

// Get All Projects
export const getProjects = async (params = {}) => {
  const response = await axiosInstance.get("/projects", { params });
  return response.data;
};

// Get Single Project
export const getProjectById = async (id) => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data;
};

// Create Project
export const createProject = async (projectData) => {
  const response = await axiosInstance.post("/projects", projectData);
  return response.data;
};

// Update Project
export const updateProject = async (id, projectData) => {
  const response = await axiosInstance.put(
    `/projects/${id}`,
    projectData
  );
  return response.data;
};

// Delete Project
export const deleteProject = async (id) => {
  const response = await axiosInstance.delete(`/projects/${id}`);
  return response.data;
};

// =============================
// Project Manager APIs
// =============================

// Get Assigned Projects
export const getAssignedProjects = async () => {
  const response = await axiosInstance.get(
    "/projects/assigned"
  );
  return response.data;
};

// Get Project Statistics
export const getProjectStats = async () => {
  const response = await axiosInstance.get(
    "/projects/stats"
  );

  return response.data;
};


// Add Project Member
export const addProjectMember = async (id, memberId) => {
  const response = await axiosInstance.patch(
    `/projects/${id}/members`,
    {
      memberIds: [memberId],
    }
  );

  return response.data;
};
// Remove Project Member
export const removeProjectMember = async (id, memberId) => {
  const response = await axiosInstance.patch(
    `/projects/${id}/members/remove`,
    {
      memberId,
    }
  );

  return response.data;
};

// Get Project Workspace
export const getProjectWorkspace = async (id) => {
  const response = await axiosInstance.get(
    `/projects/${id}/workspace`
  );

  return response.data;
};