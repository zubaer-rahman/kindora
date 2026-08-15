"use client";
import React from "react";
import SharedDashboard from "@/components/features/shared/dashboard/SharedDashboard";
import { useOrganizationOpportunities } from "./hooks/useOrganizationOpportunities";
import { useOpportunityMutations } from "./hooks/useOpportunityMutations";

const OrganisationDashboard = () => {
  const orgOpportunities = useOrganizationOpportunities();
  const orgMutations = useOpportunityMutations();

  return (
    <SharedDashboard
      role="organisation"
      {...orgOpportunities}
      archiveMutation={orgMutations.archiveMutation}
      unarchiveMutation={orgMutations.unarchiveMutation}
      deleteMutation={orgMutations.deleteMutation}
    />
  );
};

export default OrganisationDashboard;
