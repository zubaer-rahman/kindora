"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxiosAuth } from '@/hooks/useAxiosAuth';
import { toast } from 'react-hot-toast';
import ConfirmationDialog from '@/components/modals/ConfirmationDialog';
import { Pencil, Trash2, FileText, ArchiveRestore } from 'lucide-react';
import ActionDropdown, { ActionDropdownOption } from '@/components/buttons/ActionDropdown';
import { opportunityService } from '@/services/opportunity.service';

interface OpportunityActionsDropdownProps {
  opportunityId: string;
  activeTab: string;
  size?: 'sm' | 'default';
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  actionsMode?: 'organisation' | 'mentor';
}

export default function OpportunityActionsDropdown({
  opportunityId,
  activeTab,
  size = 'default',
  className = '',
  orientation = 'horizontal',
  actionsMode = 'organisation',
}: OpportunityActionsDropdownProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'archive' | 'unarchive' | 'delete' | null>(null);

  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();

  const invalidateList = () => {
    if (actionsMode === 'mentor') {
      queryClient.invalidateQueries({ queryKey: ['mentorOpportunitiesAll'] });
      queryClient.invalidateQueries({ queryKey: ['mentorOpportunities'] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['organizationOpportunities'] });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: () => opportunityService.delete(axiosAuth, opportunityId),
    onSuccess: () => {
      invalidateList();
      setIsDeleteDialogOpen(false);
      toast.success('Opportunity deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete opportunity');
      setIsDeleteDialogOpen(false);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => opportunityService.archive(axiosAuth, opportunityId),
    onSuccess: () => {
      invalidateList();
      setIsDeleteDialogOpen(false);
      toast.success('Opportunity archived successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to archive opportunity');
      setIsDeleteDialogOpen(false);
    },
  });

  const unarchiveMutation = useMutation({
    mutationFn: () => opportunityService.unarchive(axiosAuth, opportunityId),
    onSuccess: () => {
      invalidateList();
      setIsDeleteDialogOpen(false);
      toast.success('Opportunity unarchived successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to unarchive opportunity');
      setIsDeleteDialogOpen(false);
    },
  });

  const viewPath = actionsMode === 'mentor' ? '/volunteer/mentor-opportunity' : '/organisation/opportunities';
  const handleView = () => router.push(`${viewPath}/${opportunityId}`);
  const handleEdit = () => router.push(`/organisation/opportunities/${opportunityId}/edit`);
  const handleArchiveOrDelete = () => {
    setDropdownOpen(false);
    setPendingAction(activeTab === 'archived' ? 'delete' : 'archive');
    setIsDeleteDialogOpen(true);
  };

  const handleUnarchive = () => {
    setDropdownOpen(false);
    setPendingAction('unarchive');
    setIsDeleteDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setDropdownOpen(false);
      setPendingAction(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const confirmDeleteOrArchive = () => {
    if (pendingAction === 'delete') {
      deleteMutation.mutate();
    } else if (pendingAction === 'archive') {
      archiveMutation.mutate();
    } else if (pendingAction === 'unarchive') {
      unarchiveMutation.mutate();
    }
    setPendingAction(null);
    setIsDeleteDialogOpen(false);
  };

  const options: ActionDropdownOption[] = [
    {
      label: actionsMode === 'mentor' ? 'View' : 'View Application',
      icon: FileText,
      onClick: handleView,
    },
    ...(actionsMode !== 'mentor' ? [{
      label: 'Edit',
      icon: Pencil,
      onClick: handleEdit,
    }] : []),
    ...(activeTab === 'archived' ? [
      {
        label: 'Unarchive',
        icon: ArchiveRestore,
        onClick: handleUnarchive,
        variant: 'default' as const,
      },
      {
        label: 'Delete',
        icon: Trash2,
        onClick: handleArchiveOrDelete,
        variant: 'destructive' as const,
      },
    ] : [
      {
        label: 'Archive',
        icon: Trash2,
        onClick: handleArchiveOrDelete,
        variant: 'destructive' as const,
      },
    ]),
  ];

  return (
    <>
      <ActionDropdown
        options={options}
        orientation={orientation}
        size={size}
        className={className}
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
      />
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={handleDialogOpenChange}
        title="Are you sure?"
        description={
          pendingAction === 'delete'
            ? 'This will delete the opportunity. The data will be preserved but not visible to anyone.'
            : pendingAction === 'unarchive'
            ? 'This will restore the opportunity from the archive and make it visible again.'
            : 'This will move the opportunity to the archive. You can delete it from there.'
        }
        confirmText={
          pendingAction === 'delete'
            ? 'Delete'
            : pendingAction === 'unarchive'
            ? 'Unarchive'
            : 'Archive'
        }
        onConfirm={confirmDeleteOrArchive}
        variant="destructive"
        isLoading={archiveMutation.isPending || unarchiveMutation.isPending || deleteMutation.isPending}
      />
    </>
  );
}
