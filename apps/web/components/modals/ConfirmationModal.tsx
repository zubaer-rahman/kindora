import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Calendar, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";
import { OpportunityDetails } from "@/components/features/volunteer/home-page/HomePageCategories";
import toast from "react-hot-toast";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityDetails: OpportunityDetails;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  opportunityDetails,
}: ConfirmationModalProps) {
  const logoSrc = "/collab.svg";
  const [isChecked, setIsChecked] = React.useState(false);
  const router = useRouter();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  // Fetch full opportunity details for the modal
  const { data: fullOpportunity } = useQuery({
    queryKey: ["opportunity", opportunityDetails.id],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/opportunities/${opportunityDetails.id}`);
      return res.data.data;
    },
    enabled: isOpen,
  });

  const applyMutation = useMutation({
    mutationFn: async (payload: { opportunityId: string }) => {
      const res = await axiosAuth.post("/api/v1/applications/apply", payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success(
        `Successfully applied to "${opportunityDetails.title}"!`,
        {}
      );
      // Invalidate all application-related queries to update dashboard tabs
      queryClient.invalidateQueries({ queryKey: ["applicationStatus"] });
      queryClient.invalidateQueries({ queryKey: ["applicationsActiveCount"] });
      queryClient.invalidateQueries({ queryKey: ["applicationsRecentCount"] });
      queryClient.invalidateQueries({ queryKey: ["activeApplications"] });
      queryClient.invalidateQueries({ queryKey: ["recentApplications"] });
      queryClient.invalidateQueries({ queryKey: ["approvedApplications"] });
      queryClient.invalidateQueries({ queryKey: ["allOpportunities"] });
      queryClient.invalidateQueries({ queryKey: ["volunteerApplications"] });
      onClose();
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "You have already applied for this opportunity."
      );
    },
  });

  const handleApply = () => {
    if (!isChecked) return;

    applyMutation.mutate({ opportunityId: opportunityDetails.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full sm:w-[750px] min-h-[400px] sm:h-[650px] rounded-lg sm:rounded-[10px] bg-white pb-4 flex flex-col items-center sm:px-2 p-6">
        <DialogHeader className="flex flex-col items-center w-full mb-2">
          <DialogTitle className="sr-only">Volunteer Opportunity</DialogTitle>
          <Image
            src={logoSrc}
            alt={opportunityDetails.organization?.title}
            width={150}
            height={52}
            className="mb-3 rounded-lg"
          />
          <h2 className="text-base sm:text-xl font-bold text-center">
            Let&apos;s confirm some details...
          </h2>
        </DialogHeader>

        <div className="flex-1 flex flex-col justify-between w-full max-w-[500px] pl-4">
          <div className="flex flex-col items-center">
            <p className="text-center mb-4 text-sm sm:text-base text-gray-600 px-4">
              Here are the opportunity details for{" "}
              <Link
                href={`/find-opportunity/opportunity/details/${opportunityDetails.id}`}
                className="text-blue-600 font-semibold"
              >
                {opportunityDetails.title}
              </Link>{" "}
              with{" "}
              <Link
                href={`/view-profile/organisation/details/${opportunityDetails.organization?.id}`}
                className="text-blue-600 font-semibold"
              >
                {opportunityDetails.organization?.title}
              </Link>
            </p>

            <div className="space-y-4 w-full px-4 sm:px-0 pl-4">
              {/* Location */}
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <strong className="block text-gray-900 text-sm mb-1">
                    Location
                  </strong>
                  <span className="text-sm">{opportunityDetails.location}</span>
                </div>
              </div>

              {/* Start Date & Time */}
              {fullOpportunity?.date?.start_date && (
                <div className="flex items-start gap-3 text-gray-600">
                  <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900 text-sm mb-1">
                      Start Date
                    </strong>
                    <span className="text-sm">
                      {new Date(
                        fullOpportunity.date.start_date
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}

              {fullOpportunity?.time?.start_time && (
                <div className="flex items-start gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900 text-sm mb-1">
                      Start Time
                    </strong>
                    <span className="text-sm">
                      {formatTimeToAMPM(fullOpportunity.time.start_time)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-6 px-4">
              <p className="text-sm sm:text-[14px] text-gray-600 break-words">
                Click the button below to secure your volunteer role
              </p>

              <div className="flex items-center justify-center gap-2 mt-4 mb-6">
                <input
                  type="checkbox"
                  id="understand-checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                />
                <label
                  htmlFor="understand-checkbox"
                  className="text-gray-600 text-sm"
                >
                  I understand and agree to the opportunity details
                </label>
              </div>

              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white w-full max-w-[250px] h-10 text-sm font-medium"
                onClick={handleApply}
                disabled={!isChecked || applyMutation.isPending}
              >
                {applyMutation.isPending ? "Applying..." : "Count me in!!"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
