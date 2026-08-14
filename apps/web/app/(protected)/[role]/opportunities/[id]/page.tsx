"use client";

import OpportunityDetailContainer from "@/components/features/shared/OpportunityDetailContainer";
import { notFound, useParams } from "next/navigation";

export default function OpportunityDetailPage() {
  const params = useParams();
  const urlRole = params.role as string;

  if (urlRole !== "organisation" && urlRole !== "mentor") {
    notFound();
  }

  return <OpportunityDetailContainer userRole={urlRole} />;
}
