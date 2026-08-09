import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./MessageBubble";
import ConversationHeaderOptimized from "./ConversationHeaderOptimized";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Message, Conversation, Group } from "@/types/message";

interface ChatAreaProps {
  messages: Message[] | undefined;
  isLoadingMessages: boolean;
  selectedConversation: Conversation | Group | undefined;
  session: { user?: { id?: string; role?: string } } | null;
  isGroup?: boolean;
  onDeleteGroup?: () => void;
  onDeleteConversation?: () => void;
  onGroupUpdated?: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  selectedConversationId: string | null;
  onBack?: () => void;
  isTargetTyping?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = React.memo(({
  messages,
  isLoadingMessages,
  selectedConversation,
  session,
  isGroup,
  onDeleteGroup,
  onDeleteConversation,
  onGroupUpdated,
  onLoadMore,
  hasMore,
  isLoadingMore,
  isSending,
  selectedConversationId,
  onBack,
  isTargetTyping,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);

  // Refs for scroll restoration
  const previousScrollHeightRef = useRef<number>(0);
  const previousScrollTopRef = useRef<number>(0);

  const getViewport = () => scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;

  // Capture scroll position when we start loading more
  useEffect(() => {
    if (isLoadingMore) {
      const viewport = getViewport();
      if (viewport) {
        previousScrollHeightRef.current = viewport.scrollHeight;
        previousScrollTopRef.current = viewport.scrollTop;
      }
    }
  }, [isLoadingMore]);

  // Observer for infinite scroll
  useEffect(() => {
    if (!topRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(topRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  // Reset initial load ref when conversation changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    previousScrollHeightRef.current = 0;
  }, [selectedConversation?._id]);

  // Header data calculation moved up
  const headerData = isGroup ? {
    name: (selectedConversation as Group)?.name,
    members: (selectedConversation as Group)?.members?.length,
    image: (selectedConversation as Group)?.avatar
  } : selectedConversation && 'user' in selectedConversation ? {
    name: selectedConversation.user.name,
    image: selectedConversation.user.image,
    _id: selectedConversation.user._id
  } : undefined;

  // Sort messages by creation time in ascending order
  const sortedMessages = React.useMemo(() => {
    if (!messages) return [];
    const uniqueMessages = Array.from(new Map(messages.map(msg => [msg._id, msg])).values());
    return uniqueMessages.sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  // Handle scroll restoration and auto-scroll
  useLayoutEffect(() => {
    const viewport = getViewport();
    if (!viewport) return;

    // 1. Scroll Restoration (after loading more)
    if (previousScrollHeightRef.current > 0 && !isLoadingMore) {
      const newScrollHeight = viewport.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeightRef.current;

      if (heightDifference > 0) {
        viewport.scrollTop = previousScrollTopRef.current + heightDifference;
      }
      previousScrollHeightRef.current = 0;
      return; // Don't do other scrolls if we just restored
    }

    // 2. Initial Load Scroll
    if (isInitialLoadRef.current && messages && messages.length > 0 && !isLoadingMessages) {
      viewport.scrollTop = viewport.scrollHeight;
      isInitialLoadRef.current = false;
      previousMessageCountRef.current = messages.length;
      return;
    }

    // 3. Auto-scroll on Sending
    if (isSending) {
      viewport.scrollTop = viewport.scrollHeight;
      return;
    }

    // 4. New Message Arrival (only if we're not loading more)
    const currentMessageCount = messages?.length || 0;
    const previousMessageCount = previousMessageCountRef.current;

    if (currentMessageCount > previousMessageCount && !isLoadingMore) {
      viewport.scrollTop = viewport.scrollHeight;
    }

    previousMessageCountRef.current = currentMessageCount;
  }, [sortedMessages, isLoadingMessages, isLoadingMore, isSending, messages]);

  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col">
        {selectedConversation && (
          <ConversationHeaderOptimized
            user={isGroup ? (selectedConversation as Group) : (headerData || { name: "Unknown", image: "" })}
            isGroup={isGroup}
            onDeleteGroup={onDeleteGroup}
            onDeleteConversation={onDeleteConversation}
            onGroupUpdated={onGroupUpdated}
            userRole={session?.user?.role}
            currentUserId={session?.user?.id}
            onBack={onBack}
            showBackButton={true}
          />
        )}
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4">
          {isGroup ? (
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                {(selectedConversation as Group)?.name?.length > 20
                  ? `${(selectedConversation as Group)?.name?.substring(0, 20)}...`
                  : (selectedConversation as Group)?.name}
              </h2>
              <p className="text-sm text-gray-500 mb-4">{(selectedConversation as Group)?.members?.length || 0} members</p>
              <p className="text-sm text-gray-500">Start the conversation by sending a message</p>
            </div>
          ) : (
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">No messages yet</h2>
              <p className="text-sm text-gray-500">Send a message to start the conversation</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {selectedConversation && (
        <ConversationHeaderOptimized
          user={isGroup ? (selectedConversation as Group) : (headerData || { name: "Unknown", image: "" })}
          isGroup={isGroup}
          onDeleteGroup={onDeleteGroup}
          onDeleteConversation={onDeleteConversation}
          onGroupUpdated={onGroupUpdated}
          userRole={session?.user?.role}
          currentUserId={session?.user?.id}
          onBack={onBack}
          showBackButton={true}
        />
      )}

      <div className="flex-1 min-h-0 bg-gray-50/50 relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
        <ScrollArea ref={scrollAreaRef} className="h-full">
          <div className="space-y-4 px-4 py-4 pb-8">
            {hasMore && (
              <div ref={topRef} className="text-center">
                {isLoadingMore ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more messages...
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onLoadMore();
                    }}
                    disabled={isLoadingMore}
                    className="text-sm"
                  >
                    Load more messages
                  </Button>
                )}
              </div>
            )}
            {(!hasMore) && messages.length > 0 && !isLoadingMore && (
              <div className="text-center text-sm text-muted-foreground py-2">
                Beginning of conversation
              </div>
            )}
            {sortedMessages.map((message: Message, index) => (
              <div
                key={message._id}
                ref={index === sortedMessages.length - 1 ? lastMessageRef : null}
              >
                <MessageBubble
                  message={message}
                  isOwnMessage={message.sender?._id === session?.user?.id}
                />
              </div>
            ))}
            {isTargetTyping && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse p-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
                <span>{isGroup ? "Someone is typing..." : `${headerData?.name || 'Someone'} is typing...`}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
});

ChatArea.displayName = 'ChatArea';

export default ChatArea;