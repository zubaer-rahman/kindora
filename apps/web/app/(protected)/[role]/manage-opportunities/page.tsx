import { notFound, redirect } from "next/navigation";
import ManageOpportunities from "@/components/features/opportunities/ManageOpportunities";
import VolunteerManageOpportunities from "@/components/features/volunteer/manage-opportunities/ManageOpportunities";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { Suspense } from "react";
type ManageOpportunitiesPageProps = {
  params: Promise<{ role: string }>;
};

const ManageOpportunitiesPage = async ({
  params,
}: ManageOpportunitiesPageProps) => {
  const resolvedParams = await params;
  const rawRole = resolvedParams.role;
  const role =
    rawRole === "organization" || rawRole === "admin"
      ? "organisation"
      : rawRole;

  switch (role) {
    case "volunteer":
      return (
        <ProtectedLayout>
          <Suspense fallback={<div>Loading...</div>}>
            <VolunteerManageOpportunities />
          </Suspense>
        </ProtectedLayout>
      );
    case "mentor":
    case "organisation":
      return <ManageOpportunities role={role as "mentor" | "organisation"} />;
    default:
      notFound();
  }
};

export default ManageOpportunitiesPage;
