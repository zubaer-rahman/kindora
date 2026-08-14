import SearchVolunteer from "@/components/features/organization/search-volunteer/SearchVolunteer";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import React from "react";

const FindVolunteerPage = () => {
  return (
    <ProtectedLayout>
      <SearchVolunteer />
    </ProtectedLayout>
  );
};

export default FindVolunteerPage;
