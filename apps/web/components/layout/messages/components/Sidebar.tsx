import React from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Conversation, Group } from "@/types/message";
import ConversationList from "./ConversationList";
import UserList from "./UserList";
import { Search } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  conversations: Conversation[] | undefined;
  groups: Group[] | undefined;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  isLoadingConversations: boolean;
  isLoadingGroups: boolean;
  availableUsers: { _id: string; name: string; image: string; role: string }[] | undefined;
  isLoadingUsers: boolean;
  userRole?: string;
  onGroupCreated: () => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  activeTab,
  setActiveTab,
  conversations,
  groups,
  selectedUserId,
  onSelectUser,
  isLoadingConversations,
  isLoadingGroups,
  availableUsers,
  isLoadingUsers,
  userRole,
  onGroupCreated
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredConversations = conversations?.filter(conv =>
    conv.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  const filteredGroups = groups?.filter(group =>
    group.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  const filteredUsers = availableUsers?.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false
  );

  return (
    <aside className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm relative z-10">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 pb-2 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Messages</h2>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-4 py-3 pb-3 border-b border-gray-100">
        <div className="relative group">
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-11 bg-gray-50 border-none rounded-2xl text-sm transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-blue-100 group-hover:bg-gray-100/80"
          />
          <Search
            className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-gray-500 transition-colors"
          />
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col overflow-hidden">
          {userRole !== "volunteer" && (
            <div className="flex-shrink-0 px-4 pt-2 pb-2">
              <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-gray-100/50 rounded-xl">
                <TabsTrigger
                  value="conversations"
                  className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                >
                  Chats
                </TabsTrigger>
                <TabsTrigger
                  value="applicants"
                  className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                >
                  People
                </TabsTrigger>
              </TabsList>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden mt-2">
            <TabsContent value="conversations" className="mt-0 h-full overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
              <ConversationList
                conversations={filteredConversations}
                groups={filteredGroups}
                selectedUserId={selectedUserId}
                onSelectUser={onSelectUser}
                isLoading={isLoadingConversations}
                isLoadingGroups={isLoadingGroups}
                onCreateGroup={onGroupCreated}
                userRole={userRole}
              />
            </TabsContent>

            {userRole !== "volunteer" && (
              <TabsContent value="applicants" className="mt-0 h-full overflow-hidden">
                <UserList
                  users={filteredUsers}
                  onSelectUser={onSelectUser}
                  isLoading={isLoadingUsers}
                />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;