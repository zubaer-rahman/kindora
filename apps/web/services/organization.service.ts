import { AxiosInstance } from "axios";

export const organizationService = {
  getOrganizationMentors: async (axios: AxiosInstance, organizationId: string) => {
    const res = await axios.get(`/api/v1/organization-mentors/organization/${organizationId}`);
    return res.data.data;
  },

  getOpportunityMentors: async (axios: AxiosInstance, opportunityId: string) => {
    const res = await axios.get(`/api/v1/organization-mentors/opportunity/${opportunityId}`);
    return res.data.data;
  },

  inviteMentor: async (axios: AxiosInstance, payload: { email: string; name: string; organizationId: string }) => {
    const res = await axios.post("/api/v1/organization-mentors/invite", payload);
    return res.data.data;
  },

  acceptMentorInvitation: async (axios: AxiosInstance, payload: { token: string; name: string; password: string }) => {
    const res = await axios.post("/api/v1/organization-mentors/accept-invitation", payload);
    return res.data.data;
  },

  toggleMentor: async (axios: AxiosInstance, payload: { volunteerId: string; opportunityId: string }) => {
    const res = await axios.patch("/api/v1/organization-mentors/toggle", payload);
    return res.data.data;
  },
};
