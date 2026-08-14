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

  getPaginatedFavorites: async (axios: AxiosInstance, page: number, limit: number) => {
    const res = await axios.get("/api/v1/volunteer-profiles/favorites/paginated", {
      params: { page, limit },
    });
    return res.data.data;
  },

  getAllFavorites: async (axios: AxiosInstance) => {
    const res = await axios.get("/api/v1/volunteer-profiles/favorites");
    return res.data.data;
  },
};
