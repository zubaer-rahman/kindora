import React from "react";
import { Users } from "lucide-react";
import Avatar from "./Avatar";
import type { Group } from "@/types/message";

interface ConversationHeaderProps {
  user: {
    name: string;
    image?: string;
    members?: number;
  } | Group;
  isGroup?: boolean;
  onDeleteGroup?: () => void;
}

const getTextSizeClass = (name: string) => {
  if (!name) return 'text-sm sm:text-base';
  if (name.length <= 15) return 'text-sm sm:text-base';
  if (name.length <= 25) return 'text-xs sm:text-sm';
  return 'text-xs';
};

const getMemberCount = (user: ConversationHeaderProps['user']): number => {
  if ('members' in user && Array.isArray(user.members)) {
    return user.members.length;
  }
  if ('members' in user && typeof user.members === 'number') {
    return user.members;
  }
  return 0;
};

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  user,
  isGroup = false,
  onDeleteGroup
}) => {
  const userName = 'name' in user ? user.name : '';
  const userImage = 'image' in user ? user.image : undefined;
  const memberCount = getMemberCount(user);

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white">
      {/* Left side - Avatar and Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isGroup ? (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
        ) : (
          <div className="flex-shrink-0">
            <Avatar name={userName || ''} image={userImage} size={32} />
          </div>
        )}
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className={`font-semibold truncate text-gray-900 ${isGroup ? getTextSizeClass(userName) : 'text-sm sm:text-base'}`}>
              {userName}
            </h2>

          </div>
          
          {isGroup && (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {memberCount} member{memberCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - Action Buttons */}
      <div className="flex items-center gap-2">
        {isGroup && onDeleteGroup && (
          <button
            onClick={onDeleteGroup}
            className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Delete Group
          </button>
        )}
      </div>
    </div>
  );
};

export default ConversationHeader;