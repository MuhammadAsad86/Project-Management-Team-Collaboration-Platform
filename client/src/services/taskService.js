import axiosInstance from "../utils/axiosInstance";

// Get All Tasks
// Admin + Project Manager
export const getTasks = async (params = {}) => {
  const response = await axiosInstance.get("/tasks", {
    params,
  });

  return response.data;
};

// Get Assigned Tasks
// Team Member only
export const getAssignedTasks = async (params = {}) => {
  const response = await axiosInstance.get("/tasks/assigned", {
    params,
  });

  return response.data;
};

// Get Single Task
export const getTaskById = async (id) => {
  const response = await axiosInstance.get(
    `/tasks/${id}`
  );

  return response.data;
};

// Create Task
// Admin + Project Manager
export const createTask = async (taskData) => {
  const response = await axiosInstance.post(
    "/tasks",
    taskData
  );

  return response.data;
};

// Update Task
// Admin + assigned Project Manager
export const updateTask = async (
  id,
  taskData
) => {
  const response = await axiosInstance.put(
    `/tasks/${id}`,
    taskData
  );

  return response.data;
};

// Delete Task
// Admin + assigned Project Manager
export const deleteTask = async (id) => {
  const response = await axiosInstance.delete(
    `/tasks/${id}`
  );

  return response.data;
};

// Update Task Status
// Assigned Team Member
export const updateTaskStatus = async (
  id,
  status
) => {
  const response = await axiosInstance.patch(
    `/tasks/${id}/status`,
    {
      status,
    }
  );

  return response.data;
};