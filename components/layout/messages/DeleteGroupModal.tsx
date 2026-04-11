'use client'
import React from 'react';
import ConfirmationDialog from "@/components/modals/ConfirmationDialog";

interface DeleteGroupModalProps {
  groupName: string;
  onClose: () => void;
  onDelete: () => void;
}

export const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  groupName,
  onClose,
  onDelete,
}) => {
  return (
    <ConfirmationDialog
      isOpen={true}
      onOpenChange={() => onClose()}
      title="Delete Group"
      description={`Are you sure you want to delete the group "${groupName}"? This action cannot be undone.`}
      confirmText="Delete Group"
      onConfirm={onDelete}
      variant="destructive"
    />
  );
};

export default DeleteGroupModal;