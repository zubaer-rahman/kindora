'use client'
import React from 'react';
import ConfirmationDialog from "@/components/modals/ConfirmationDialog";

interface DeleteConversationModalProps {
  userName: string;
  onClose: () => void;
  onDelete: () => void;
  onOpenChange?: (open: boolean) => void;
}

export const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  userName,
  onClose,
  onDelete,
  onOpenChange,
}) => {
  return (
    <ConfirmationDialog
      isOpen={true}
      onOpenChange={(open) => {
        onClose();
        if (onOpenChange) onOpenChange(open);
      }}
      title="Delete Conversation"
      description={`Are you sure you want to delete the conversation with "${userName}"? This action cannot be undone and all messages will be permanently removed.`}
      confirmText="Delete Conversation"
      onConfirm={onDelete}
      variant="destructive"
    />
  );
};

export default DeleteConversationModal;