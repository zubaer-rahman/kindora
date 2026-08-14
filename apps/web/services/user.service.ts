import { AxiosInstance } from "axios";

export const userService = {
  getAvailableUsers: async (
    axios: AxiosInstance,
    page: number = 1,
    limit: number = 200,
    includeMentors: boolean = true
  ) => {
    const res = await axios.get("/api/v1/users/available", {
      params: { page, limit, includeMentors },
    });
    return res.data.data;
  },

  updateRole: async (axios: AxiosInstance, userId: string, role: "admin" | "mentor") => {
    const res = await axios.patch(`/api/v1/users/${userId}/role`, { role });
    return res.data.data;
  },

  demoteMentor: async (axios: AxiosInstance, userId: string) => {
    const res = await axios.post(`/api/v1/users/${userId}/demote`);
    return res.data.data;
  },

  deleteUser: async (axios: AxiosInstance, userId: string) => {
    const res = await axios.delete(`/api/v1/users/${userId}`);
    return res.data.data;
  },
};
