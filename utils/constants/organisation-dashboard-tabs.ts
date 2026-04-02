import { Briefcase, Users, Archive } from "lucide-react";

export const ORGANISATION_DASHBOARD_TABS = [
  {
    key: "open",
    label: "Open opportunity posts",
    icon: Briefcase,
    emptyState: {
      title: "No open opportunities",
      description:
        "You haven't created any open opportunities yet. Start by creating your first opportunity to attract volunteers.",
    },
  },
  {
    key: "active",
    label: "Active volunteers",
    icon: Users,
    emptyState: {
      title: "No active volunteers",
      description:
        "You don't have any active volunteers working on your opportunities yet. Once volunteers are recruited, they will appear here.",
    },
  },
  {
    key: "archived",
    label: "Archived opportunity posts",
    icon: Archive,
    emptyState: {
      title: "No archived opportunities",
      description:
        "You haven't archived any opportunities yet. Archived opportunities will appear here for future reference.",
    },
  },
] as const;

export type OrganisationDashboardTabKey =
  (typeof ORGANISATION_DASHBOARD_TABS)[number]["key"]; 