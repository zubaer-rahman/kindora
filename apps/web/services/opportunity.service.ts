import { AxiosInstance } from "axios";
import { IOpportunity } from "@/types/api/opportunity";
import { OpportunityFormValues } from "@/app/(protected)/organisation/opportunities/create/_components/types";

export const opportunityService = {
  /**
   * Fetches an opportunity by ID
   */
  getById: async (axios: AxiosInstance, id: string): Promise<any> => {
    const res = await axios.get(`/api/v1/opportunities/${id}`);
    return res.data.data;
  },

  /**
   * Updates an existing opportunity
   */
  update: async (
    axios: AxiosInstance, 
    id: string, 
    data: Partial<OpportunityFormValues>
  ): Promise<IOpportunity> => {
    const res = await axios.put<{ data: IOpportunity }>(`/api/v1/opportunities/${id}`, data);
    return res.data.data;
  },

  /**
   * Creates a new opportunity
   */
  create: async (
    axios: AxiosInstance,
    data: OpportunityFormValues
  ): Promise<IOpportunity> => {
    const res = await axios.post<{ data: IOpportunity }>("/api/v1/opportunities", data);
    return res.data.data;
  },

  /**
   * Deletes an opportunity
   */
  delete: async (axios: AxiosInstance, id: string): Promise<void> => {
    await axios.delete(`/api/v1/opportunities/${id}`);
  },

  archive: async (axios: AxiosInstance, id: string): Promise<void> => {
    await axios.patch(`/api/v1/opportunities/${id}/archive`);
  },

  unarchive: async (axios: AxiosInstance, id: string): Promise<void> => {
    await axios.patch(`/api/v1/opportunities/${id}/unarchive`);
  },

  /**
   * Fetches opportunities for the current organization
   */
  getMyOrgOpportunities: async (axios: AxiosInstance): Promise<any> => {
    const res = await axios.get("/api/v1/opportunities/my-org");
    return res.data.data;
  },

  getAllMentorOpportunities: async (axios: AxiosInstance): Promise<any> => {
    const res = await axios.get("/api/v1/opportunities/mentor/all");
    return res.data.data;
  },

  /**
   * Fetches all published opportunities for volunteers (Find Opportunities)
   */
  getAllPublished: async (axios: AxiosInstance, params?: any) => {
    const res = await axios.get("/api/v1/opportunities/published", { params });
    return res.data.data;
  },

  /**
   * Fetches all opportunities with filters (Find Opportunity page)
   */
  getAll: async (axios: AxiosInstance, params?: any) => {
    const res = await axios.get("/api/v1/opportunities", { params });
    return res.data.data;
  },

  /**
   * Fetches total count of opportunities
   */
  getCount: async (axios: AxiosInstance) => {
    const res = await axios.get("/api/v1/opportunities/count");
    return res.data.data;
  },
};
