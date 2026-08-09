import axiosInstance from "../utils/axiosInstance";

// Get logged-in user's notifications
export const getNotifications = async () => {
  const response = await axiosInstance.get(
    "/notifications"
  );

  return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId
) => {
  const response = await axiosInstance.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};