"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (groupId: string) => void;
  recruitedApplicants?: Array<{ id: string; name: string }>;
  opportunityTitle?: string;
  opportunityId?: string;
}

export function CreateGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
  recruitedApplicants = [],
  opportunityTitle = "",
  opportunityId,
}: CreateGroupModalProps) {
  const utils = trpc.useUtils();

  const createGroupMutation = trpc.messages.createGroup.useMutation({
    onSuccess: (data) => {
      toast.success("Group created successfully!");
      onGroupCreated(data._id);
      utils.messages.getGroups.invalidate();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create group");
    },
  });

  const handleConfirmCreateGroup = () => {
    if (!recruitedApplicants.length) {
      toast.error("No recruited volunteers to create a group");
      return;
    }

    const groupName = `${opportunityTitle} - Recruits`;
    const memberIds = recruitedApplicants.map(applicant => applicant.id);

    createGroupMutation.mutate({
      name: groupName,
      memberIds,
      description: `Group for recruited volunteers of ${opportunityTitle}`,
      isOrganizationGroup: false,
      opportunityId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Create a group with all the recruited volunteers for this
            opportunity?
          </p>
          {recruitedApplicants.length > 0 && (
            <div className="text-sm text-gray-500">
              <p>This will create a group with {recruitedApplicants.length} recruited volunteer(s):</p>
              <ul className="mt-2 space-y-1">
                {recruitedApplicants.slice(0, 3).map((applicant) => (
                  <li key={applicant.id} className="text-gray-600">• {applicant.name}</li>
                ))}
                {recruitedApplicants.length > 3 && (
                  <li className="text-gray-600">• ... and {recruitedApplicants.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmCreateGroup}
              disabled={createGroupMutation.isPending || !recruitedApplicants.length}
              className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700"
            >
              {createGroupMutation.isPending ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 