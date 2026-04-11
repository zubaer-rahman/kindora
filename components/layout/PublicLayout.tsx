"use client";

import { Fragment } from "react";
import LandingNavbar from "@/components/navbar/LandingNavbar";
import NewFooter from "@/components/layout/landing/home/NewFooter";
import { FeedbackButton } from "@/components/FeedbackButton";

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    return (
        <Fragment>
            <div className="flex flex-col min-h-screen">
                <LandingNavbar />
                <main className="flex-1 relative">{children}</main>
                <NewFooter />
            </div>
            <FeedbackButton />
        </Fragment>
    );
}
