"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { toast } from "react-hot-toast";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyButton } from "@/components/buttons/ApplyButton";
import ConfirmationDialog from "@/components/modals/ConfirmationDialog";
import { useFavorite } from "@/hooks/useFavorite";
import { applicationService } from "@/services/application.service";

export function OpportunityActions({ opportunity }: { opportunity: any }) {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const isOrganisation = session?.user?.role === "admin";
  const isCreator = session?.user?.id === opportunity.created_by?._id;

  const { isFavorite, isLoading: isFavoriteLoading, isToggling, toggleFavorite } = useFavorite(opportunity._id);

  const { data: applicationStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ["applicationStatus", opportunity._id],
    queryFn: () => applicationService.getStatus(axiosAuth, opportunity._id),
    enabled: !!session?.user?.id
  });

  const revokeMutation = useMutation({
    mutationFn: () => applicationService.withdraw(axiosAuth, opportunity._id),
    onSuccess: () => {
      toast.success("Application withdrawn successfully");
      queryClient.invalidateQueries({ queryKey: ["activeApplications"] });
      queryClient.invalidateQueries({ queryKey: ["applicationsActiveCount"] });
      queryClient.invalidateQueries({ queryKey: ["applicationStatus", opportunity._id] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to withdraw application");
    },
  });

  if (isOrganisation || isCreator) return null;

  const opportunityDetails = {
    id: opportunity._id,
    title: opportunity.title,
    organization: {
      title: opportunity.organization_profile?.title || "Organization",
      id: opportunity.organization_profile?._id || "",
    },
    location: opportunity.location,
  };

  return (
    <div className="space-y-3 mb-6">
      <ApplyButton
        opportunityId={opportunity._id}
        opportunityDetails={opportunityDetails}
        opportunityDate={opportunity.date}
        className="w-full h-11 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-sm"
      />
      
      <Button
        variant="outline"
        className="w-full h-11 text-sm border-2 border-border text-foreground hover:bg-muted flex items-center justify-center gap-2 font-semibold rounded-xl transition-all"
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite();
        }}
        disabled={isFavoriteLoading || isToggling}
      >
        {isFavoriteLoading || isToggling ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
        )}
        <span>{isFavorite ? "Saved" : "Save opportunity"}</span>
      </Button>

      {applicationStatus && (applicationStatus.status === 'pending' || applicationStatus.status === 'approved') && (
        <>
          <Button
            variant="outline"
            className="w-full h-11 text-sm border-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive flex items-center justify-center gap-2 font-semibold rounded-xl transition-all"
            onClick={() => setIsWithdrawDialogOpen(true)}
            disabled={revokeMutation.isPending || isStatusLoading}
          >
            {revokeMutation.isPending ? 'Withdrawing...' : 'Withdraw Application'}
          </Button>
          <ConfirmationDialog
            isOpen={isWithdrawDialogOpen}
            onOpenChange={setIsWithdrawDialogOpen}
            title="Withdraw Application"
            description="Are you sure you want to withdraw your application for this opportunity? This action cannot be undone."
            confirmText={revokeMutation.isPending ? 'Withdrawing...' : 'Withdraw'}
            onConfirm={() => {
              revokeMutation.mutate();
              setIsWithdrawDialogOpen(false);
            }}
            variant="destructive"
            isLoading={revokeMutation.isPending}
          />
        </>
      )}
    </div>
  );
}
