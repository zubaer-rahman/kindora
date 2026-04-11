import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FormattedMessageProps {
    content: string;
    isOwnMessage: boolean;
}

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s]+\.[^\s]+|https?:\/\/[^\s]+/;
const MENTION_REGEX = /\B@[a-zA-Z0-9_]+/;

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, isOwnMessage }) => {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);

    const normalizeUrl = (url: string) => {
        if (url.startsWith("www.")) return `https://${url}`;
        return url;
    };

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
        e.preventDefault();
        setPendingUrl(normalizeUrl(url));
        setIsAlertOpen(true);
    };

    const confirmLeave = () => {
        if (pendingUrl) {
            window.open(pendingUrl, "_blank", "noopener,noreferrer");
        }
        setIsAlertOpen(false);
        setPendingUrl(null);
    };

    // Check if the content is an SVG
    const trimmedContent = content.trim();
    const isSvg = trimmedContent.startsWith("<svg") && trimmedContent.endsWith("</svg>");

    if (isSvg) {
        return (
            <div
                className={cn(
                    "max-w-full overflow-x-auto p-2 rounded-lg bg-white/10",
                    !isOwnMessage && "bg-gray-50"
                )}
                dangerouslySetInnerHTML={{ __html: trimmedContent }}
            />
        );
    }

    // Split content by both URLs and Mentions
    // Match URLs (with protocol or starting with www.) or Mentions
    const parts = content.split(/((?:https?:\/\/|www\.)[^\s]+\.[^\s]+|https?:\/\/[^\s]+|(?:\B@[a-zA-Z0-9_]+))/g);

    return (
        <>
            <p className="break-words text-sm sm:text-base leading-relaxed">
                {parts.map((part, index) => {
                    if (URL_REGEX.test(part)) {
                        const normalizedPart = normalizeUrl(part);
                        return (
                            <a
                                key={index}
                                href={normalizedPart}
                                onClick={(e) => handleLinkClick(e, part)}
                                className={`${isOwnMessage ? "underline text-blue-100" : "underline text-blue-600"
                                    } hover:opacity-80 transition-opacity`}
                            >
                                {part}
                            </a>
                        );
                    }
                    if (MENTION_REGEX.test(part)) {
                        return (
                            <span
                                key={index}
                                className={`font-semibold ${isOwnMessage ? "text-blue-200" : "text-blue-600"
                                    }`}
                            >
                                {part.replace(/_/g, ' ')}
                            </span>
                        );
                    }
                    return part;
                })}
            </p>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Leaving Kindora</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to leave Kindora to visit an external link:
                            <span className="block mt-2 font-mono text-xs break-all text-gray-700 bg-gray-50 p-2 rounded">
                                {pendingUrl}
                            </span>
                            <br />
                            Are you sure you want to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingUrl(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmLeave}>Proceed</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default FormattedMessage;
