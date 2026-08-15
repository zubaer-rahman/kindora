import { AxiosInstance } from "axios";
import { IVolunteerApplication } from "@/types/api/volunteer-application";

export const applicationService = {
  getStatus: async (axios: AxiosInstance, opportunityId: string) => {
    const res = await axios.get(`/api/v1/applications/status/${opportunityId}`);
    return res.data.data;
  },

  apply: async (axios: AxiosInstance, opportunityId: string): Promise<IVolunteerApplication> => {
    const res = await axios.post<{ data: IVolunteerApplication }>("/api/v1/applications/apply", { opportunityId });
    return res.data.data;
  },

  getApplicants: async (axios: AxiosInstance, opportunityId: string) => {
    const res = await axios.get(`/api/v1/applications/applicants/${opportunityId}`);
    return res.data.data;
  },

  getRecruitments: async (axios: AxiosInstance, opportunityId?: string) => {
    const res = await axios.get("/api/v1/recruitments", {
      params: opportunityId ? { opportunityId } : undefined,
    });
    return res.data.data;
  },

  getVolunteerApplications: async (axios: AxiosInstance, volunteerId: string) => {
    const res = await axios.get(`/api/v1/applications/volunteer/${volunteerId}`);
    return res.data.data;
  },

  getMyApplications: async (axios: AxiosInstance, page: number = 1, limit: number = 10) => {
    const res = await axios.get("/api/v1/applications/me", { params: { page, limit } });
    return res.data.data;
  },

  getMyActiveApplications: async (axios: AxiosInstance, page: number = 1, limit: number = 10) => {
    const res = await axios.get("/api/v1/applications/me/active", { params: { page, limit } });
    return res.data.data;
  },

  getMyApprovedApplications: async (axios: AxiosInstance, page: number = 1, limit: number = 10) => {
    const res = await axios.get("/api/v1/applications/me/approved", { params: { page, limit } });
    return res.data.data;
  },

  getMyRecentApplications: async (axios: AxiosInstance, page: number = 1, limit: number = 10) => {
    const res = await axios.get("/api/v1/applications/me/recent", { params: { page, limit } });
    return res.data.data;
  },

  getCompletedCount: async (axios: AxiosInstance, volunteerId: string, currentOpportunityId?: string) => {
    const res = await axios.get("/api/v1/applications/completed/count", {
      params: { volunteerId, currentOpportunityId: currentOpportunityId || '' }
    });
    return res.data.data;
  },

  recruit: async (axios: AxiosInstance, applicationId: string) => {
    const res = await axios.post('/api/v1/recruitments', { applicationId });
    return res.data.data;
  },

  withdraw: async (axios: AxiosInstance, opportunityId: string) => {
    const res = await axios.delete(`/api/v1/applications/${opportunityId}`);
    return res.data.data;
  },
};
