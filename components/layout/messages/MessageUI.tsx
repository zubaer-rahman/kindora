"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import toast from "react-hot-toast";
import DeleteGroupModal from './DeleteGroupModal';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { Group } from "@/types/message";

interface MessageUIProps {
  initialUserId?: string | null;
}

export const MessageUI: React.FC<MessageUIProps> = ({ initialUserId }) => {
  const { data: session } = useSession();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("conversations");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
      setActiveTab("applicants");
    }
  }, [initialUserId]);

  const { conversations, groups, isLoadingConversations, isLoadingGroups, markAsReadMutation } = useConversations();

  const selectedConversation = conversations?.find((c) => c._id === selectedUserId);
  const selectedGroup = (groups as Group[] | undefined)?.find((g) => g._id === selectedUserId);
  const isGroup = selectedGroup !== undefined;



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
    updateTypingStatus
  } = useMessages(selectedUserId, isGroup);

  const { data: availableUsersData, isLoading: isLoadingUsers } = trpc.users.getAvailableUsers.useQuery({
    page: 1,
    limit: 200,
    includeMentors: true, // People tab: show both volunteers and mentors
  }, {
    enabled: !!session && session.user?.role !== "volunteer"
  });

  const availableUsers = availableUsersData?.users || [];



  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    if (!isGroup) {
      markAsReadMutation.mutate({ conversationId: userId });
    } else {
      utils.messages.getGroupMessages.invalidate();
    }
  };

  const handleGroupCreated = () => {
    utils.messages.getGroups.invalidate();
  };

  useEffect(() => {
    if (selectedUserId && isGroup) {
      utils.messages.getGroupMessages.invalidate();
    }
  }, [selectedUserId, isGroup, utils.messages.getGroupMessages]);

  const deleteGroupMutation = trpc.messages.deleteGroup.useMutation({
    onSuccess: () => {
      toast.success("Group deleted successfully");
      setSelectedUserId(null);
      setShowDeleteModal(false);
      utils.messages.getGroups.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete group");
    },
  });

  const deleteConversationMutation = trpc.messages.deleteConversation.useMutation({
    onSuccess: () => {
      toast.success("Conversation deleted successfully");
      setSelectedUserId(null);
      utils.messages.getConversations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete conversation");
    },
  });

  const handleDeleteGroup = () => {
    if (selectedUserId) {
      deleteGroupMutation.mutate({ groupId: selectedUserId });
    }
  };

  const handleConfirmDeleteConversation = () => {
    if (selectedUserId) {
      deleteConversationMutation.mutate({ conversationId: selectedUserId });
    }
  };

  const handleBackToConversations = () => {
    setSelectedUserId(null);
  };

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Desktop Layout - Side by side */}
      <div className="hidden md:flex w-full">
        {/* Sidebar */}
        <div className="flex-shrink-0 w-80 lg:w-96">
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
            onGroupCreated={handleGroupCreated}
          />
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {selectedUserId ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0 relative">
                <ChatArea
                  messages={flattenedMessages}
                  isLoadingMessages={isLoadingMessages}
                  selectedConversation={
                    isGroup
                      ? selectedGroup
                      : selectedConversation ||
                      (selectedUserId
                        ? {
                          _id: selectedUserId,
                          user:
                            availableUsers.find((u) => u._id === selectedUserId) || {
                              _id: selectedUserId,
                              name: "Unknown User",
                              image: "",
                            },
                        }
                        : undefined)
                  }
                  session={session}
                  isGroup={isGroup}
                  onDeleteGroup={isGroup && (session?.user?.role !== "volunteer" || (session?.user?.role === "volunteer" && selectedGroup?.createdBy === session?.user?.id)) ? () => setShowDeleteModal(true) : undefined}
                  onDeleteConversation={() => handleConfirmDeleteConversation()}
                  onGroupUpdated={handleGroupCreated}
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  isLoadingMore={isLoadingMore}
                  isSending={isSending}
                  selectedConversationId={selectedUserId}
                  onBack={handleBackToConversations}
                  isTargetTyping={isTargetTyping}
                />
              </div>
              <div className="flex-shrink-0 border-t bg-white">
                <MessageInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                  isSending={isSending}
                  mentionees={
                    isGroup
                      ? (selectedGroup?.members || [])
                      : []
                  }
                  onTypingStatusChange={updateTypingStatus}
                  isGroup={isGroup}
                  currentUserId={session?.user?.id}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Layout - Single view */}
      <div className="md:hidden w-full">
        {selectedUserId ? (
          // Mobile Chat Area
          <div className="flex flex-col h-full">
            {/* Chat Area */}
            <div className="flex-1 min-h-0 relative">
              <ChatArea
                messages={flattenedMessages}
                isLoadingMessages={isLoadingMessages}
                selectedConversation={isGroup ? selectedGroup : selectedConversation || { _id: selectedUserId, user: { _id: selectedUserId, name: "New Conversation", image: "" } }}
                session={session}
                isGroup={isGroup}
                onDeleteGroup={isGroup && (session?.user?.role !== "volunteer" || (session?.user?.role === "volunteer" && selectedGroup?.createdBy === session?.user?.id)) ? () => setShowDeleteModal(true) : undefined}
                onDeleteConversation={() => handleConfirmDeleteConversation()}
                onGroupUpdated={handleGroupCreated}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                isSending={isSending}
                selectedConversationId={selectedUserId}
                onBack={handleBackToConversations}
                isTargetTyping={isTargetTyping}
              />
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 border-t bg-white">
              <MessageInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                isSending={isSending}
                mentionees={
                  isGroup
                    ? (selectedGroup?.members || [])
                    : []
                }
                onTypingStatusChange={updateTypingStatus}
                isGroup={isGroup}
                currentUserId={session?.user?.id}
              />
            </div>
          </div>
        ) : (
          // Mobile Conversation List
          <div className="h-full overflow-hidden">
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
              onGroupCreated={handleGroupCreated}
            />
          </div>
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

