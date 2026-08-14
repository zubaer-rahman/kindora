import { AxiosInstance } from "axios";

export const notificationService = {
  getUnreadCount: async (axios: AxiosInstance) => {
    const res = await axios.get("/api/v1/notifications/unread-count");
    return res.data.data;
  },

  getAll: async (axios: AxiosInstance, params?: { limit?: number; page?: number; is_read?: boolean }) => {
    const res = await axios.get("/api/v1/notifications", { params });
    return res.data.data;
  },

  markAsRead: async (axios: AxiosInstance, id: string) => {
    const res = await axios.patch(`/api/v1/notifications/read/${id}`);
    return res.data.data;
  },

  markAllAsRead: async (axios: AxiosInstance) => {
    const res = await axios.post("/api/v1/notifications/read-all");
    return res.data.data;
  },
};
