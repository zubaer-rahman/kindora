import { Message } from "@/types/message";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAxiosAuth } from "@/hooks/useAxiosAuth";
import { useSession } from "next-auth/react";
import { useRef, useState, useEffect } from "react";

export const useMessages = (selectedUserId: string | null, isGroup: boolean) => {
  const { data: session } = useSession();
  const axiosAuth = useAxiosAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [isTargetTyping, setIsTargetTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollToBottomRef = useRef<number>(0);

  // Get messages with real-time updates (no more polling)
  const { data: messages, isLoading: isLoadingMessages, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["messages", selectedUserId],
    queryFn: async ({ pageParam }) => {
      const res = await axiosAuth.get(`/api/v1/messages/conversation/${selectedUserId}`, {
        params: { limit: 20, cursor: pageParam ?? undefined },
      });
      return res.data.data;
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!selectedUserId && !isGroup,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5 * 1000,
    refetchInterval: 30000, // Relaxed polling fallback
  });

  const { data: groupMessages, isLoading: isLoadingGroupMessages, fetchNextPage: fetchNextGroupPage, hasNextPage: hasNextGroupPage, isFetchingNextPage: isFetchingNextGroupNextPage } = useInfiniteQuery({
    queryKey: ["groupMessages", selectedUserId],
    queryFn: async ({ pageParam }) => {
      const res = await axiosAuth.get(`/api/v1/messages/groups/${selectedUserId}/messages`, {
        params: { limit: 20, cursor: pageParam ?? undefined },
      });
      return res.data.data;
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!selectedUserId && isGroup,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5 * 1000,
    refetchInterval: 30000, // Relaxed polling fallback
  });

  // Typing status mutation
  const setTypingStatusMutation = useMutation({
    mutationFn: async (payload: { targetId: string; isTyping: boolean; isGroup: boolean }) => {
      const res = await axiosAuth.post("/api/v1/messages/typing", payload);
      return res.data.data;
    },
  });

  // Subscribe to real-time events (including typing) via SSE
  useEffect(() => {
    if (!selectedUserId || !(session?.user as any)?.api_token) return;

    const controller = new AbortController();
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let buffer = "";
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const handleEvent = (event: {
      type: string;
      data?: {
        message?: any;
        userId?: string;
        groupId?: string;
        isTyping?: boolean;
        mentionData?: { senderName: string; roomId: string; isGroup: boolean };
      };
    }) => {
      if (event.type === "typing") {
        if (isGroup) {
          if (event.data?.groupId === selectedUserId && event.data.isTyping !== undefined) {
            setIsTargetTyping(event.data.isTyping);
          }
        } else {
          if (event.data?.userId === selectedUserId && event.data.isTyping !== undefined) {
            setIsTargetTyping(event.data.isTyping);
          }
        }
      } else if (event.type === "new_message") {
        const msg = event.data?.message;
        if (msg?.group) {
          queryClient.invalidateQueries({ queryKey: ["groupMessages"] });
        } else {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
        }
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["groups"] });
      } else if (event.type === "mention") {
        import("react-hot-toast").then((t) => {
          const toast = t.default;
          toast(`${event.data?.mentionData?.senderName} mentioned you!`, {
            icon: '🔔',
            duration: 4000,
            position: 'top-right',
          });
        });
        // Also invalidate to show the new message and update the bell icon
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        queryClient.invalidateQueries({ queryKey: ["notificationsUnreadCount"] });
        queryClient.invalidateQueries({ queryKey: ["notifications"] });

        if (isGroup) {
          queryClient.invalidateQueries({ queryKey: ["groupMessages"] });
        } else {
          queryClient.invalidateQueries({ queryKey: ["messages"] });
        }
      }
    };

    const connect = async () => {
      try {
        const response = await fetch(`${baseURL}/api/v1/stream/messages`, {
          headers: { Authorization: `Bearer ${(session?.user as any)?.api_token}` },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) return;
        reader = response.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";
          for (const chunk of parts) {
            const dataLines = chunk.split("\n").filter((l) => l.startsWith("data: "));
            for (const line of dataLines) {
              try {
                handleEvent(JSON.parse(line.slice(6)));
              } catch {
                // ignore malformed events
              }
            }
          }
        }
      } catch (error) {
        if ((error as any)?.name === "AbortError") return;
        // Connection dropped; close handler re-run will reconnect on next effect cycle
      }
    };

    connect();

    return () => {
      controller.abort();
      reader?.cancel().catch(() => undefined);
    };
  }, [selectedUserId, isGroup, session, queryClient]);

  const updateTypingStatus = (isTyping: boolean) => {
    if (!selectedUserId) return;
    setTypingStatusMutation.mutate({
      targetId: selectedUserId,
      isTyping,
      isGroup
    });
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { receiverId: string; content?: string; attachments?: any[] }) => {
      const res = await axiosAuth.post("/api/v1/messages", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setNewMessage("");
    },
  });

  const sendGroupMessageMutation = useMutation({
    mutationFn: async (payload: { groupId: string; content?: string; attachments?: any[] }) => {
      const res = await axiosAuth.post(
        `/api/v1/messages/groups/${payload.groupId}/messages`,
        { content: payload.content, attachments: payload.attachments }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
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
