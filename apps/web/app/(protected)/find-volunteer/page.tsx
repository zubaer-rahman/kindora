"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import SearchVolunteer from "@/components/features/organization/search-volunteer/SearchVolunteer";

export default function FindVolunteerPage() {
    return (
        <ProtectedLayout>
            <SearchVolunteer />
        </ProtectedLayout>
    );
}
