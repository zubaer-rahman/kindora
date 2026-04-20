"use client";

import { useParams } from "next/navigation";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import OrganizationProfileView from "@/components/layout/organisation/OrganizationProfileView";
import { VolunteerProfile } from "@/components/layout/volunteer/profile/VolunteerProfile";
import NotFound from "@/app/not-found";

export default function ProfileDetailPage() {
  const params = useParams();
  const profileId = params?._id as string;
  const profileFor = params?.["profile_for"] as string;
  
  console.log({ profileFor, profileId });

  if (!profileId) {
    return (
      <ProtectedLayout>
        <div className="max-w-[1440px] mx-auto px-4 mb-8 pt-20">
          <h1 className="text-2xl font-bold">Profile not found</h1>
        </div>
      </ProtectedLayout>
    );
  }

  const renderProfile = () => {
    switch (profileFor) {
      case "volunteer":
        return <VolunteerProfile volunteerId={profileId} />;
      case "organisation":
        return <OrganizationProfileView organizerId={profileId} />;
      default:
        return (
          <div className="max-w-[1440px] mx-auto px-4 mb-8 pt-20">
            <NotFound/>
          </div>
        );
    }
  };

  return <ProtectedLayout>{renderProfile()}</ProtectedLayout>;
}
