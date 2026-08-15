"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** "join" = applying to opportunity; "view-profile" = generic/org profile; "view-volunteer-profile" = volunteer profile */
    context?: "join" | "view-profile" | "view-org-profile" | "view-volunteer-profile" | null;
}

export default function SignupModal({ isOpen, onClose, context = "join" }: SignupModalProps) {
    const isViewProfile = context === "view-profile" || context === "view-org-profile" || context === "view-volunteer-profile";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    {isViewProfile ? (
                        <>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <DialogTitle className="text-left">Sign up to View Profile</DialogTitle>
                            </div>
                            <DialogDescription className="text-left mt-2">
                                {context === "view-volunteer-profile" 
                                    ? "Create a free account to view full volunteer profiles and connect with them."
                                    : "Create a free account to view full organisation profiles and apply for opportunities."
                                }
                            </DialogDescription>
                        </>
                    ) : (
                        <>
                            <DialogTitle>Join to Apply</DialogTitle>
                            <DialogDescription>
                                You need to be a registered volunteer to apply for opportunities.
                                Create an account to get started!
                            </DialogDescription>
                        </>
                    )}
                </DialogHeader>
                <div className="flex flex-col gap-3 pt-2">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                        <Link href="/signup">Sign up as Volunteer</Link>
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Log in
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
