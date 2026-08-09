import React, { useState } from "react";
import { X, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import type { Group } from "@/types/message";

interface CreateGroupDialogProps {
  onGroupCreated: () => void;
}

export const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({ onGroupCreated }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const utils = trpc.useUtils();
  const { data: availableUsersData } = trpc.users.getAvailableUsers.useQuery({
    page: 1,
    limit: 50, // Get more users for group creation
    search: searchQuery || undefined,
    includeMentors: true, // Show both volunteers and mentors when adding members
  }, {
    enabled: open,
  });

  const availableUsers = availableUsersData?.users || [];

  // Remove client-side filtering since it's now handled server-side
  const filteredUsers = availableUsers;

  const selectedUsersList = availableUsers?.filter(user =>
    selectedUsers.includes(user._id)
  ) || [];

  const createGroupMutation = trpc.messages.createGroup.useMutation({
    onSuccess: (newGroup) => {
      setOpen(false);
      setName("");
      setSearchQuery("");
      setSelectedUsers([]);
      utils.messages.getGroups.setData(undefined, (oldGroups: Group[] | undefined) => {
        if (!oldGroups) return [newGroup];
        return [newGroup, ...oldGroups];
      });
      onGroupCreated();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create group");
    },
  });

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedUsers.length === 0) return;

    createGroupMutation.mutate({
      name,
      memberIds: selectedUsers,
      isOrganizationGroup: false
    });
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(id => id !== userId));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">New Group</span>
          <span className="sm:hidden">Group</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateGroup} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for your group"
              required
              className="h-9 sm:h-10 text-sm sm:text-base"
            />
          </div>

          {selectedUsersList.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Members ({selectedUsersList.length})</Label>
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
                      onClick={() => removeUser(user._id)}
                      className="p-1 hover:bg-red-50 rounded-full transition-colors flex-shrink-0 ml-2"
                    >
                      <X className="h-3 w-3 text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Add Members</Label>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members to add..."
                className="h-9 sm:h-10 pl-9 text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="mt-2 border rounded-lg divide-y max-h-[200px] sm:max-h-[250px] overflow-y-auto">
              {filteredUsers?.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No users found
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
                        <span className="block text-xs text-gray-500 truncate">{user.role}</span>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 sm:space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="px-3 sm:px-4 text-sm sm:text-base h-9 sm:h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || selectedUsers.length === 0 || createGroupMutation.isPending}
              className="px-3 sm:px-4 text-sm sm:text-base h-9 sm:h-10"
            >
              {createGroupMutation.isPending ? (
                <span className="flex items-center gap-1 sm:gap-2">
                  <span className="animate-spin text-xs sm:text-sm">⏳</span>
                  <span className="hidden sm:inline">Creating...</span>
                  <span className="sm:hidden">Creating</span>
                </span>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog; 