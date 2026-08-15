import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useState, useEffect } from "react";

import { useSession } from "next-auth/react";
import { favoriteService, FavoriteStatus } from "@/services/favorite.service";

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
      if (!opportunityId) return { isFavorite: false };
      return favoriteService.getStatus(axiosAuth, opportunityId);
    },
    enabled: !!session?.user && !!opportunityId,
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
    mutationFn: (payload: { opportunityId: string }) => 
      favoriteService.toggle(axiosAuth, payload.opportunityId),
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
