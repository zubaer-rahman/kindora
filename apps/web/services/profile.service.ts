import { AxiosInstance } from "axios";
import { IVolunteerProfile } from "@/types/api/volunteer-profile";
import { IMentorProfile } from "@/types/api/mentor-profile";

export const profileService = {
  getVolunteerProfile: async (axios: AxiosInstance): Promise<IVolunteerProfile> => {
    const res = await axios.get<{ data: IVolunteerProfile }>("/api/v1/volunteer-profiles/me");
    return res.data.data;
  },

  getVolunteerProfileById: async (axios: AxiosInstance, id: string): Promise<IVolunteerProfile> => {
    const res = await axios.get<{ data: IVolunteerProfile }>(`/api/v1/volunteer-profiles/${id}`);
    return res.data.data;
  },

  updateVolunteerProfile: async (
    axios: AxiosInstance,
    data: any
  ): Promise<IVolunteerProfile> => {
    const res = await axios.patch<{ data: IVolunteerProfile }>("/api/v1/volunteer-profiles/me", data);
    return res.data.data;
  },

  getMentorProfile: async (axios: AxiosInstance): Promise<IMentorProfile> => {
    const res = await axios.get<{ data: IMentorProfile }>("/api/v1/mentor-profiles/me");
    return res.data.data;
  },

  updateMentorProfile: async (
    axios: AxiosInstance,
    data: any
  ): Promise<IMentorProfile> => {
    const res = await axios.patch<{ data: IMentorProfile }>("/api/v1/mentor-profiles/me", data);
    return res.data.data;
  },

  getOrganizationProfile: async (axios: AxiosInstance): Promise<any> => {
    const res = await axios.get("/api/v1/users/me/organisation-profile");
    return res.data.data;
  },

  updateOrganizationProfile: async (axios: AxiosInstance, data: any): Promise<any> => {
    const res = await axios.post("/api/v1/users/me/organization-profile", data);
    return res.data.data;
  },

  getOrganizationProfileById: async (axios: AxiosInstance, id: string): Promise<any> => {
    const res = await axios.get(`/api/v1/organization-profiles/${id}`);
    return res.data.data;
  },

  getFavoriteStatus: async (axios: AxiosInstance, organizationId: string): Promise<any> => {
    const res = await axios.get(`/api/v1/organization-profiles/favorites/status/${organizationId}`);
    return res.data.data;
  },

  toggleFavorite: async (axios: AxiosInstance, organizationId: string): Promise<any> => {
    const res = await axios.put(`/api/v1/organization-profiles/favorites/${organizationId}`);
    return res.data.data;
  },

  getFavorites: async (axios: AxiosInstance, params?: any): Promise<any> => {
    const res = await axios.get("/api/v1/organization-profiles/favorites", { params });
    return res.data.data;
  },
};
