import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";

interface Volunteer {
  _id: string;
  name: string;
  avatar?: string;
  role: string;
  volunteer_profile?: {
    student_type?: "yes" | "no";
    course?: string;
    availability_date?: {
      start_date?: string;
      end_date?: string;
    };
    interested_on?: string[];
    bio?: string;
  };
}

interface MessageDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  volunteer: Volunteer | null;
}

export default function MessageDialog({
  isOpen,
  onOpenChange,
  volunteer,
}: MessageDialogProps) {
  const [message, setMessage] = useState("");

  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully!");
      onOpenChange(false);
      setMessage("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  const handleSubmitMessage = () => {
    if (!volunteer) return;

    sendMessageMutation.mutate({
      receiverId: volunteer._id,
      content: message,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Message {volunteer?.name}
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
            onClick={handleSubmitMessage}
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