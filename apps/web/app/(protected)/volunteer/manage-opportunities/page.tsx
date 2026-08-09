import ProtectedLayout from "@/components/layout/ProtectedLayout";
import ManageOpportunities from "@/components/layout/volunteer/manage-opportunities";
import { Suspense } from "react";

export default function ManageOpportunitiesPage() {
    return (
        <ProtectedLayout>
            <Suspense fallback={<div>Loading...</div>}>
                <ManageOpportunities />
            </Suspense>
        </ProtectedLayout>
    );
}
