"use client";

import { useEffect, useMemo } from "react";
import { MapPin, Calendar, Users, Target, ExternalLink, Mail, Phone, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import Loading from "@/app/loading";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { formatTimeToAMPM } from "@/utils/helpers/formatTime";
import { formatDistanceToNow } from "date-fns";
import { ApplyButton } from "@/components/buttons/ApplyButton";
import { PostSidebar } from "@/components/features/shared/PostSidebar";
import { useFavorite } from "@/hooks/useFavorite";
import { IoArrowBackOutline } from "react-icons/io5";
import { OpportunityInfoGrid } from "@/components/features/opportunities/opportunity-details/OpportunityInfoGrid";
import { OpportunityContactInfo } from "@/components/features/opportunities/opportunity-details/OpportunityContactInfo";

interface OpportunityDrawerProps {
  opportunityId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OpportunityDrawer({
  opportunityId,
  isOpen,
  onClose,
}: OpportunityDrawerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isOrganisation = session?.user?.role === "admin";
  const axiosAuth = useAxiosAuth();

  // Favorite functionality for sidebar button
  const { isFavorite, isLoading: isFavoriteLoading, isToggling, toggleFavorite } = useFavorite(opportunityId);

  // Fetch opportunity data
  const {
    data: opportunity,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: async () => {
      const res = await axiosAuth.get(`/api/v1/opportunities/${opportunityId}`);
      return res.data.data;
    },
    enabled: !!opportunityId && isOpen,
  });

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!opportunityId) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Drawer - Compact design with sidebar matching dashboard theme */}
      <div
        className={`fixed top-0 right-0 h-full bg-card z-50 shadow-2xl w-full md:w-[900px] max-w-[95vw] flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Upwork-style Header - Sticky inside scroll container for perfect alignment */}
          <div className="sticky top-0 bg-card px-6 py-4 flex items-center lg:gap-6 z-20 flex-shrink-0">
            <div className="flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="p-2 -ml-2 hover:bg-muted cursor-pointer text-primary transition-colors"
              >
                <IoArrowBackOutline className="text-2xl" />
              </Button>
            </div>

            {/* Invisible divider to match content area layout for perfect alignment */}
            <div className="hidden lg:block w-[1px] flex-shrink-0"></div>

            <div className="lg:w-[300px] lg:flex-shrink-0 flex justify-center">
              <a
                href={`/opportunities/${opportunity?._id}?referrer_url_path=${encodeURIComponent(pathname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open opportunity in a new window</span>
              </a>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <Loading size="medium">
                <p className="text-gray-600 mt-2 text-sm">Loading...</p>
              </Loading>
            </div>
          ) : error || !opportunity ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
              <p className="text-destructive mb-4 text-sm">Error loading opportunity</p>
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          ) : (
            <div className="px-4 sm:px-6 pb-8">
              <div className="flex flex-col lg:flex-row gap-6 max-w-full">
                {/* Main Content */}
                <div className="flex-1 pt-4 sm:pt-6 min-w-0 max-w-full space-y-4">
                  {/* Title and Metadata */}
                  <div className="space-y-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      {opportunity.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">Posted {formatDistanceToNow(opportunity.createdAt, { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-muted-foreground/70" />
                        <span>{opportunity.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Info Grid - Compact */}
                  <OpportunityInfoGrid
                    date={opportunity.date}
                    time={opportunity.time}
                    numberOfVolunteers={opportunity.number_of_volunteers}
                    commitmentType={opportunity.commitment_type}
                  />
                  {/* Description - Compact */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                    <div 
                      className="prose prose-sm max-w-none text-foreground/90 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: opportunity.description || "" }}
                    />
                  </div>
                  {/* Categories and Skills - Compact */}
                  {(opportunity.category?.length > 0 || opportunity.required_skills?.length > 0) && (
                    <div className="space-y-2 pt-2 border-t border-border">


                      {opportunity.required_skills?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1.5">Skills We're looking for</p>
                          <div className="flex flex-wrap gap-1.5">
                            {opportunity.required_skills.map((skill: string, index: number) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs font-normal px-2 py-0.5"
                              >
                                {skill.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Requirements - Compact */}
                  {opportunity.requirements && opportunity.requirements.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Requirements</p>
                      <div className="flex flex-wrap gap-1.5">
                        {opportunity.requirements.map((requirement: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs font-normal px-2 py-0.5 bg-secondary/50 text-secondary-foreground border-secondary flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3 h-3 flex-shrink-0"
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
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}



                  {/* Contact Info - Compact */}
                  <OpportunityContactInfo
                    emailContact={opportunity.email_contact}
                    phoneContact={opportunity.phone_contact}
                    externalEventLink={opportunity.external_event_link}
                  />

                  {/* Posted Date */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Posted {formatDistanceToNow(opportunity.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block w-[1px] bg-border flex-shrink-0"></div>
                <div className="lg:w-[300px] pt-4 sm:pt-6 lg:flex-shrink-0 lg:max-w-[300px] min-w-0">
                  <div className="space-y-6">

                    {/* Action Buttons */}
                    {!isOrganisation && opportunity.created_by?._id !== session?.user?.id && (
                      <div className="space-y-3">
                        <ApplyButton
                          opportunityId={opportunity._id}
                          opportunityDetails={{
                            id: opportunity._id,
                            title: opportunity.title,
                            organization: {
                              title: opportunity.organization_profile?.title || "Organization",
                              id: opportunity.organization_profile?._id || "",
                            },
                            location: opportunity.location,
                          }}
                          opportunityDate={opportunity.date}
                          className="w-full h-10 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full transition-all"
                        />
                        <Button
                          variant="outline"
                          className="w-full h-10 text-sm border-primary text-primary hover:bg-primary/10 flex items-center justify-center gap-2 font-semibold rounded-full transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite();
                          }}
                          disabled={isFavoriteLoading || isToggling}
                        >
                          {isFavoriteLoading || isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Heart
                              className={`h-4 w-4 ${isFavorite ? "fill-primary" : ""}`}
                            />
                          )}
                          <span>{isFavorite ? "Saved" : "Save opportunity"}</span>
                        </Button>
                      </div>
                    )}

                    <PostSidebar
                      organization_profile={
                        opportunity.organization_profile as unknown as import("@/types/api/organization-profile").IOrgnizationPofile
                      }
                      userRole={isOrganisation ? "organization" : "volunteer"}
                      className="max-w-full [&_button]:max-w-full [&_a]:max-w-full [&_button]:break-words [&_a]:break-words"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

