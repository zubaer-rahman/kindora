import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  createGroup,
  getGroups,
  sendGroupMessage,
  getGroupMessages,
  getGroupMembers,
  deleteGroup,
  addMember,
  removeMember,
  promoteToAdmin,
  demoteFromAdmin,
  deleteConversation,
  setTypingStatus,
} from '../controllers/message.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/', sendMessage);
router.get('/conversations', getConversations);
router.get('/conversation/:userId', getMessages);
router.patch('/conversation/:conversationId/read', markAsRead);
router.delete('/conversation/:conversationId', deleteConversation);
router.post('/typing', setTypingStatus);
router.post('/groups', createGroup);
router.get('/groups', getGroups);
router.get('/groups/:groupId/messages', getGroupMessages);
router.post('/groups/:groupId/messages', sendGroupMessage);
router.get('/groups/:groupId/members', getGroupMembers);
router.post('/groups/:groupId/members', addMember);
router.delete('/groups/:groupId/members/:memberId', removeMember);
router.post('/groups/:groupId/members/:memberId/promote', promoteToAdmin);
router.delete('/groups/:groupId/members/:memberId/admin', demoteFromAdmin);
router.delete('/groups/:groupId', deleteGroup);

export default router;