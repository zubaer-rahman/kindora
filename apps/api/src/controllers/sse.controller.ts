import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { messagePubSub } from '../services/message-pubsub.js';

const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no', // disable Nginx buffering
} as const;

/**
 * GET /api/v1/stream/messages
 */
export const streamMessages = (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // SSE headers
  res.set(SSE_HEADERS);
  res.flushHeaders();

  // Send a heartbeat every 30s to keep the connection alive
  const heartbeat = setInterval(() => res.write(':\n\n'), 30_000);

  // Subscribe via the existing pub/sub singleton
  const unsubscribe = messagePubSub.subscribeToMessages(userId, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
};

/**
 * GET /api/v1/stream/conversations
 */
export const streamConversations = (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  // SSE headers
  res.set(SSE_HEADERS);
  res.flushHeaders();

  // Send a heartbeat every 30s to keep the connection alive
  const heartbeat = setInterval(() => res.write(':\n\n'), 30_000);

  // Subscribe via the existing pub/sub singleton
  const unsubscribe = messagePubSub.subscribeToConversations(userId, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
};