"use client";
import React from "react";
import SharedDashboard from "@/components/features/shared/dashboard/SharedDashboard";
import { useMentorOpportunities } from "./hooks/useMentorOpportunities";

export default function MentorDashboard() {
  const mentorOpportunities = useMentorOpportunities();

  return (
    <SharedDashboard
      role="mentor"
      {...mentorOpportunities}
    />
  );
}
