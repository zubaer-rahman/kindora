"use client";

import OpportunityDetailContainer from "@/components/features/shared/OpportunityDetailContainer";
import { useParams, notFound } from "next/navigation";

export default function OpportunityDetailPage() {
    const params = useParams();
    const urlRole = params.role as string;

    if (urlRole !== "organisation" && urlRole !== "mentor" && urlRole !== "volunteer") {
        notFound();
    }

    return <OpportunityDetailContainer userRole={urlRole} />;
}
