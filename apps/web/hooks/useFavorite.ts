import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useState, useEffect } from "react";

import { useSession } from "next-auth/react";

interface FavoriteStatus {
  isFavorite: boolean;
}

export const useFavorite = (opportunityId: string) => {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Query to check if opportunity is favorited
  const { data: favoriteStatus, isPending: isStatusPending } = useQuery({
    queryKey: ["favoriteStatus", opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/applications/favorite-status/${opportunityId}`);
      return res.data.data;
    },
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (!session?.user) {
      setIsFavorite(false);
      setIsLoading(false);
      return;
    }

    if (!isStatusPending) {
      setIsFavorite(favoriteStatus?.isFavorite || false);
      setIsLoading(false);
    }
  }, [favoriteStatus, isStatusPending, session]);

  // Mutation to toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (payload: { opportunityId: string }) => {
      const res = await axiosAuth.put(`/api/v1/applications/favorite/${payload.opportunityId}`);
      return res.data.data as FavoriteStatus;
    },
    onSuccess: (data: FavoriteStatus) => {
      // Invalidate both the opportunities list and count queries
      queryClient.invalidateQueries({ queryKey: ["favoriteOpportunities"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteOpportunitiesWithPagination"] });
      queryClient.invalidateQueries({ queryKey: ["favoriteOpportunitiesCount"] });
      setIsFavorite(data.isFavorite);
    },
  });

  const toggleFavorite = () => {
    toggleFavoriteMutation.mutate({ opportunityId });
  };

  return {
    isFavorite,
    isLoading,
    isToggling: toggleFavoriteMutation.isPending,
    toggleFavorite,
  };
}; 
