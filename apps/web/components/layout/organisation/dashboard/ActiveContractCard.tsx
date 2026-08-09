'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/ui/UserAvatar';
import { DASHBOARD_CARD_HEIGHT, DASHBOARD_CARD_STYLES } from './constants';

interface ActiveContract {
  id: string;
  profileImg?: string;
  jobTitle: string;
  freelancerName: string;
  startedAt: string;
  opportunityTitle?: string;
  opportunityId?: string;
  uniqueKey: string;
  opportunities: Array<{
    id: string;
    title: string;
  }>;
}

interface ActiveContractCardProps {
  contract: ActiveContract;
}

export const ActiveContractCard: React.FC<ActiveContractCardProps> = ({
  contract,
}) => {
  const router = useRouter();
console.log("image",  contract?.profileImg);

  return (
    <div className={`${DASHBOARD_CARD_STYLES} ${DASHBOARD_CARD_HEIGHT}`}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 mr-3">
              <UserAvatar
                user={{ name: contract.freelancerName, image: contract.profileImg }}
                size={40}
                className="rounded-full"
              />
            </div>
            <h3 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => {
                router.push(`/find-volunteer/volunteer/details/${contract.id}`);
              }}
            >
              {contract.freelancerName}
            </h3>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-600 font-medium mb-1">
            Active Opportunities ({contract.opportunities.length}):
          </p>
          <div className="space-y-1">
            {contract.opportunities.slice(0, 6).map((opportunity) => (
              <p 
                key={opportunity.id}
                className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 transition-colors"
                onClick={() => {
                  router.push(`/organisation/opportunities/${opportunity.id}`);
                }}
              >
                • {opportunity.title}
              </p>
            ))}
            {contract.opportunities.length > 6 && (
              <p 
                className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 transition-colors font-medium"
                onClick={() => {
                  router.push(`/find-volunteer/volunteer/details/${contract.id}`);
                }}
              >
                +{contract.opportunities.length - 6} more
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4">
        </div>
      </div>
    </div>
  );
};

export default ActiveContractCard; 