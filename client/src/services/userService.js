import axiosInstance from "../utils/axiosInstance";

// Get All Users
export const getUsers = async (params = {}) => {
  const response = await axiosInstance.get("/users", {
    params,
  });

  return response.data;
};

// Get Single User
export const getUserById = async (id) => {
  const response = await axiosInstance.get(`/users/${id}`);

  return response.data;
};

// Create User
export const createUser = async (userData) => {
  const response = await axiosInstance.post(
    "/users",
    userData
  );

  return response.data;
};

// Update User (Admin)
export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(
    `/users/${id}`,
    userData
  );

  return response.data;
};

// Update My Profile
export const updateMyProfile = async (userData) => {
  const response = await axiosInstance.put(
    "/users/me",
    userData
  );

  return response.data;
};

// Change My Password
export const changeMyPassword = async (passwordData) => {
  const response = await axiosInstance.put(
    "/users/me/password",
    passwordData
  );

  return response.data;
};
// Change User Role (Admin)
export const changeUserRole = async (id, role) => {
  const response = await axiosInstance.patch(
    `/users/${id}/role`,
    { role }
  );

  return response.data;
};

// Delete User (Admin)
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(
    `/users/${id}`
  );

  return response.data;
};