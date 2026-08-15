"use client";

import OrganizationOpportunities from "@/components/features/volunteer/home-page/OrganizationOpportunities";
import { useQuery } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { profileService } from "@/services/profile.service";
import BackButton from "@/components/buttons/BackButton";
import QueryStateWrapper from "@/components/common/QueryStateWrapper";
import OrganizationProfileBanner from "./OrganizationProfileBanner";

interface OrganizationProfileViewProps {
  organizerId: string;
}

export default function OrganizationProfileView({ organizerId }: OrganizationProfileViewProps) {
  const axiosAuth = useAxiosAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["organizationProfile", organizerId],
    queryFn: () => profileService.getOrganizationProfileById(axiosAuth, organizerId),
    enabled: !!organizerId,
  });

  const organizationProfile = data?.organizationProfile;

  return (
    <QueryStateWrapper
      isLoading={isLoading}
      error={error}
      data={data}
      notFound={!organizerId}
      loadingMessage="Loading organization profile..."
      notFoundTitle="Organizer not found"
      notFoundDescription="The organization you're looking for doesn't exist."
      emptyTitle="No data available"
      emptyDescription="This organization profile is empty."
    >
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          {organizationProfile && (
            <>
              <BackButton />
              {/* Banner Component */}
              <OrganizationProfileBanner organizationProfile={organizationProfile} />

              {/* Main Content */}
              <div className="space-y-6 sm:space-y-8">
                {/* About Section */}
                {organizationProfile.bio && (
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
                      About Us
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-justify break-words">
                      {organizationProfile.bio}
                    </p>
                  </div>
                )}

                {/* Location & Details */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
                    Location & Details
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground">Address</h3>
                      <div className="space-y-1 text-sm sm:text-base text-muted-foreground break-words">
                        <p>{organizationProfile.area}</p>
                        <p>{organizationProfile.state}, Australia</p>
                      </div>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                      <h3 className="text-sm sm:text-base font-semibold text-foreground">Organisation Type</h3>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-muted text-foreground border border-border">
                        {organizationProfile.type?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Volunteer Opportunities Section */}
                <div className="pt-6 sm:pt-8 border-t border-border">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                    Volunteer Opportunities
                  </h2>
                  <OrganizationOpportunities organizationId={organizerId} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </QueryStateWrapper>
  );
}