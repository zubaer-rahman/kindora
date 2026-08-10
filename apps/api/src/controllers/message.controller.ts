import { Response } from 'express';
import {
  sendMessageSchema,
  sendGroupMessageSchema,
  getMessagesParamsSchema,
  getMessagesQuerySchema,
  conversationIdParamsSchema,
  createGroupSchema,
  groupIdParamsSchema,
  groupMemberParamsSchema,
  setTypingSchema,
} from '../validators/message.validator.js';
import { AppError } from '../lib/errors.js';
import {
  sendMessage as sendMessageService,
  getMessages as getMessagesService,
  getConversations as getConversationsService,
  markAsRead as markAsReadService,
  createGroup as createGroupService,
  getGroups as getGroupsService,
  sendGroupMessage as sendGroupMessageService,
  getGroupMessages as getGroupMessagesService,
  getGroupMembers as getGroupMembersService,
  deleteGroup as deleteGroupService,
  addMember as addMemberService,
  removeMember as removeMemberService,
  promoteToAdmin as promoteToAdminService,
  demoteFromAdmin as demoteFromAdminService,
  deleteConversation as deleteConversationService,
  setTypingStatus as setTypingStatusService,
} from '../services/message.service.js';
import { catchAsync, sendResponse, sendError } from '../lib/http.js';
import { AuthRequest } from '../middleware/auth.js';

function handleServiceError(err: unknown, res: Response) {
  if (err instanceof AppError) sendError(res, err.statusCode, err.message);
  else throw err;
}

/**
 * POST /api/v1/messages
 */
export const sendMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = sendMessageSchema.parse(req.body);
    const data = await sendMessageService(req.user!.id, body);
    sendResponse(res, 201, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/messages/conversation/:userId
 */
export const getMessages = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const params = getMessagesParamsSchema.parse(req.params);
    const query = getMessagesQuerySchema.parse(req.query);
    const data = await getMessagesService(req.user!.id, params, query);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/messages/conversations
 */
export const getConversations = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getConversationsService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * PATCH /api/v1/messages/conversation/:conversationId/read
 */
export const markAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const params = conversationIdParamsSchema.parse(req.params);
    const data = await markAsReadService(req.user!.id, params);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/messages/groups
 */
export const createGroup = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = createGroupSchema.parse(req.body);
    const data = await createGroupService(req.user!.id, body);
    sendResponse(res, 201, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/messages/groups
 */
export const getGroups = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const data = await getGroupsService(req.user!.id);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/messages/groups/:groupId/messages
 */
export const sendGroupMessage = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = { ...req.params, ...req.body };
    const parsed = sendGroupMessageSchema.parse(body);
    const data = await sendGroupMessageService(req.user!.id, parsed);
    sendResponse(res, 201, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/messages/groups/:groupId/messages
 */
export const getGroupMessages = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const params = groupIdParamsSchema.parse(req.params);
    const query = getMessagesQuerySchema.parse(req.query);
    const data = await getGroupMessagesService(req.user!.id, params, query);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * GET /api/v1/messages/groups/:groupId/members
 */
export const getGroupMembers = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const params = groupIdParamsSchema.parse(req.params);
    const data = await getGroupMembersService(req.user!.id, params);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * DELETE /api/v1/messages/groups/:groupId
 */
export const deleteGroup = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const params = groupIdParamsSchema.parse(req.params);
    const data = await deleteGroupService(req.user!.id, params);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/messages/groups/:groupId/members
 */
export const addMember = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = { ...req.params, ...req.body };
    const parsed = groupMemberParamsSchema.parse(body);
    const data = await addMemberService(req.user!.id, parsed);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * DELETE /api/v1/messages/groups/:groupId/members/:memberId
 */
export const removeMember = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const params = groupMemberParamsSchema.parse(req.params);
    const data = await removeMemberService(req.user!.id, params);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/messages/groups/:groupId/members/:memberId/promote
 */
export const promoteToAdmin = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const params = groupMemberParamsSchema.parse(req.params);
    const data = await promoteToAdminService(req.user!.id, params);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * DELETE /api/v1/messages/groups/:groupId/members/:memberId/admin
 */
export const demoteFromAdmin = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const params = groupMemberParamsSchema.parse(req.params);
    const data = await demoteFromAdminService(req.user!.id, params);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * DELETE /api/v1/messages/conversation/:conversationId
 */
export const deleteConversation = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const params = conversationIdParamsSchema.parse(req.params);
    const data = await deleteConversationService(req.user!.id, params);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});

/**
 * POST /api/v1/messages/typing
 */
export const setTypingStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  try {
    const body = setTypingSchema.parse(req.body);
    const data = await setTypingStatusService(req.user!.id, body);
    sendResponse(res, 200, data);
  } catch (err) {
    handleServiceError(err, res);
  }
});