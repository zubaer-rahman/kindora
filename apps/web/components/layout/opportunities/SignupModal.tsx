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
                    <Button asChild className="w-full bg-primary hover:bg-primary/90">
                        <Link href="/signup">Sign up as Volunteer</Link>
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline">
                            Log in
                        </Link>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
