"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import OrganizationProfile from "../../../../components/layout/organisation/OrganizationProfile";
import { VolunteerProfileForm } from "../../../../components/layout/volunteer/VolunteerProfileForm";
import { MentorProfileForm } from "../../../../components/layout/mentor/MentorProfileForm";
import { useParams } from "next/navigation";
import NotFound from "@/app/not-found";

export default function ProfilePage() {
  const params = useParams();
  const role = params.role as string;

  const renderProfile = () => {
    switch (role) {
      case "volunteer":
        return <VolunteerProfileForm />;
      case "mentor":
        return <MentorProfileForm />;
      case "organisation":
        return <OrganizationProfile />;
      default:
        return <NotFound />;
    }
  };

  return <ProtectedLayout>{renderProfile()}</ProtectedLayout>;
}
