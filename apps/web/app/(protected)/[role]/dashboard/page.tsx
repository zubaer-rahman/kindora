import { notFound, redirect } from "next/navigation";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import OrganisationDashboard from "@/components/layout/organisation/dashboard";
import SystemAdminDashboard from "@/components/layout/system-admin/dashboard";
import SystemAdminShell from "@/components/layout/system-admin/SystemAdminShell";

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
