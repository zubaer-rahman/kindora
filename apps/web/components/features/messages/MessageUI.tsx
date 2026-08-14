"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DeleteGroupModal from "./DeleteGroupModal";
import Sidebar from "./ui/Sidebar";
import ChatArea from "./ui/ChatArea";
import MessageInput from "./ui/MessageInput";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useAvailableUsers } from "@/hooks/useAvailableUsers";
import { useMessageActions } from "@/hooks/useMessageActions";
import { Conversation, Group } from "@/types/message";

interface MessageUIProps {
  initialUserId?: string | null;
}

export const MessageUI: React.FC<MessageUIProps> = ({ initialUserId }) => {
  const { data: session } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("conversations");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
      setActiveTab("applicants");
    }
  }, [initialUserId]);

  const {
    conversations,
    groups,
    isLoadingConversations,
    isLoadingGroups,
    markAsReadMutation,
    invalidateGroups,
  } = useConversations();
  const { availableUsers, isLoadingUsers } = useAvailableUsers(
    !!session && session.user?.role !== "volunteer",
  );
  const { deleteGroupMutation, deleteConversationMutation } =
    useMessageActions();

  const selectedConversation = conversations?.find(
    (c) => c._id === selectedUserId,
  );
  const selectedGroup = (groups as Group[] | undefined)?.find(
    (g) => g._id === selectedUserId,
  );
  const isGroup = selectedGroup !== undefined;
  const canDeleteGroup =
    isGroup &&
    (session?.user?.role !== "volunteer" ||
      (session?.user?.role === "volunteer" &&
        selectedGroup?.createdBy === session?.user?.id));

  const {
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleLoadMore,
    flattenedMessages,
    isLoadingMessages,
    hasMore,
    isLoadingMore,
    isSending,
    isTargetTyping,
    updateTypingStatus,
  } = useMessages(selectedUserId, isGroup);

  const buildSelectedConversation = (): Conversation | Group | undefined => {
    if (isGroup) return selectedGroup;
    if (selectedConversation || !selectedUserId) return selectedConversation;
    const user = availableUsers.find((u) => u._id === selectedUserId) || {
      _id: selectedUserId,
      name: "New Conversation",
      image: "",
      role: "volunteer",
    };
    return {
      _id: selectedUserId,
      name: user.name,
      user,
      lastMessage: { isRead: true, createdAt: new Date().toISOString() },
      unreadCount: 0,
    };
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    if (!groups?.some((g) => g._id === userId)) {
      markAsReadMutation.mutate({ conversationId: userId });
    }
  };

  const handleDeleteConversation = () => {
    if (selectedUserId) {
      deleteConversationMutation.mutate(
        { conversationId: selectedUserId },
        { onSuccess: () => setSelectedUserId(null) },
      );
    }
  };

  const handleDeleteGroup = () => {
    if (selectedUserId) {
      deleteGroupMutation.mutate(
        { groupId: selectedUserId },
        {
          onSuccess: () => {
            setSelectedUserId(null);
            setShowDeleteModal(false);
          },
        },
      );
    }
  };

  const handleBackToConversations = () => {
    setSelectedUserId(null);
  };

  const renderSidebar = () => (
    <Sidebar
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      conversations={conversations}
      groups={groups}
      selectedUserId={selectedUserId}
      onSelectUser={handleSelectUser}
      isLoadingConversations={isLoadingConversations}
      isLoadingGroups={isLoadingGroups}
      availableUsers={availableUsers}
      isLoadingUsers={isLoadingUsers}
      userRole={session?.user?.role}
      onGroupCreated={invalidateGroups}
    />
  );

  const renderMessageThread = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 relative">
        <ChatArea
          messages={flattenedMessages}
          isLoadingMessages={isLoadingMessages}
          selectedConversation={buildSelectedConversation()}
          session={session}
          isGroup={isGroup}
          onDeleteGroup={
            canDeleteGroup ? () => setShowDeleteModal(true) : undefined
          }
          onDeleteConversation={handleDeleteConversation}
          onGroupUpdated={invalidateGroups}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          isSending={isSending}
          selectedConversationId={selectedUserId}
          onBack={handleBackToConversations}
          isTargetTyping={isTargetTyping}
        />
      </div>
      <div className="flex-shrink-0 border-t bg-card">
        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSendMessage={handleSendMessage}
          isSending={isSending}
          mentionees={isGroup ? selectedGroup?.members || [] : []}
          onTypingStatusChange={updateTypingStatus}
          isGroup={isGroup}
          currentUserId={session?.user?.id}
        />
      </div>
    </div>
  );

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Desktop Layout - Side by side */}
      <div className="hidden md:flex w-full">
        <div className="flex-shrink-0 w-80 lg:w-96">{renderSidebar()}</div>

        <main className="flex-1 flex flex-col min-w-0">
          {selectedUserId ? (
            renderMessageThread()
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Select a conversation
                </h3>
                <p className="text-sm">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Layout - Single view */}
      <div className="md:hidden w-full">
        {selectedUserId ? (
          renderMessageThread()
        ) : (
          <div className="h-full overflow-hidden">{renderSidebar()}</div>
        )}
      </div>

      {showDeleteModal && selectedGroup && (
        <DeleteGroupModal
          groupName={selectedGroup.name}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteGroup}
        />
      )}
    </div>
  );
};

export default MessageUI;
