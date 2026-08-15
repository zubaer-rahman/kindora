"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import toast from "react-hot-toast";
import { messageService } from "@/services/message.service";

interface GroupMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string | null;
  onMessageSent: () => void;
}

export function GroupMessageModal({
  isOpen,
  onClose,
  groupId,
  onMessageSent,
}: GroupMessageModalProps) {
  const [groupMessage, setGroupMessage] = useState("");
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const sendGroupMessageMutation = useMutation({
    mutationFn: (payload: { groupId: string; content: string }) => 
      messageService.sendGroupMessage(axiosAuth, { groupId: payload.groupId, content: payload.content }),
    onSuccess: () => {
      toast.success("Message sent successfully!");
      setGroupMessage("");
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      onMessageSent();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send message");
    },
  });

  const handleSendGroupMessage = () => {
    if (!groupId || !groupMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    sendGroupMessageMutation.mutate({
      groupId,
      content: groupMessage,
    });
  };

  const handleSkip = () => {
    onClose();
    onMessageSent();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Welcome Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Type your welcome message to the group..."
            value={groupMessage}
            onChange={(e) => setGroupMessage(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="w-full sm:w-auto"
            >
              Skip
            </Button>
            <Button
              onClick={handleSendGroupMessage}
              disabled={
                !groupMessage.trim() || sendGroupMessageMutation.isPending
              }
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700"
            >
              {sendGroupMessageMutation.isPending
                ? "Sending..."
                : "Send & Go to Messages"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 