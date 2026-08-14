import { AxiosInstance } from "axios";

export const userService = {
  getAvailableUsers: async (
    axios: AxiosInstance,
    page: number = 1,
    limit: number = 200,
    includeMentors: boolean = true
  ) => {
    const res = await axios.get("/api/v1/users/available", {
      params: {
        search: searchQuery,
        opportunityId: opportunityId || undefined,
        isGroupContext: isGroupContext ? "true" : undefined,
      },
    });
    return res.data.data;
  },

  getProfileCheckup: async (axios: AxiosInstance) => {
    const res = await axios.get("/api/v1/users/me/profile-checkup");
    return res.data.data;
  },

  updateMe: async (axios: AxiosInstance, payload: any) => {
    const res = await axios.patch("/api/v1/users/me", payload);
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

  getOrganizationUsers: async (axios: AxiosInstance, organizationId: string) => {
    const res = await axios.get(`/api/v1/users/organization/${organizationId}`);
    return res.data.data;
  },
};
