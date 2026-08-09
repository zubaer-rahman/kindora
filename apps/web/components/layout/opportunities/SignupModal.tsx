"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join to Apply</DialogTitle>
                    <DialogDescription>
                        You need to be a registered volunteer to apply for opportunities.
                        Create an account to get started!
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <Button asChild className="w-full bg-[#1570EF] hover:bg-[#1570EF]/90">
                        <Link href="/signup">Sign up as Volunteer</Link>
                    </Button>
                    <div className="text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#1570EF] hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
