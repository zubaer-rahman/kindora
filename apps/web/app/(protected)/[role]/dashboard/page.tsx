import { notFound, redirect } from "next/navigation";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import OrganisationDashboard from "@/components/features/organization/dashboard/OrganizationDashboard";
import SystemAdminDashboard from "@/components/features/system-admin/dashboard/SystemAdminDashboard";
import SystemAdminShell from "@/components/features/system-admin/SystemAdminShell";

type DashboardPageProps = {
  params: Promise<{ role: string }>;
};

const DashboardPage = async ({ params }: DashboardPageProps) => {
  const resolvedParams = await params;
  const rawRole = resolvedParams.role;
  const role = rawRole === "organization" || rawRole === "admin" ? "organisation" : rawRole;

  if (role === "volunteer") {
    redirect("/find-opportunity/most-recent");
  }

  if (role === "mentor") {
    redirect("/find-volunteer");
  }

  switch (role) {
    case "organisation":
      return (
        <ProtectedLayout>
          <OrganisationDashboard />
        </ProtectedLayout>
      );
    case "system-admin":
      return (
        <SystemAdminShell>
          <SystemAdminDashboard />
        </SystemAdminShell>
      );
    default:
      notFound();
  }
};

export default DashboardPage;
