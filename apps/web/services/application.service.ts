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
};
