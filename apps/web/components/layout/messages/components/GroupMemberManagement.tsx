import React, { useState } from "react";
import { X, Search, Crown, UserMinus, UserPlus, Shield, ShieldOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import type { Group } from "@/types/message";
import { useSession } from "next-auth/react";

interface GroupMemberManagementProps {
  group: Group;
  onGroupUpdated: () => void;
  opportunityId?: string; // Add opportunityId to check if user is an opportunity mentor
}

export const GroupMemberManagement: React.FC<GroupMemberManagementProps> = ({ 
  group, 
  onGroupUpdated,
  opportunityId
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { data: session } = useSession();
  const utils = trpc.useUtils();

  // Check if current user is an opportunity mentor for this specific opportunity
  const { data: opportunityMentors } = trpc.mentors.getOpportunityMentors.useQuery(
    { opportunityId: opportunityId || group.opportunityId || "" },
    { enabled: !!(opportunityId || group.opportunityId) }
  );



  const isCurrentUserOpportunityMentor = opportunityMentors?.some(
    (mentor) => mentor.volunteer._id === session?.user?.id
  ) || false;



  // Safety check: ensure group object is valid
  if (!group || !group._id || !group.name) {
    return null;
  }

  // Get available users for adding to group (volunteers and mentors)
  const { data: availableUsersData } = trpc.users.getAvailableUsers.useQuery({
    page: 1,
    limit: 50,
    search: searchQuery || undefined,
    includeMentors: true,
  }, {
    enabled: open,
  });

  const availableUsers = availableUsersData?.users || [];

  // Filter out users who are already members
  const filteredUsers = availableUsers.filter(user => 
    !group.members.some(member => member._id === user._id)
  );

  const selectedUsersList = filteredUsers?.filter(user =>
    selectedUsers.includes(user._id)
  ) || [];

  // Mutations
  const addMemberMutation = trpc.messages.addMember.useMutation({
    onSuccess: () => {
      setSelectedUsers([]);
      onGroupUpdated();
      utils.messages.getGroups.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add member");
    },
  });

  const removeMemberMutation = trpc.messages.removeMember.useMutation({
    onSuccess: () => {
      toast.success("Member removed successfully");
      onGroupUpdated();
      utils.messages.getGroups.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove member");
    },
  });

  const promoteToAdminMutation = trpc.messages.promoteToAdmin.useMutation({
    onSuccess: () => {
      toast.success("Member promoted to admin successfully");
      onGroupUpdated();
      utils.messages.getGroups.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to promote member");
    },
  });

  const demoteFromAdminMutation = trpc.messages.demoteFromAdmin.useMutation({
    onSuccess: () => {
      toast.success("Admin demoted successfully");
      onGroupUpdated();
      utils.messages.getGroups.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to demote admin");
    },
  });

  // Check if current user has permission to manage members
  const canManageMembers = () => {
    if (!session?.user) return false;
    
    const userRole = session.user.role;
    // For base roles: admin and organization can always manage
    const isAdminOrOrganization = userRole === "admin" || userRole === "organization";
    // Check if user is a group admin
    const isGroupAdmin = group.admins?.some(admin => admin._id === session.user.id) || false;
    // Check if user is an opportunity mentor for this specific opportunity
    const isOpportunityMentor = isCurrentUserOpportunityMentor;
    // Check if user is the group creator
    const isGroupCreator = group.createdBy === session.user.id;
    

    
    return isAdminOrOrganization || isGroupAdmin || isOpportunityMentor || isGroupCreator;
  };

  const handleAddMembers = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) return;

    // Add members one by one
    selectedUsers.forEach(userId => {
      addMemberMutation.mutate({
        groupId: group._id,
        memberId: userId,
      });
    });
  };

  const handleRemoveMember = (memberId: string) => {
    removeMemberMutation.mutate({
      groupId: group._id,
      memberId: memberId,
    });
  };

  const handlePromoteToAdmin = (memberId: string) => {
    promoteToAdminMutation.mutate({
      groupId: group._id,
      memberId: memberId,
    });
  };

  const handleDemoteFromAdmin = (memberId: string) => {
    demoteFromAdminMutation.mutate({
      groupId: group._id,
      memberId: memberId,
    });
  };

  const isCurrentUserAdmin = (memberId: string) => {
    return group.admins?.some(admin => admin._id === memberId) || false;
  };

  const isCurrentUser = (memberId: string) => {
    return memberId === session?.user?.id;
  };



  if (!canManageMembers()) {
    return null;
  }

  // Ensure group.members exists before rendering
  if (!group.members || !Array.isArray(group.members)) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Manage Members</span>
          <span className="sm:hidden">Members</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Manage Group Members - {group.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Volunteers Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Current Volunteers ({group.members?.length || 0})
            </Label>
            <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
              {group.members?.map((member) => (
                <div 
                  key={member._id} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Avatar name={member.name} image={member.image} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{member.name}</span>
                        {isCurrentUserAdmin(member._id) && (
                          <Crown className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {isCurrentUserAdmin(member._id)
                          ? (member.role === "volunteer" ? "Mentor" : "Group Admin")
                          : "Member"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {/* Promote/Demote Admin */}
                    {!isCurrentUser(member._id) && (
                      <>
                        {isCurrentUserAdmin(member._id) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDemoteFromAdmin(member._id)}
                            disabled={demoteFromAdminMutation.isPending}
                            className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                            title="Demote from admin"
                          >
                            <ShieldOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePromoteToAdmin(member._id)}
                            disabled={promoteToAdminMutation.isPending}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                            title="Promote to admin"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* Remove Member */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member._id)}
                          disabled={removeMemberMutation.isPending}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Remove member"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Members Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add New Members</Label>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users to add..."
                className="h-9 sm:h-10 pl-9 text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            
            {selectedUsersList.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Users ({selectedUsersList.length})</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 sm:p-3 border rounded-lg bg-gray-50/50">
                  {selectedUsersList.map((user) => (
                    <div 
                      key={`selected-${user._id}`} 
                      className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm border"
                    >
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Avatar name={user.name} image={user.image} size={24} />
                        <span className="text-sm font-medium truncate">{user.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUsers(selectedUsers.filter(id => id !== user._id))}
                        className="p-1 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 ml-2"
                      >
                        <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border rounded-lg divide-y max-h-[200px] sm:max-h-[250px] overflow-y-auto">
              {filteredUsers?.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  {searchQuery ? "No users found" : "No available users to add"}
                </div>
              ) : (
                filteredUsers?.map((user) => (
                  <div 
                    key={user._id} 
                    className={cn(
                      "flex items-center space-x-3 p-2 sm:p-3 hover:bg-gray-50 transition-colors",
                      selectedUsers.includes(user._id) && "bg-blue-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      id={user._id}
                      checked={selectedUsers.includes(user._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user._id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                    />
                    <label htmlFor={user._id} className="flex items-center space-x-2 sm:space-x-3 cursor-pointer flex-1 min-w-0">
                      <Avatar name={user.name} image={user.image} size={28} />
                      <div className="min-w-0 flex-1">
                        <span className="block text-sm font-medium truncate">{user.name}</span>
                        <span className="block text-xs text-gray-500 truncate">
                          {user.role === "volunteer" ? "Volunteer" : "Member"}
                        </span>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-3 sm:px-4 text-sm sm:text-base h-9 sm:h-10"
            >
              Close
            </Button>
            {selectedUsers.length > 0 && (
              <Button 
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0 || addMemberMutation.isPending}
                className="px-3 sm:px-4 text-sm sm:text-base h-9 sm:h-10"
              >
                {addMemberMutation.isPending ? (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <span className="animate-spin text-xs sm:text-sm">⏳</span>
                    <span className="hidden sm:inline">Adding...</span>
                    <span className="sm:hidden">Adding</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 sm:gap-2">
                    <UserPlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Members</span>
                    <span className="sm:hidden">Add</span>
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMemberManagement;