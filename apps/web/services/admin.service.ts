import { AxiosInstance } from "axios";

export const adminService = {
  getUsers: async (axios: AxiosInstance, search: string, limit: number, page: number) => {
    const res = await axios.get("/api/v1/admin/users", {
      params: { search, limit, page },
    });
    return res.data.data;
  },

  deleteUser: async (axios: AxiosInstance, userId: string) => {
    await axios.delete(`/api/v1/admin/users/${userId}`);
  },

  updatePassword: async (axios: AxiosInstance, userId: string, newPassword: string) => {
    await axios.patch(`/api/v1/admin/users/${userId}/password`, { newPassword });
  },

  updateBlockStatus: async (axios: AxiosInstance, userId: string, is_blocked: boolean) => {
    await axios.patch(`/api/v1/admin/users/${userId}/block`, { is_blocked });
  },

  updateUser: async (axios: AxiosInstance, userId: string, name: string) => {
    await axios.patch(`/api/v1/admin/users/${userId}`, { name });
  },
};
