'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";

interface Applicant {
  id: string;
  name: string;
  profileImg: string | null;
}

interface MessageApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant | null;
}

export default function MessageApplicantModal({ isOpen, onClose, applicant }: MessageApplicantModalProps) {
  const [message, setMessage] = useState("");
  const utils = trpc.useUtils();

  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully!");
      setMessage("");
      onClose();
      utils.messages.getConversations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleSendMessage = () => {
    if (!message.trim() || !applicant) return;

    sendMessageMutation.mutate({
      receiverId: applicant.id,
      content: message.trim(),
    });
  };

  if (!applicant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Message {applicant.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label
              htmlFor="message"
              className="text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="w-full"
            />
          </div>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 