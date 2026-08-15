"use client";

import { useParams, notFound } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/app/loading";

import OpportunityDetailContainer from "@/components/features/shared/OpportunityDetailContainer";
import OrganizationProfileView from "@/components/features/organization/OrganizationProfileView";
import { VolunteerProfile } from "@/components/features/volunteer/profile/VolunteerProfile";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import NotFound from "@/app/not-found";

export default function DynamicDetailPage() {
  const params = useParams();
  const type = params.role as string;
  const id = params.id as string;
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loading size="medium" />;
  }

  if (type === "opportunities") {
    let userRole = (session?.user as any)?.role?.toLowerCase() || "volunteer";
    if (userRole === "organization" || userRole === "admin") {
      userRole = "organisation";
    }
    return (
      <OpportunityDetailContainer
        userRole={userRole as "volunteer" | "mentor" | "organisation"}
      />
    );
  }

  if (!id) {
    return (
      <ProtectedLayout>
        <div className="max-w-[1440px] mx-auto px-4 mb-8 pt-20">
          <h1 className="text-2xl font-bold">Not found</h1>
        </div>
      </ProtectedLayout>
    );
  }

  const renderProfile = () => {
    switch (type) {
      case "volunteers":
      case "mentors":
        return <VolunteerProfile volunteerId={id} />;
      case "organisations":
        return <OrganizationProfileView organizerId={id} />;
      default:
        return (
          <div className="max-w-[1440px] mx-auto px-4 mb-8 pt-20">
            <NotFound />
          </div>
        );
    }
  };

  return <ProtectedLayout>{renderProfile()}</ProtectedLayout>;
}
