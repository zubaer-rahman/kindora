"use client";

import ProtectedLayout from "@/components/layout/ProtectedLayout";
import SearchOpportunity from "@/components/layout/volunteer/SearchOpportunity"; import { useParams } from "next/navigation";
import React, { Suspense } from "react";
import SearchVolunteer from "@/components/layout/organisation/searchVolunteer";

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
