"use client";

import React from "react";
import { useParams } from "next/navigation";
import { VolunteerProfile } from "@/components/layout/volunteer/profile/VolunteerProfile";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

export default function VolunteerProfilePage() {
  const params = useParams();
  const volunteerId = params.id as string;

  return (
    <ProtectedLayout>
      <VolunteerProfile volunteerId={volunteerId} />
    </ProtectedLayout>
  );
}
