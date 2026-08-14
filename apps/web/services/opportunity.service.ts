import { AxiosInstance } from "axios";
import { IOpportunity } from "@/types/api/opportunity";
import { OpportunityFormValues } from "@/app/(protected)/organisation/opportunities/create/_components/types";

export const opportunityService = {
  /**
   * Fetches an opportunity by ID
   */
  getById: async (axios: AxiosInstance, id: string): Promise<IOpportunity> => {
    const res = await axios.get<{ data: IOpportunity }>(`/api/v1/opportunities/${id}`);
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
  }
};
