import React from "react";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "./Avatar";
import CreateGroupDialog from "./CreateGroupDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Group, Conversation } from "@/types/message";

interface ConversationListProps {
  conversations: Conversation[] | undefined;
  groups: Group[] | undefined;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  isLoading: boolean;
  isLoadingGroups: boolean;
  onCreateGroup: () => void;
  userRole?: string;
}

export const ConversationList: React.FC<ConversationListProps> = React.memo(
  ({
    conversations,
    groups,
    selectedUserId,
    onSelectUser,
    isLoading,
    isLoadingGroups,
    onCreateGroup,
    userRole,
  }) => {
    // Sort conversations by last message time
    const sortedConversations = conversations?.sort((a, b) => {
      const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
      const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
      return timeB - timeA;
    });

    // Sort groups by creation date first, then by last message time
    const sortedGroups = groups?.sort((a, b) => {
      // First sort by creation date (newest first)
      const creationTimeA = new Date(a.createdAt || 0).getTime();
      const creationTimeB = new Date(b.createdAt || 0).getTime();
      if (creationTimeA !== creationTimeB) {
        return creationTimeB - creationTimeA;
      }
      // If creation dates are equal, sort by last message time
      const messageTimeA = new Date(a.lastMessage?.createdAt || 0).getTime();
      const messageTimeB = new Date(b.lastMessage?.createdAt || 0).getTime();
      return messageTimeB - messageTimeA;
    });

    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Groups Section Header - Always visible for non-volunteers */}
        {userRole !== "volunteer" && (
          <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between border-b border-border">
            <h3 className="text-sm font-medium text-muted-foreground">Groups</h3>
            <CreateGroupDialog
              onGroupCreated={onCreateGroup}
            />
          </div>
        )}

        <div className="flex-1 h-full overflow-y-auto">
          <div className="px-2">
            {isLoading || isLoadingGroups ? (
              <div className="p-2">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                  >
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-4 w-2/3 max-w-[150px]" />
                      <Skeleton className="h-3 w-1/2 max-w-[110px]" />
                    </div>
                    <Skeleton className="h-3 w-8 flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : !sortedConversations?.length && !sortedGroups?.length ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No conversations
              </div>
            ) : (
              <div>
                {/* Groups List */}
                {sortedGroups && sortedGroups.length > 0 && (
                  <div className="divide-y divide-border">
                    {sortedGroups.map((group) => (
                      <button
                        key={group._id}
                        onClick={() => onSelectUser(group._id)}
                        className={cn(
                          "w-[calc(100%-16px)] mx-2 my-1 p-3 rounded-2xl text-left transition-all duration-200 group relative border border-transparent",
                          selectedUserId === group._id
                            ? "bg-accent/80 border-primary/20 shadow-sm"
                            : "hover:bg-muted hover:border-border"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <h3 className={cn(
                                "font-semibold truncate text-sm sm:text-base max-w-[120px] sm:max-w-[150px]",
                                selectedUserId === group._id ? "text-primary" : "text-foreground"
                              )}>
                                {group.name.length > 15 ? `${group.name.substring(0, 15)}...` : group.name}
                              </h3>
                              {group.unreadCount > 0 && (
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2 shadow-sm min-w-[18px] text-center">
                                  {group.unreadCount}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center mb-0.5">
                              <p className="text-xs text-muted-foreground font-medium">
                                {group.members.length} members
                              </p>
                              {group.lastMessage && (
                                <p className="text-[10px] text-muted-foreground font-medium">
                                  {format(
                                    new Date(group.lastMessage.createdAt),
                                    "MMM d"
                                  )}
                                </p>
                              )}
                            </div>
                            {group.lastMessage && (
                              <p
                                className={cn(
                                  "text-xs sm:text-sm truncate pr-4",
                                  group.lastMessage.isRead
                                    ? "text-muted-foreground font-normal"
                                    : "text-foreground font-semibold"
                                )}
                              >
                                {group.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Individual Conversations Section */}
                {sortedConversations && sortedConversations.length > 0 && (
                  <>
                    <div className="px-4 py-2 mt-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Direct Messages
                      </h3>
                    </div>
                    <div className="divide-y divide-border">
                      {sortedConversations.map((conversation) => (
                      <button
                        key={conversation._id}
                        onClick={() => onSelectUser(conversation._id)}
                        className={cn(
                          "w-[calc(100%-16px)] mx-2 my-1 p-3 rounded-2xl text-left transition-all duration-200 group relative border border-transparent",
                          selectedUserId === conversation._id
                            ? "bg-accent/80 border-primary/20 shadow-sm"
                            : "hover:bg-muted hover:border-border"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 transition-transform group-hover:scale-105">
                            <Avatar
                              name={conversation.user.organization_profile?.title || conversation.user.name}
                              image={conversation.user.image}
                              size={44}
                              className={selectedUserId === conversation._id ? "ring-2 ring-primary/20" : ""}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <h3 className={cn(
                                "font-semibold truncate text-sm sm:text-base",
                                selectedUserId === conversation._id ? "text-primary" : "text-foreground"
                              )}>
                                {conversation.user.name}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2 shadow-sm min-w-[18px] text-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <div className="flex justify-between items-center mb-0.5">
                              <p className="text-xs text-muted-foreground font-medium truncate max-w-[100px] sm:max-w-[120px]">
                                {conversation.user.organization_profile?.title || conversation.user.role}
                              </p>
                              {conversation.lastMessage && (
                                <p className="text-[10px] text-muted-foreground font-medium flex-shrink-0">
                                  {format(
                                    new Date(
                                      conversation.lastMessage.createdAt
                                    ),
                                    "MMM d"
                                  )}
                                </p>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p
                                className={cn(
                                  "text-xs sm:text-sm truncate pr-2",
                                  conversation.lastMessage.isRead
                                    ? "text-muted-foreground font-normal"
                                    : "text-foreground font-semibold"
                                )}
                              >
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ConversationList.displayName = "ConversationList";

export default ConversationList;
