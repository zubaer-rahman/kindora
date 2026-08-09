import { Message } from "@/types/message";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";
import { useRef, useState, useEffect } from "react";

export const useMessages = (selectedUserId: string | null, isGroup: boolean) => {
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const [newMessage, setNewMessage] = useState("");
  const [isTargetTyping, setIsTargetTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollToBottomRef = useRef<number>(0);

  // Get messages with real-time updates (no more polling)
  const { data: messages, isLoading: isLoadingMessages, fetchNextPage, hasNextPage, isFetchingNextPage } = trpc.messages.getMessages.useInfiniteQuery(
    {
      userId: selectedUserId || "",
      limit: 20
    },
    {
      enabled: !!selectedUserId && !isGroup,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 5 * 1000,
      refetchInterval: 30000, // Relaxed polling fallback
    }
  );

  const { data: groupMessages, isLoading: isLoadingGroupMessages, fetchNextPage: fetchNextGroupPage, hasNextPage: hasNextGroupPage, isFetchingNextPage: isFetchingNextGroupNextPage } = trpc.messages.getGroupMessages.useInfiniteQuery(
    {
      groupId: selectedUserId || "",
      limit: 20
    },
    {
      enabled: !!selectedUserId && isGroup,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      staleTime: 5 * 1000,
      refetchInterval: 30000, // Relaxed polling fallback
    }
  );

  // Typing status mutation
  const setTypingStatusMutation = trpc.messages.setTypingStatus.useMutation();

  // Subscribe to real-time events (including typing)
  trpc.messages.subscribeToMessages.useSubscription(
    { userId: selectedUserId || "", isGroup },
    {
      enabled: !!selectedUserId,
      onData: (event) => {
        if (event.type === 'typing') {
          if (isGroup) {
            if (event.data.groupId === selectedUserId) {
              setIsTargetTyping(event.data.isTyping);
            }
          } else {
            if (event.data.userId === selectedUserId) {
              setIsTargetTyping(event.data.isTyping);
            }
          }
        } else if (event.type === 'new_message') {
          if (isGroup) {
            utils.messages.getGroupMessages.invalidate({ groupId: selectedUserId || "" });
          } else {
            utils.messages.getMessages.invalidate({ userId: selectedUserId || "" });
          }
          utils.messages.getConversations.invalidate();
          utils.messages.getGroups.invalidate();
        } else if (event.type === 'mention') {
          import("react-hot-toast").then((t) => {
            const toast = t.default;
            toast(`${event.data.mentionData?.senderName} mentioned you!`, {
              icon: '🔔',
              duration: 4000,
              position: 'top-right',
            });
          });
          // Also invalidate to show the new message and update the bell icon
          utils.messages.getConversations.invalidate();
          utils.messages.getGroups.invalidate();
          utils.notifications.getUnreadCount.invalidate();
          utils.notifications.getUserNotifications.invalidate();

          if (isGroup) {
            utils.messages.getGroupMessages.invalidate({ groupId: selectedUserId || "" });
          } else {
            utils.messages.getMessages.invalidate({ userId: selectedUserId || "" });
          }
        }
      },
    }
  );

  const updateTypingStatus = (isTyping: boolean) => {
    if (!selectedUserId) return;
    setTypingStatusMutation.mutate({
      targetId: selectedUserId,
      isTyping,
      isGroup
    });
  };

  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      utils.messages.getConversations.invalidate();
      setNewMessage("");
    },
  });

  const sendGroupMessageMutation = trpc.messages.sendGroupMessage.useMutation({
    onSuccess: () => {
      utils.messages.getGroups.invalidate();
      setNewMessage("");
    },
  });

  const handleSendMessage = async (e?: React.FormEvent, files?: File[]) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() && (!files || files.length === 0)) return;
    if (!selectedUserId) return;

    try {
      let attachments: any[] = [];

      if (files && files.length > 0) {
        setIsUploading(true);
        
        const readFileAsDataURL = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        };

        for (const file of files) {
          try {
            const base64Data = await readFileAsDataURL(file);
            attachments.push({
              path: base64Data,
              filename: file.name,
              fileType: file.type,
              size: file.size,
            });
          } catch (error) {
            console.error("Error reading file:", error);
            const toast = (await import("react-hot-toast")).default;
            toast.error(`Failed to read file ${file.name}`);
            throw error;
          }
        }
      }

      if (isGroup) {
        await sendGroupMessageMutation.mutateAsync({
          groupId: selectedUserId,
          content: newMessage || undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
      } else {
        await sendMessageMutation.mutateAsync({
          receiverId: selectedUserId,
          content: newMessage || undefined,
          attachments: attachments.length > 0 ? attachments : undefined,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const toast = (await import("react-hot-toast")).default;
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isGroup) {
      if (hasNextGroupPage) await fetchNextGroupPage();
    } else {
      if (hasNextPage) await fetchNextPage();
    }
  };

  const flattenedMessages = isGroup
    ? groupMessages?.pages.flatMap(page => (page.messages as unknown) as Message[])
    : messages?.pages.flatMap(page => (page.messages as unknown) as Message[]);

  return {
    newMessage,
    setNewMessage,
    handleSendMessage,
    handleLoadMore,
    flattenedMessages,
    isLoadingMessages: isGroup ? isLoadingGroupMessages : isLoadingMessages,
    hasMore: isGroup ? hasNextGroupPage : hasNextPage,
    isLoadingMore: isGroup ? isFetchingNextGroupNextPage : isFetchingNextPage,
    isSending: (isGroup ? sendGroupMessageMutation.isPending : sendMessageMutation.isPending) || isUploading,
    isTargetTyping,
    updateTypingStatus,
    isUploading,
  };
};
