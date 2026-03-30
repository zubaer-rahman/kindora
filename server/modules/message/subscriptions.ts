import { observable } from '../../trpc';
import { EventEmitter } from 'events';
import { redis } from '../../../lib/redis';

// Message event types
interface MessageEvent {
  type: 'new_message' | 'message_read' | 'typing' | 'mention';
  data: {
    message?: Record<string, unknown>;
    conversationId?: string;
    groupId?: string;
    userId?: string;
    isTyping?: boolean;
    mentionData?: {
      senderName: string;
      roomId: string; // userId or groupId
      isGroup: boolean;
    };
  };
}

// Conversation event types
interface ConversationEvent {
  type: 'conversation_update' | 'group_update';
  data: {
    conversations?: Record<string, unknown>[];
    groups?: Record<string, unknown>[];
    userId?: string;
  };
}

// Simple in-memory pub/sub system with Redis backup for Vercel lambdas
class MessagePubSub extends EventEmitter {
  private static instance: MessagePubSub;

  static getInstance(): MessagePubSub {
    if (!MessagePubSub.instance) {
      MessagePubSub.instance = new MessagePubSub();
    }
    return MessagePubSub.instance;
  }

  // Helper to push event to Redis for cross-instance sync
  // Optimized to use pipeline for batching operations
  private async pushToRedis(userId: string, event: MessageEvent | ConversationEvent) {
    try {
      const key = `user_events:${userId}`;
      const pipeline = redis.pipeline();
      
      // Batch both operations into a single round trip
      pipeline.rpush(key, JSON.stringify(event));
      // Set expiration to ensure we don't leak memory if a user never connects
      pipeline.expire(key, 60);
      
      await pipeline.exec();
    } catch (error) {
      console.error('❌ Redis push error:', error);
    }
  }

  publishNewMessage(userId: string, message: Record<string, unknown>) {
    console.log('📤 Publishing new message to user:', userId);

    // 1. In-memory emit (for same-instance subscribers)
    const event: MessageEvent = {
      type: 'new_message',
      data: { message }
    };
    this.emit(`message:${userId}`, event);

    // 2. Redis push (for cross-instance subscribers on Vercel)
    this.pushToRedis(userId, event);
  }

  publishGroupMessage(groupMembers: string[], message: Record<string, unknown>) {
    groupMembers.forEach(memberId => {
      this.publishNewMessage(memberId, message);
    });
  }

  publishMessageRead(userId: string, conversationId: string) {
    const event: MessageEvent = {
      type: 'message_read',
      data: { conversationId }
    };
    this.emit(`message:${userId}`, event);
    this.pushToRedis(userId, event);
  }

  publishTyping(userId: string, targetUserId: string, isTyping: boolean, conversationId?: string, groupId?: string) {
    const event: MessageEvent = {
      type: 'typing',
      data: { userId, isTyping, conversationId, groupId }
    };
    this.emit(`message:${targetUserId}`, event);

    // Note: for typing status we can be more aggressive/lean
    this.pushToRedis(targetUserId, event);
  }

  publishMention(targetUserId: string, senderName: string, roomId: string, isGroup: boolean) {
    const event: MessageEvent = {
      type: 'mention',
      data: {
        mentionData: { senderName, roomId, isGroup }
      }
    };
    this.emit(`message:${targetUserId}`, event);
    this.pushToRedis(targetUserId, event);
  }

  publishConversationUpdate(userId: string, conversations: Record<string, unknown>[]) {
    const event: ConversationEvent = {
      type: 'conversation_update',
      data: { conversations, userId }
    };
    this.emit(`conversation:${userId}`, event);
    this.pushToRedis(userId, event);
  }

  publishGroupUpdate(userId: string, groups: Record<string, unknown>[]) {
    const event: ConversationEvent = {
      type: 'group_update',
      data: { groups, userId }
    };
    this.emit(`group:${userId}`, event);
    this.pushToRedis(userId, event);
  }

  subscribeToMessages(userId: string) {
    return observable<MessageEvent>((emit) => {
      const handler = (data: MessageEvent) => {
        emit.next(data);
      };

      // 1. Subscribe to in-memory events
      this.on(`message:${userId}`, handler);

      // 2. Poll Redis for cross-instance events
      const pollRedis = async () => {
        try {
          const key = `user_events:${userId}`;
          // Get all pending events and clear them in one go if possible
          // Using LPOP in a loop as long as data exists
          let eventData = await redis.lpop(key);
          while (eventData) {
            const event = (typeof eventData === 'string' ? JSON.parse(eventData) : eventData) as MessageEvent;
            // Only emit if it's a message event (filter just in case)
            if (['new_message', 'message_read', 'typing', 'mention'].includes(event.type)) {
              emit.next(event);
            }
            eventData = await redis.lpop(key);
          }
        } catch (error) {
          console.error('❌ Redis poll error:', error);
        }
      };

      const interval = setInterval(pollRedis, 1000); // Poll every 1 second

      return () => {
        this.off(`message:${userId}`, handler);
        clearInterval(interval);
      };
    });
  }

  subscribeToConversations(userId: string) {
    return observable<ConversationEvent>((emit) => {
      const conversationHandler = (data: ConversationEvent) => {
        emit.next(data);
      };

      const groupHandler = (data: ConversationEvent) => {
        emit.next(data);
      };

      this.on(`conversation:${userId}`, conversationHandler);
      this.on(`group:${userId}`, groupHandler);

      // Poll Redis for conversation/group updates
      const pollRedis = async () => {
        try {
          const key = `user_events:${userId}`;
          let eventData = await redis.lpop(key);
          while (eventData) {
            const event = (typeof eventData === 'string' ? JSON.parse(eventData) : eventData) as ConversationEvent;
            if (['conversation_update', 'group_update'].includes(event.type)) {
              emit.next(event);
            }
            eventData = await redis.lpop(key);
          }
        } catch (error) {
          console.error('❌ Redis poll error:', error);
        }
      };

      const interval = setInterval(pollRedis, 2000); // Conversations can be slightly slower

      return () => {
        this.off(`conversation:${userId}`, conversationHandler);
        this.off(`group:${userId}`, groupHandler);
        clearInterval(interval);
      };
    });
  }
}

export const messagePubSub = MessagePubSub.getInstance();
