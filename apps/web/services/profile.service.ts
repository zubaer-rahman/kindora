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
};
