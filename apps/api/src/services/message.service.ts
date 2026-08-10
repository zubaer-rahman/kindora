/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose';
import { Message } from '../db/models/message';
import { Group } from '../db/models/group';
import User from '../db/models/user';
import OpportunityMentor from '../db/models/opportunity-mentor';
import Notification from '../db/models/notification';
import { IMessage } from '../db/interfaces/message';
import { AppError } from '../lib/errors.js';
import { sendPushNotification, sendPushNotifications } from '../lib/pushNotifications.js';
import {
  SendMessageInput,
  SendGroupMessageInput,
  GetMessagesParams,
  GetMessagesQuery,
  ConversationIdParams,
  CreateGroupInput,
  GroupIdParams,
  GroupMemberParams,
  SetTypingInput,
} from '../validators/message.validator.js';
import { messagePubSub } from './message-pubsub.service.js';

// Cast models to avoid Mongoose union-type generic issues with .find() overloads
const MessageModel = Message as any;
const GroupModel = Group as any;
const UserModel = User as any;
const OpportunityMentorModel = OpportunityMentor as any;
const NotificationModel = Notification as any;

export async function sendMessage(userId: string, input: SendMessageInput) {
  const user = await getCurrentUser(userId);
  const senderId = user._id;

  const { receiverId, content, attachments } = input;

  const message = await MessageModel.create({
    sender: new Types.ObjectId(senderId),
    receiver: new Types.ObjectId(receiverId),
    content,
    attachments,
  });

  const populatedMessage = await MessageModel.findById(message._id)
    .populate('sender', 'name image role')
    .lean();

  if (populatedMessage) {
    messagePubSub.publishNewMessage(receiverId, populatedMessage);
    messagePubSub.publishNewMessage(senderId, populatedMessage);
  }

  try {
    const receiver = await UserModel.findById(receiverId).select('expoPushToken name');
    if (receiver && receiver.expoPushToken) {
      const senderName = user.name || 'Someone';
      let messagePreview = '';
      if (content) {
        messagePreview = content.length > 100 ? content.substring(0, 100) + '...' : content;
      } else if (attachments && attachments.length > 0) {
        messagePreview = `📎 Sent ${attachments.length} file${attachments.length > 1 ? 's' : ''}`;
      }

      await sendPushNotification(
        receiver.expoPushToken,
        senderName,
        messagePreview,
        {
          type: 'message',
          senderId: senderId.toString(),
          receiverId: receiverId.toString(),
          messageId: message._id.toString(),
        },
      );
    }
  } catch {
    // Push notification failure should not break message delivery
  }

  if (content && content.includes('@')) {
    const mentionRegex = /@([\w\d_]+)/g;
    const matches = content.match(mentionRegex);
    if (matches) {
      const receiver = await UserModel.findById(receiverId);
      if (receiver) {
        const formattedName = receiver.name.replace(/\s+/g, '_').toLowerCase();
        const isMentioned = matches.some(m => m.toLowerCase() === `@${formattedName}`);

        if (isMentioned) {
          messagePubSub.publishMention(
            receiverId,
            user.name,
            senderId.toString(),
            false,
          );

          try {
            await NotificationModel.create({
              user: new Types.ObjectId(receiverId),
              type: 'mention',
              title: 'New Mention',
              message: `${user.name} mentioned you in a message.`,
              data: {
                senderId: senderId.toString(),
                senderName: user.name,
                roomId: senderId.toString(),
                isGroup: false,
              },
            });
          } catch {
            // Duplicate mention notifications are ignored
          }
        }
      }
    }
  }

  return populatedMessage;
}

export async function getMessages(
  currentUserId: string,
  input: GetMessagesParams,
  query: GetMessagesQuery,
) {
  await getCurrentUser(currentUserId);

  const { userId, limit, cursor } = { ...input, ...query };

  const filter: Record<string, unknown> = {
    $or: [
      { sender: currentUserId, receiver: new Types.ObjectId(userId) },
      { sender: new Types.ObjectId(userId), receiver: currentUserId },
    ],
  };

  if (cursor) {
    filter._id = { $lt: new Types.ObjectId(cursor) };
  }

  const messages = await MessageModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate('sender', 'name image role')
    .lean();

  let nextCursor: string | undefined = undefined;
  if (messages.length > limit) {
    const nextItem = messages.pop();
    if (nextItem && typeof nextItem === 'object' && '_id' in nextItem) {
      nextCursor = nextItem._id.toString();
    }
  }

  await MessageModel.updateMany(
    {
      sender: new Types.ObjectId(userId),
      receiver: new Types.ObjectId(currentUserId),
      isRead: false,
    },
    {
      $set: { isRead: true },
      $push: {
        readBy: {
          user: currentUserId,
          readAt: new Date(),
        },
      },
    },
  );

  return {
    messages: messages.reverse(),
    nextCursor,
  };
}

export async function getConversations(currentUserId: string) {
  await getCurrentUser(currentUserId);

  return getConversationAggregation(currentUserId);
}

export async function markAsRead(currentUserId: string, input: ConversationIdParams) {
  await getCurrentUser(currentUserId);

  const { conversationId } = input;

  const result = await MessageModel.updateMany(
    {
      sender: new Types.ObjectId(conversationId),
      receiver: new Types.ObjectId(currentUserId),
      isRead: false,
    },
    {
      $set: { isRead: true },
    },
  );

  if (result.modifiedCount > 0) {
    messagePubSub.publishMessageRead(currentUserId, conversationId);

    const conversations = await getConversationAggregation(currentUserId);

    messagePubSub.publishConversationUpdate(currentUserId, conversations);

    return { success: true, updatedCount: result.modifiedCount };
  }

  return { success: true, updatedCount: 0 };
}

export async function createGroup(userId: string, input: CreateGroupInput) {
  const user = await getCurrentUser(userId);

  const canCreateGroups = user.role === 'admin' || user.role === 'organization';

  if (!canCreateGroups && user.role === 'volunteer') {
    if (input.opportunityId) {
      const mentorAssignment = await OpportunityMentorModel.findOne({
        volunteer: user._id,
        opportunity: input.opportunityId,
      });

      if (!mentorAssignment) {
        throw new AppError(
          403,
          'You can only create groups for opportunities where you are assigned as a mentor',
        );
      }
    } else {
      const mentorAssignment = await OpportunityMentorModel.findOne({
        volunteer: user._id,
      });

      if (!mentorAssignment) {
        throw new AppError(
          403,
          'Volunteers cannot create groups unless they are assigned as mentors',
        );
      }
    }
  }

  if (input.isOrganizationGroup && user.role !== 'admin') {
    throw new AppError(403, 'Only admins can create organization groups');
  }

  const allMemberIds = [...input.memberIds.map((id: string) => new Types.ObjectId(id)), user._id];
  const uniqueMemberIds = Array.from(
    new Set(allMemberIds.map((id: Types.ObjectId) => id.toString())),
  ).map((id: string) => new Types.ObjectId(id));

  let mentorIds: Types.ObjectId[] = [];

  if (input.opportunityId) {
    const mentorAssignments = await OpportunityMentorModel.find({
      volunteer: { $in: uniqueMemberIds },
      opportunity: input.opportunityId,
    });
    mentorIds = mentorAssignments.map((assignment: any) => assignment.volunteer);
  }

  const adminIds = input.adminIds || [];
  const allAdmins = [
    ...new Set([user._id, ...mentorIds, ...adminIds.map((id: string) => new Types.ObjectId(id))]),
  ];

  const group = await GroupModel.create({
    name: input.name,
    description: input.description,
    createdBy: user._id,
    members: uniqueMemberIds,
    admins: allAdmins,
    isOrganizationGroup: input.isOrganizationGroup || false,
    opportunityId: input.opportunityId ? new Types.ObjectId(input.opportunityId) : undefined,
  });

  const populatedGroup = await GroupModel.findById(group._id)
    .populate('members', 'name image role')
    .populate('admins', 'name image role')
    .lean();

  if (!populatedGroup) {
    throw new AppError(500, 'Failed to create group');
  }

  const formattedGroup = {
    _id: group._id.toString(),
    name: group.name,
    description: group.description,
    members: populatedGroup.members || [],
    admins:
      (populatedGroup.admins.map((admin: any) => ({
        ...admin,
        role: mentorIds.some((id: Types.ObjectId) => id.toString() === admin._id.toString())
          ? 'mentor'
          : admin.role,
      })) as any) || [],
    createdBy: group.createdBy.toString(),
    isOrganizationGroup: group.isOrganizationGroup,
    opportunityId: group.opportunityId?.toString(),
    avatar: group.avatar,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    lastMessage: null,
    unreadCount: 0,
  };

  return formattedGroup;
}

export async function getGroups(currentUserId: string) {
  await getCurrentUser(currentUserId);

  const groups = await GroupModel.find({ members: currentUserId })
    .populate('members', 'name image role')
    .populate('admins', 'name image role')
    .lean();

  const groupsWithMessages = await Promise.all(
    groups.map(async (group: any) => {
      const lastMessage = (await MessageModel.findOne({ group: group._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name image role')
        .lean()) as (IMessage & { sender: { name: string; image: string; role: string } }) | null;

      const unreadCount = await MessageModel.countDocuments({
        group: group._id,
        'readBy.user': { $ne: currentUserId },
        sender: { $ne: currentUserId },
      });

      return {
        ...group,
        opportunityId: group.opportunityId?.toString(),
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              isRead: lastMessage.readBy.some(
                (read: { user: Types.ObjectId }) =>
                  read.user.toString() === currentUserId.toString(),
              ),
              createdAt: lastMessage.createdAt,
            }
          : null,
        unreadCount,
      };
    }),
  );

  return groupsWithMessages;
}

export async function sendGroupMessage(userId: string, input: SendGroupMessageInput) {
  const user = await getCurrentUser(userId);

  const { groupId, content, attachments } = input;

  const group = await GroupModel.findOne({ _id: groupId, members: user._id });
  if (!group) {
    throw new AppError(404, 'Group not found or you are not a member');
  }

  const message = await MessageModel.create({
    sender: user._id,
    group: group._id,
    content,
    attachments,
    readBy: [{ user: user._id }],
  });

  const populatedMessage = await MessageModel.findById(message._id)
    .populate('sender', 'name image role')
    .populate('group', 'name')
    .lean();

  if (populatedMessage) {
    messagePubSub.publishGroupMessage(
      group.members.map((member: Types.ObjectId) => member.toString()),
      populatedMessage,
    );
  }

  try {
    const receiverIds = group.members.filter((memberId: Types.ObjectId) => !memberId.equals(user._id));

    if (receiverIds.length > 0) {
      const receivers = await UserModel.find({
        _id: { $in: receiverIds },
      }).select('expoPushToken name');

      const tokens = receivers
        .filter((receiver: any) => receiver.expoPushToken)
        .map((receiver: any) => receiver.expoPushToken);

      if (tokens.length > 0) {
        const senderName = user.name || 'Someone';
        const groupName = populatedMessage?.group?.name || 'Group';
        let messagePreview = '';
        if (content) {
          messagePreview = content.length > 100 ? content.substring(0, 100) + '...' : content;
        } else if (attachments && attachments.length > 0) {
          messagePreview = `📎 Sent ${attachments.length} file${attachments.length > 1 ? 's' : ''}`;
        }

        await sendPushNotifications(
          tokens,
          `${senderName} in ${groupName}`,
          messagePreview,
          {
            type: 'groupMessage',
            senderId: user._id.toString(),
            groupId,
            messageId: message._id.toString(),
          },
        );
      }
    }
  } catch {
    // Push notification failure should not break message delivery
  }

  if (content && content.includes('@')) {
    const mentionRegex = /@([\w\d_]+)/g;
    const matches = content.match(mentionRegex);
    if (matches) {
      const members = await UserModel.find({
        _id: { $in: group.members },
      }).select('name _id expoPushToken');

      for (const member of members) {
        if (member._id.toString() === user._id.toString()) continue;

        const formattedName = member.name.replace(/\s+/g, '_').toLowerCase();
        const isMentioned = matches.some((m: string) => m.toLowerCase() === `@${formattedName}`);

        if (isMentioned) {
          messagePubSub.publishMention(
            member._id.toString(),
            user.name,
            groupId,
            true,
          );

          try {
            await NotificationModel.create({
              user: member._id,
              type: 'mention',
              title: 'Group Mention',
              message: `${user.name} mentioned you in ${group.name}`,
              opportunity_id: group.opportunityId,
              data: {
                senderId: user._id.toString(),
                senderName: user.name,
                groupId,
                isGroup: true,
              },
            });
          } catch {
            // Duplicate mention notifications are ignored
          }

          if (member.expoPushToken) {
            try {
              await sendPushNotification(
                member.expoPushToken,
                'You were mentioned!',
                `${user.name} mentioned you in ${group.name}`,
                {
                  type: 'mention',
                  senderId: user._id.toString(),
                  groupId,
                  messageId: message._id.toString(),
                },
              );
            } catch {
              // Mention push failure is ignored
            }
          }
        }
      }
    }
  }

  return populatedMessage;
}

export async function getGroupMessages(
  currentUserId: string,
  input: GroupIdParams,
  query: GetMessagesQuery,
) {
  await getCurrentUser(currentUserId);

  const { groupId, limit, cursor } = { ...input, ...query };

  const group = await GroupModel.findById(groupId);
  if (!group) {
    throw new AppError(404, 'Group not found');
  }

  if (!group.members.includes(currentUserId)) {
    throw new AppError(403, 'You are not a member of this group');
  }

  const filter: Record<string, unknown> = { group: new Types.ObjectId(groupId) };
  if (cursor) {
    filter._id = { $lt: new Types.ObjectId(cursor) };
  }

  const messages = await MessageModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate('sender', 'name image role')
    .lean();

  let nextCursor: string | undefined = undefined;
  if (messages.length > limit) {
    const nextItem = messages.pop();
    if (nextItem && typeof nextItem === 'object' && '_id' in nextItem) {
      nextCursor = nextItem._id.toString();
    }
  }

  await MessageModel.updateMany(
    {
      group: new Types.ObjectId(groupId),
      'readBy.user': { $ne: currentUserId },
    },
    {
      $push: {
        readBy: {
          user: currentUserId,
          readAt: new Date(),
        },
      },
    },
  );

  return {
    messages: messages.reverse(),
    nextCursor,
  };
}

export async function getGroupMembers(currentUserId: string, input: GroupIdParams) {
  await getCurrentUser(currentUserId);

  const { groupId } = input;

  const group = await GroupModel.findById(groupId).populate('members', 'name image role');
  if (!group) {
    throw new AppError(404, 'Group not found');
  }

  if (!group.members.some((m: any) => m._id.toString() === currentUserId.toString())) {
    throw new AppError(403, 'You are not a member of this group');
  }

  return group.members;
}

export async function deleteGroup(currentUserId: string, input: GroupIdParams) {
  const user = await getCurrentUser(currentUserId);

  const group = await GroupModel.findById(input.groupId);
  if (!group) {
    throw new AppError(404, 'Group not found');
  }

  const isAdminOrOrganization = user.role === 'admin' || user.role === 'organization';
  const isGroupAdmin = group.admins.includes(user._id);
  const isGroupCreator = group.createdBy.toString() === user._id.toString();

  let isOpportunityMentor = false;
  if (group.opportunityId && user.role === 'volunteer') {
    const mentorAssignment = await OpportunityMentorModel.findOne({
      volunteer: user._id,
      opportunity: group.opportunityId,
    });
    isOpportunityMentor = !!mentorAssignment;
  }

  if (!isAdminOrOrganization && !isGroupAdmin && !isGroupCreator && !isOpportunityMentor) {
    throw new AppError(
      403,
      "You don't have permission to delete this group. Only group creators, admins, organizations, and opportunity mentors can delete groups.",
    );
  }

  await MessageModel.deleteMany({ group: group._id });
  await GroupModel.deleteOne({ _id: group._id });

  return { success: true };
}

export async function addMember(currentUserId: string, input: GroupMemberParams) {
  const user = await getCurrentUser(currentUserId);

  const group = await GroupModel.findById(input.groupId);
  if (!group) {
    throw new AppError(404, 'Group not found');
  }

  const isAdminOrOrganization = user.role === 'admin' || user.role === 'organization';
  const isGroupAdmin = group.admins.includes(user._id);
  const isGroupCreator = group.createdBy.toString() === user._id.toString();

  let isOpportunityMentor = false;
  if (group.opportunityId && user.role === 'volunteer') {
    const mentorAssignment = await OpportunityMentorModel.findOne({
      volunteer: user._id,
      opportunity: group.opportunityId,
    });
    isOpportunityMentor = !!mentorAssignment;
  }

  if (!isAdminOrOrganization && !isGroupAdmin && !isOpportunityMentor && !isGroupCreator) {
    throw new AppError(403, "You don't have permission to add members to this group");
  }

  const memberToAdd = await UserModel.findById(input.memberId);
  if (!memberToAdd) {
    throw new AppError(404, 'User to add not found');
  }

  if (group.members.includes(new Types.ObjectId(input.memberId))) {
    throw new AppError(400, 'User is already a member of this group');
  }

  await GroupModel.findByIdAndUpdate(input.groupId, {
    $addToSet: { members: new Types.ObjectId(input.memberId) },
  });

  const updatedGroup = await GroupModel.findById(input.groupId)
    .populate('members', 'name image role')
    .populate('admins', 'name image role')
    .lean();

  return updatedGroup;
}

export async function removeMember(currentUserId: string, input: GroupMemberParams) {
  const user = await getCurrentUser(currentUserId);

  const group = await GroupModel.findById(input.groupId);
  if (!group) {
    throw new AppError(404, 'Group not found');
  }

  const isAdminOrOrganization = user.role === 'admin' || user.role === 'organization';
  const isGroupAdmin = group.admins.includes(user._id);
  const isGroupCreator = group.createdBy.toString() === user._id.toString();

  let isOpportunityMentor = false;
  if (group.opportunityId && user.role === 'volunteer') {
    const mentorAssignment = await OpportunityMentorModel.findOne({
      volunteer: user._id,
      opportunity: group.opportunityId,
    });
    isOpportunityMentor = !!mentorAssignment;
  }

  if (!isAdminOrOrganization && !isGroupAdmin && !isOpportunityMentor && !isGroupCreator) {
    throw new AppError(403, "You don't have permission to remove members from this group");
  }

  if (!group.members.includes(new Types.ObjectId(input.memberId))) {
    throw new AppError(400, 'User is not a member of this group');
  }

  if (group.admins.includes(new Types.ObjectId(input.memberId))) {
    const adminCount = group.admins.length;
    if (adminCount <= 1) {
      throw new AppError(400, 'Cannot remove the last admin from the group');
    }
  }

  await GroupModel.findByIdAndUpdate(input.groupId, {
    $pull: {
      members: new Types.ObjectId(input.memberId),
      admins: new Types.ObjectId(input.memberId),
    },
  });

  const updatedGroup = await GroupModel.findById(input.groupId)
    .populate('members', 'name image role')
    .populate('admins', 'name image role')
    .lean();

  return updatedGroup;
}

export async function promoteToAdmin(currentUserId: string, input: GroupMemberParams) {
  const user = await getCurrentUser(currentUserId);

  const group = await GroupModel.findById(input.groupId);
  if (!group) {
    throw new AppError(404, 'Group not found');
  }

  const isAdminOrOrganization = user.role === 'admin' || user.role === 'organization';
  const isGroupAdmin = group.admins.includes(user._id);
  const isGroupCreator = group.createdBy.toString() === user._id.toString();

  let isOpportunityMentor = false;
  if (group.opportunityId && user.role === 'volunteer') {
    const mentorAssignment = await OpportunityMentorModel.findOne({
      volunteer: user._id,
      opportunity: group.opportunityId,
    });
    isOpportunityMentor = !!mentorAssignment;
  }

  if (!isAdminOrOrganization && !isGroupAdmin && !isOpportunityMentor && !isGroupCreator) {
    throw new AppError(403, "You don't have permission to promote members in this group");
  }

  if (!group.members.includes(new Types.ObjectId(input.memberId))) {
    throw new AppError(400, 'User is not a member of this group');
  }

  if (group.admins.includes(new Types.ObjectId(input.memberId))) {
    throw new AppError(400, 'User is already an admin of this group');
  }

  await GroupModel.findByIdAndUpdate(input.groupId, {
    $addToSet: { admins: new Types.ObjectId(input.memberId) },
  });

  const updatedGroup = await GroupModel.findById(input.groupId)
    .populate('members', 'name image role')
    .populate('admins', 'name image role')
    .lean();

  return updatedGroup;
}

export async function demoteFromAdmin(currentUserId: string, input: GroupMemberParams) {
  const user = await getCurrentUser(currentUserId);

  const group = await GroupModel.findById(input.groupId);
  if (!group) {
    throw new AppError(404, 'Group not found');
  }

  const isAdminOrOrganization = user.role === 'admin' || user.role === 'organization';
  const isGroupAdmin = group.admins.includes(user._id);
  const isGroupCreator = group.createdBy.toString() === user._id.toString();

  let isOpportunityMentor = false;
  if (group.opportunityId && user.role === 'volunteer') {
    const mentorAssignment = await OpportunityMentorModel.findOne({
      volunteer: user._id,
      opportunity: group.opportunityId,
    });
    isOpportunityMentor = !!mentorAssignment;
  }

  if (!isAdminOrOrganization && !isGroupAdmin && !isOpportunityMentor && !isGroupCreator) {
    throw new AppError(403, "You don't have permission to demote admins in this group");
  }

  if (!group.admins.includes(new Types.ObjectId(input.memberId))) {
    throw new AppError(400, 'User is not an admin of this group');
  }

  const adminCount = group.admins.length;
  if (adminCount <= 1) {
    throw new AppError(400, 'Cannot demote the last admin from the group');
  }

  await GroupModel.findByIdAndUpdate(input.groupId, {
    $pull: { admins: new Types.ObjectId(input.memberId) },
  });

  const updatedGroup = await GroupModel.findById(input.groupId)
    .populate('members', 'name image role')
    .populate('admins', 'name image role')
    .lean();

  return updatedGroup;
}

export async function deleteConversation(currentUserId: string, input: ConversationIdParams) {
  const user = await getCurrentUser(currentUserId);

  if (user.role === 'volunteer') {
    throw new AppError(403, 'Volunteers cannot delete conversations');
  }

  const isAdminOrOrganization = user.role === 'admin' || user.role === 'organization';
  if (!isAdminOrOrganization) {
    throw new AppError(403, "You don't have permission to delete conversations");
  }

  const { conversationId } = input;

  await MessageModel.deleteMany({
    $or: [
      { sender: user._id, receiver: conversationId },
      { sender: conversationId, receiver: user._id },
    ],
  });

  return { success: true };
}

export async function setTypingStatus(userId: string, input: SetTypingInput) {
  const user = await UserModel.findOne({ _id: userId });
  if (!user) return { success: false };

  const { targetId, isTyping, isGroup } = input;

  if (isGroup) {
    const group = await GroupModel.findById(targetId);
    if (group) {
      group.members.forEach((memberId: any) => {
        if (memberId.toString() !== userId) {
          messagePubSub.publishTyping(userId, memberId.toString(), isTyping, undefined, targetId);
        }
      });
    }
  } else {
    messagePubSub.publishTyping(userId, targetId, isTyping, userId);
  }

  return { success: true };
}

async function getCurrentUser(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError(404, 'User not found');
  }
  return user;
}

function getConversationAggregation(currentUserId: string) {
  return MessageModel.aggregate([
    {
      $match: {
        $or: [
          { sender: new Types.ObjectId(currentUserId) },
          { receiver: new Types.ObjectId(currentUserId) },
        ],
        group: { $exists: false },
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$sender', new Types.ObjectId(currentUserId)] },
            '$receiver',
            '$sender',
          ],
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$receiver', new Types.ObjectId(currentUserId)] },
                  { $eq: ['$isRead', false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
        pipeline: [
          {
            $lookup: {
              from: 'organization_profiles',
              localField: 'organization_profile',
              foreignField: '_id',
              as: 'organization_profile',
            },
          },
          {
            $unwind: {
              path: '$organization_profile',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              name: 1,
              image: 1,
              role: 1,
              organization_profile: {
                title: 1,
              },
            },
          },
        ],
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        _id: 1,
        user: 1,
        lastMessage: {
          content: 1,
          isRead: 1,
          createdAt: 1,
        },
        unreadCount: 1,
      },
    },
  ]);
}