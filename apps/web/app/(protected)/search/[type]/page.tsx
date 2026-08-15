"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import SearchOpportunity from "@/components/features/volunteer/search-opportunity/SearchOpportunity"; import { useParams } from "next/navigation";
import React, { Suspense } from "react";
import SearchVolunteer from "@/components/features/organization/search-volunteer/SearchVolunteer";
import SearchOrganization from "@/components/features/organization/search-organization/SearchOrganization";

const SearchTypePage = () => {
    const params = useParams();
    const type = params.type as string;

    const renderContent = () => {
        if (type === "opportunities") {
            return <SearchOpportunity />;
        }
        if (type === "volunteers") {
            return <SearchVolunteer />;
        }
        if (type === "organizations" || type === "organisations") {
            return <SearchOrganization />;
        }
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Invalid search type: {type}</p>
            </div>
        );
    };

    return (
        <ProtectedLayout>
            <Suspense fallback={<div>Loading search...</div>}>
                {renderContent()}
            </Suspense>
        </ProtectedLayout>
    );
};

export default SearchTypePage;
