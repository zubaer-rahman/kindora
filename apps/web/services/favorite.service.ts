import { AxiosInstance } from "axios";

export interface FavoriteStatus {
  isFavorite: boolean;
}

export const favoriteService = {
  getStatus: async (axios: AxiosInstance, opportunityId: string): Promise<FavoriteStatus> => {
    const res = await axios.get<{ data: FavoriteStatus }>(`/api/v1/applications/favorite-status/${opportunityId}`);
    return res.data.data;
  },

  toggle: async (axios: AxiosInstance, opportunityId: string): Promise<FavoriteStatus> => {
    const res = await axios.put<{ data: FavoriteStatus }>(`/api/v1/applications/favorite/${opportunityId}`);
    return res.data.data;
  },
};
