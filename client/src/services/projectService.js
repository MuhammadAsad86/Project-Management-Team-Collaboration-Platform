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