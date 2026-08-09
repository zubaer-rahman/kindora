'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Trash2, Pencil, MapPin, ArchiveRestore } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatTimeToAMPM } from '@/utils/helpers/formatTime';
import { Opportunity } from '@/types/opportunities';
import { DASHBOARD_CARD_HEIGHT, DASHBOARD_CARD_STYLES } from './constants';
import OrganizationAvatar from '@/components/ui/OrganizationAvatar';
import ActionDropdown, { ActionDropdownOption } from '@/components/buttons/ActionDropdown';

interface OpportunityCardProps {
  opportunity: Opportunity;
  tab: string;
  onDelete: (opportunity: Opportunity) => void;
  onArchive: (opportunity: Opportunity) => void;
  onUnarchive: (opportunity: Opportunity) => void;
  orientation?: 'horizontal' | 'vertical';
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  tab,
  onDelete,
  onArchive,
  onUnarchive,
  orientation = 'horizontal',
}) => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleArchive = () => {
    setDropdownOpen(false);
    onArchive(opportunity);
  };

  const handleUnarchive = () => {
    setDropdownOpen(false);
    onUnarchive(opportunity);
  };

  const handleDelete = () => {
    setDropdownOpen(false);
    onDelete(opportunity);
  };

  const options: ActionDropdownOption[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: () => router.push(`/organisation/opportunities/${opportunity._id}/edit`),
    },
    ...(tab !== 'archived'
      ? [
          {
            label: 'Archive',
            icon: Trash2,
            onClick: handleArchive,
            variant: 'destructive' as const,
            showSeparatorBefore: true,
          },
        ]
      : [
          {
            label: 'Unarchive',
            icon: ArchiveRestore,
            onClick: handleUnarchive,
            variant: 'default' as const,
            showSeparatorBefore: true,
          },
          {
            label: 'Delete',
            icon: Trash2,
            onClick: handleDelete,
            variant: 'destructive' as const,
          },
        ]),
  ];

  return (
    <div className={`${DASHBOARD_CARD_STYLES} ${DASHBOARD_CARD_HEIGHT}`}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 mr-3">
              <OrganizationAvatar
                organization={{
                  title: opportunity?.organization_profile?.title || "Organization",
                  profile_img: opportunity?.organization_profile?.profile_img
                }}
                size={40}
                className="rounded-full"
              />
            </div>
            <h3
              className="text-lg font-semibold cursor-pointer hover:text-blue-600"
              onClick={() =>
                router.push(
                  `/organisation/opportunities/${opportunity._id}`
                )
              }
            >
              {opportunity.title}
            </h3>
          </div>
          <ActionDropdown
            options={options}
            orientation={orientation}
            size="default"
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
          />
        </div>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1 text-blue-500" />
          <span>{opportunity.location}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          <Badge
            variant="outline"
            className="ml-2 px-2 py-0.5 text-xs"
          >
            {opportunity.commitment_type === "workbased"
              ? "Work based"
              : "Event based"}
          </Badge>
          {opportunity.category.slice(0, 1).map(
            (cat: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs font-normal"
              >
                {cat}
              </Badge>
            )
          )}
          {opportunity.category.length > 1 && (
            <Badge
              variant="secondary"
              className="text-xs font-normal text-gray-500"
            >
              +{opportunity.category.length - 1} more
            </Badge>
          )}
        </div>

        <div className="flex-1">
          <div
            className="text-sm text-gray-600 line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: opportunity.description,
            }}
          />
        </div>

        <div className="mt-auto pt-4">
          <div className="text-xs text-gray-500 mb-2">
            Posted{" "}
            {formatDistanceToNow(opportunity.createdAt, {
              addSuffix: true,
            })}
          </div>
          {opportunity.date?.start_date && (
            <div className="text-xs text-gray-500">
              Starts: {new Date(opportunity.date.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })} at {opportunity.time?.start_time ? formatTimeToAMPM(opportunity.time.start_time) : 'Time TBD'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard; 