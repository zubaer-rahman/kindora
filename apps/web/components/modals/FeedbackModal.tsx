"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createFeedbackMutation = trpc.feedback.createFeedback.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      setMessage("");
      onClose();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit feedback";
      toast.error(errorMessage);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    if (message.length > 1000) {
      toast.error("Feedback must be less than 1000 characters");
      return;
    }

    setIsSubmitting(true);
    createFeedbackMutation.mutate({ message: message.trim() });
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Share Your Feedback
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-message" className="text-sm font-medium text-gray-700">
              Your feedback helps us improve the platform
            </Label>
            <Textarea
              id="feedback-message"
              placeholder="Tell us what you think about the platform, report bugs, or suggest improvements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="text-xs text-gray-500 text-right">
              {message.length}/1000 characters
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}