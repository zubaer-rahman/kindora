import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

type OpportunityAction = "archive" | "unarchive" | "delete";

const ACTION_CONFIG: Record<
  OpportunityAction,
  { method: "patch" | "delete"; path: (id: string) => string; verb: string }
> = {
  archive:   { method: "patch",  path: (id) => `/api/v1/opportunities/${id}/archive`,   verb: "archived"   },
  unarchive: { method: "patch",  path: (id) => `/api/v1/opportunities/${id}/unarchive`, verb: "unarchived" },
  delete:    { method: "delete", path: (id) => `/api/v1/opportunities/${id}`,           verb: "deleted"    },
};

function useOpportunityAction(action: OpportunityAction) {
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const config = ACTION_CONFIG[action];

  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const res = await axiosAuth[config.method](config.path(opportunityId));
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizationOpportunities"] });
      toast.success(`Opportunity ${config.verb} successfully`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error?.response?.data?.message || `Failed to ${action} opportunity`);
    },
  });
}

export function useOpportunityMutations() {
  const archiveMutation   = useOpportunityAction("archive");
  const unarchiveMutation = useOpportunityAction("unarchive");
  const deleteMutation    = useOpportunityAction("delete");

  return { archiveMutation, unarchiveMutation, deleteMutation };
}
