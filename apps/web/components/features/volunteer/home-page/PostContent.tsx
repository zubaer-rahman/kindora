
import { ApplyButton } from "@/components/buttons/ApplyButton";
import { FavoriteButton } from "@/components/buttons/FavoriteButton";
import { useSession } from "next-auth/react";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";
import { MapPin, Users, Calendar, Clock, ExternalLink, Target, Mail, Phone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { toast } from "react-hot-toast";
import ConfirmationDialog from "@/components/modals/ConfirmationDialog";
import { useState, useMemo } from "react";
import { applicationService } from "@/services/application.service";

type Opportunity = {
  _id: string;
  title: string;
  description: string;
  category: string[];
  required_skills: string[];
  requirements?: string[];
  commitment_type: string;
  location: string;
  number_of_volunteers: number;
  date: {
    start_date: Date;
    end_date?: Date;
  };
  time: {
    start_time: string;
    end_time?: string;
  };
  organization_profile: {
    _id: string;
    title: string;
    profile_img?: string;
    contact_email?: string;
    phone_number?: string;
    website?: string;
    area?: string;
    state?: string;
    bio?: string;
  };
  created_by?: {
    _id: string;
    name: string;
  };
  banner_img?: string;
  external_event_link?: string;
  email_contact?: string;
  phone_contact?: string;
};

interface PostContentProps {
  opportunity: Opportunity;
}

export function PostContent({ opportunity, }: PostContentProps) {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const isOrganisation = session?.user?.role === "admin";
  const isCreator = session?.user?.id === opportunity.created_by?._id;

  const opportunityDetails = {
    id: opportunity._id,
    title: opportunity.title,
    organization: {
      title: opportunity.organization_profile.title,
      id: opportunity.organization_profile._id,
    },
    location: opportunity.location,
  };

  const { data: applicationStatus, refetch: refetchStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ["applicationStatus", opportunity._id],
    queryFn: () => applicationService.getStatus(axiosAuth, opportunity._id),
    enabled: !!session?.user?.id
  });
  const revokeMutation = useMutation({
    mutationFn: (payload: { opportunityId: string }) => applicationService.withdraw(axiosAuth, payload.opportunityId),
    onSuccess: () => {
      toast.success("Application withdrawn successfully");
      queryClient.invalidateQueries({ queryKey: ["activeApplications"] });
      queryClient.invalidateQueries({ queryKey: ["applicationsActiveCount"] });
      queryClient.invalidateQueries({ queryKey: ["applicationsRecent"] });
      queryClient.invalidateQueries({ queryKey: ["applicationsRecentCount"] });
      refetchStatus();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to withdraw application");
    },
  });
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const handleWithdraw = () => {
    revokeMutation.mutate({ opportunityId: opportunity._id });
    setIsWithdrawDialogOpen(false);
  };

  return (
    <div className="flex-1 w-full lg:max-w-3xl space-y-8">


      {/* Key Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
            <p className="text-sm font-medium text-foreground">{opportunity.location}</p>
          </div>
        </div>

        {/* Start Date & Time (together) */}
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Start</p>
            <p className="text-sm font-medium text-foreground">
              {opportunity.date.start_date && (
                <span>{new Date(opportunity.date.start_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}</span>
              )}
              {opportunity.time.start_time && (
                <span>
                  {opportunity.date.start_date ? ' at ' : ''}
                  {formatTimeToAMPM(opportunity.time.start_time)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* End Date & Time (if present) */}
        {(opportunity.date.end_date || opportunity.time.end_time) && (
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">End</p>
              <p className="text-sm font-medium text-foreground">
                {opportunity.date.end_date && (
                  <span>{new Date(opportunity.date.end_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}</span>
                )}
                {opportunity.time.end_time && (
                  <span>
                    {opportunity.date.end_date ? ' at ' : ''}
                    {formatTimeToAMPM(opportunity.time.end_time)}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Available Spots</p>
            <p className="text-sm font-medium text-foreground">{opportunity.number_of_volunteers} spots</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Commitment</p>
            <p className="text-sm font-medium text-foreground">
              {opportunity.commitment_type === 'workbased' ? 'Work based' : 'Event based'}
            </p>
          </div>
        </div>

        {opportunity.external_event_link && (
          <div className="flex items-center gap-3">
            <ExternalLink className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">External Link</p>
              <a
                href={opportunity.external_event_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Event
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      {(opportunity.email_contact || opportunity.phone_contact) && (
        <div className="flex flex-col sm:flex-row gap-6">
          {opportunity.email_contact && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                <a
                  href={`mailto:${opportunity.email_contact}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {opportunity.email_contact}
                </a>
              </div>
            </div>
          )}

          {opportunity.phone_contact && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                <a
                  href={`tel:${opportunity.phone_contact}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {opportunity.phone_contact}
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories and Skills */}
      {(opportunity.category.length > 0 || opportunity.required_skills.length > 0) && (
        <div className="space-y-4">
          {opportunity.category.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Categories</p>
              <div className="flex flex-wrap gap-2">
                {opportunity.category.map((cat, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {opportunity.required_skills.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {opportunity.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-muted text-foreground text-sm rounded-full border border-border font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Requirements */}
      {opportunity.requirements && opportunity.requirements.length > 0 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Requirements</p>
            <div className="flex flex-wrap gap-2">
              {opportunity.requirements.map((requirement, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground text-sm rounded-full border border-border font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {requirement}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Description */}
      <div 
        className="prose prose-sm max-w-none text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: opportunity.description || "" }}
      />

    </div>
  );
}
