"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import OrganizationProfile from "@/components/features/organization/OrganizationProfile";
import { VolunteerProfileForm } from "@/components/features/volunteer/VolunteerProfileForm";
import { MentorProfileForm } from "@/components/features/mentor/MentorProfileForm";
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
