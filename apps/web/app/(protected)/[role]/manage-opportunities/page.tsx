import { notFound, redirect } from "next/navigation";
import ManageOpportunities from "@/components/features/opportunities/ManageOpportunities";

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

  if (role === "mentor" || role === "organisation") {
    return <ManageOpportunities role={role as "mentor" | "organisation"} />;
  }

  notFound();
};

export default ManageOpportunitiesPage;
