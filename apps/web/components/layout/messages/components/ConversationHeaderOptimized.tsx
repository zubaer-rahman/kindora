import React from "react";
import { Users, Trash2, MoreHorizontal, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Avatar from "./Avatar";
import GroupMemberManagement from "./GroupMemberManagement";
import type { Group } from "@/types/message";
import Link from "next/link";

interface ConversationHeaderProps {
  user: {
    name: string;
    image?: string;
    avatar?: string; // Keep for backward compatibility
    members?: number;
    _id?: string; // User ID for profile link
  } | Group;
  isGroup?: boolean;
  onDeleteGroup?: () => void;
  onDeleteConversation?: () => void;
  onGroupUpdated?: () => void;
  userRole?: string;
  currentUserId?: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export const ConversationHeaderOptimized: React.FC<ConversationHeaderProps> = ({
  user,
  isGroup,
  onDeleteGroup,
  onDeleteConversation,
  onGroupUpdated,
  userRole,
  currentUserId,
  onBack,
  showBackButton = false
}) => {
  if (!user) return null;

  // Helper function to truncate long names based on screen size
  const truncateName = (name: string) => {
    if (!name) return "";
    // On mobile, truncate more aggressively
    const maxLength = typeof window !== 'undefined' && window.innerWidth < 640 ? 15 : 25;
    if (name.length <= maxLength) return name;
    return `${name.substring(0, maxLength)}...`;
  };

  // Get member count for groups
  const getMemberCount = () => {
    if (!isGroup || !('members' in user) || !Array.isArray(user.members)) return 0;
    return user.members?.length || 0;
  };

  // Get admin count for groups (count unique admins to avoid duplicates)
  const getAdminCount = () => {
    if (!isGroup || !('admins' in user) || !Array.isArray(user.admins)) return 0;
    const adminIds = user.admins?.map(admin => admin._id) || [];
    const uniqueAdminIds = [...new Set(adminIds)];
    return uniqueAdminIds.length;
  };

  return (
    <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 border-b border-gray-200 bg-white min-h-[60px] sm:min-h-[64px]">
      {/* Left side - Back button (mobile) and Avatar/Info */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Back button for mobile */}
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="md:hidden h-8 w-8 p-0 flex-shrink-0 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to conversations</span>
          </Button>
        )}

        {/* Avatar/Group Icon */}
        {isGroup ? (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          </div>
        ) : (
          <div className="flex-shrink-0">
            <Avatar name={user.name || ''} image={'image' in user ? user.image : user.avatar} size={32} />
          </div>
        )}
        
        {/* User/Group Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <h2 className="font-semibold text-sm sm:text-base lg:text-lg truncate text-gray-900 leading-tight">
              {isGroup ? truncateName(user.name) : truncateName(user.name)}
            </h2>
            {isGroup && getAdminCount() > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                {getAdminCount()} admin{getAdminCount() !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Group member info - responsive layout */}
          {isGroup && (
            <div className="flex items-center gap-1 sm:gap-2 mt-0.5 flex-wrap">
              <p className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                <Users className="h-3 w-3" />
                {getMemberCount()} member{getMemberCount() !== 1 ? 's' : ''}
              </p>
              {getAdminCount() > 0 && getMemberCount() > getAdminCount() && (
                <>
                  <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                  <p className="text-xs text-gray-500 flex-shrink-0 hidden sm:block">
                    {getMemberCount() - getAdminCount()} regular
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {/* Group Member Management - Responsive button */}
        {isGroup && onGroupUpdated && user && 'members' in user && Array.isArray(user.members) && (
          <div className="hidden sm:block">
            <GroupMemberManagement 
              group={user as Group} 
              onGroupUpdated={onGroupUpdated}
              opportunityId={(user as Group).opportunityId}
            />
          </div>
        )}
        
        {/* Mobile Group Member Management - Simplified */}
        {isGroup && onGroupUpdated && user && 'members' in user && Array.isArray(user.members) && (
          <div className="sm:hidden">
            <GroupMemberManagement 
              group={user as Group} 
              onGroupUpdated={onGroupUpdated}
              opportunityId={(user as Group).opportunityId}
            />
          </div>
        )}
        
        {/* Action Menu - Dropdown for better mobile experience */}
        {(userRole !== "volunteer" || (userRole === "volunteer" && isGroup && 'createdBy' in user && user.createdBy === currentUserId)) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              {!isGroup && 'image' in user && user._id && (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/view-profile/volunteer/details/${user._id}`}
                      className="flex items-center cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {isGroup && onDeleteGroup && (
                <>
                  <DropdownMenuItem
                    onClick={onDeleteGroup}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Group
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {!isGroup && onDeleteConversation && (
                <>
                  <DropdownMenuItem
                    onClick={onDeleteConversation}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Conversation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default ConversationHeaderOptimized; 