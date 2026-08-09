"use client";

import React from "react";
import Loading from "@/app/loading";
import EmptyState from "./EmptyState";
import { LucideIcon, AlertCircle, Search } from "lucide-react";

interface QueryStateWrapperProps {
    isLoading: boolean;
    error: any;
    data: any;
    notFound?: boolean;
    loadingMessage?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: LucideIcon;
    notFoundTitle?: string;
    notFoundDescription?: string;
    notFoundIcon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
}

export default function QueryStateWrapper({
    isLoading,
    error,
    data,
    notFound = false,
    loadingMessage = "Loading...",
    emptyTitle = "No data available",
    emptyDescription = "There is no information to display at this time.",
    emptyIcon = Search,
    notFoundTitle = "Not found",
    notFoundDescription = "The item you're looking for doesn't exist.",
    notFoundIcon = AlertCircle,
    children,
    className,
}: QueryStateWrapperProps) {
    if (notFound) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <EmptyState
                    icon={notFoundIcon}
                    title={notFoundTitle}
                    description={notFoundDescription}
                    showAction={false}
                    className={className}
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loading size="medium">
                    <p className="text-gray-600 mt-2">{loadingMessage}</p>
                </Loading>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <EmptyState
                    icon={AlertCircle}
                    title="Error loading data"
                    description={error.message || "Something went wrong while fetching the data."}
                    showAction={false}
                    className={className}
                />
            </div>
        );
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    showAction={false}
                    className={className}
                />
            </div>
        );
    }

    return <>{children}</>;
}
