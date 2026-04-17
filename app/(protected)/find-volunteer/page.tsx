import SearchVolunteer from "@/components/layout/organisation/searchVolunteer";
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
