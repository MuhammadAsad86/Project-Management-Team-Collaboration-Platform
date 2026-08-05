import axiosInstance from "../utils/axiosInstance";

// Get Admin Dashboard Statistics
export const getDashboardStats = async () => {
  const response = await axiosInstance.get("/admin/dashboard");
  return response.data;
};