"use client";

import OpportunityDetailContainer from "@/components/layout/shared/OpportunityDetailContainer";
import { useSession } from "next-auth/react";

export default function OpportunityDetailPage() {
    const { data: session } = useSession();
    const userRole = session?.user?.role === "admin" ? "organisation" : "volunteer";

    return <OpportunityDetailContainer userRole={userRole} />;
}
