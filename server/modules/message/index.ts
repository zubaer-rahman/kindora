/* eslint-disable @typescript-eslint/no-explicit-any */
import { TRPCError } from "@trpc/server";
import { sendMessageSchema, sendGroupMessageSchema } from "./message.validation";
import { Message } from "../../db/models/message";
import { Types } from "mongoose";
import User from "../../db/models/user";
import { JwtPayload } from "jsonwebtoken";
import { router, observable } from "../../trpc";
import { z } from "zod";
import { Group } from "../../db/models/group";
import { IMessage } from "../../db/interfaces/message";
import { protectedProcedure } from "../../middlewares/with-auth";
import { messagePubSub } from "./subscriptions";
import { sendPushNotification, sendPushNotifications } from "../../helpers/pushNotifications";
import { redis } from "../../../lib/redis";
import Notification from "../../db/models/notification";

export const messageRouter = router({
  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to send messages",
          });
        }

        const { receiverId, content, attachments } = input;

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const senderId = user._id;

        console.log('📤 Sending message:', {
          senderEmail: sessionUser.email,
          senderId: senderId.toString(),
          senderRole: user.role,
          receiverId,
          content: content ? (content.substring(0, 50) + (content.length > 50 ? '...' : '')) : '[Attachment]',
          hasAttachments: attachments && attachments.length > 0,
        });

        const message = await Message.create({
          sender: new Types.ObjectId(senderId),
          receiver: new Types.ObjectId(receiverId),
          content,
          attachments,
        });

        // Populate the sender information for the response
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name image role')
          .lean();

        // Publish the new message to both sender and receiver channels
        if (populatedMessage) {
          console.log('📤 Publishing message via tRPC:', {
            senderId: senderId.toString(),
            receiverId: receiverId.toString(),
            messageId: (populatedMessage as any)._id,
            senderRole: user.role,
            receiverRole: (populatedMessage as any).sender?.role || 'unknown'
          });

          // Publish to receiver's channel
          messagePubSub.publishNewMessage(receiverId, populatedMessage as Record<string, unknown>);
          // Also publish to sender's channel so their UI updates immediately
          messagePubSub.publishNewMessage(senderId, populatedMessage as Record<string, unknown>);
        }

        // Send push notification to receiver (mobile app)
        console.log(`🔔 ===== PUSH NOTIFICATION CHECK STARTED (WEB PORTAL) =====`);
        try {
          const receiver = await User.findById(receiverId).select('expoPushToken name');
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
              }
            );
          }
        } catch (pushError) {
          console.error('❌ Error sending push notification:', pushError);
        }

        // --- Mention Logic ---
        if (content && content.includes('@')) {
          const mentionRegex = /@([\w\d_]+)/g;
          const matches = content.match(mentionRegex);
          console.log('🔍 Checking mentions in private message:', { matches, receiverId });
          if (matches) {
            const receiver = await User.findById(receiverId);
            if (receiver) {
              const formattedName = receiver.name.replace(/\s+/g, '_').toLowerCase();
              const isMentioned = matches.some(m => m.toLowerCase() === `@${formattedName}`);

              if (isMentioned) {
                console.log('✅ Mention detected for user:', receiver.name);
                messagePubSub.publishMention(
                  receiverId,
                  user.name,
                  senderId.toString(),
                  false
                );

                // Create persistent notification for the bell icon
                try {
                  await Notification.create({
                    user: new Types.ObjectId(receiverId),
                    type: 'mention',
                    title: 'New Mention',
                    message: `${user.name} mentioned you in a message.`,
                    data: {
                      senderId: senderId.toString(),
                      senderName: user.name,
                      roomId: senderId.toString(),
                      isGroup: false
                    }
                  });
                } catch (notificationError: any) {
                  if (notificationError.code === 11000) {
                    console.log('⚠️ Duplicate mention notification prevented');
                  } else {
                    console.error('❌ Error creating mention notification:', notificationError);
                  }
                }
              }
            }
          }
        }

        return populatedMessage;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to send message",
        });
      }
    }),

  getMessages: protectedProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { userId, limit, cursor } = input;
        const sessionUser = ctx.user as JwtPayload;

        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to view messages",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const currentUserId = user._id;
        const query = {
          $or: [
            { sender: currentUserId, receiver: new Types.ObjectId(userId) },
            { sender: new Types.ObjectId(userId), receiver: currentUserId },
          ],
        };

        if (cursor) {
          (query as any)._id = { $lt: new Types.ObjectId(cursor) };
        }

        const messages = await Message.find(query)
          .sort({ createdAt: -1 })
          .limit(limit + 1)
          .populate('sender', 'name image role')
          .lean();

        let nextCursor: string | undefined = undefined;
        if (messages.length > limit) {
          const nextItem = messages.pop();
          if (nextItem && typeof nextItem === 'object' && '_id' in nextItem) {
            nextCursor = (nextItem._id as Types.ObjectId).toString();
          }
        }

        // Mark messages as read
        await Message.updateMany(
          {
            sender: new Types.ObjectId(userId),
            receiver: currentUserId,
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
          }
        );

        return {
          messages: messages.reverse(),
          nextCursor,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to fetch messages",
        });
      }
    }),

  getConversations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view conversations",
        });
      }

      const user = await User.findOne({ email: sessionUser.email });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const currentUserId = user._id;

      // Optimize the aggregation pipeline
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { sender: new Types.ObjectId(currentUserId) },
              { receiver: new Types.ObjectId(currentUserId) },
            ],
            group: { $exists: false }, // Exclude group messages
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ["$sender", new Types.ObjectId(currentUserId)] },
                "$receiver",
                "$sender",
              ],
            },
            lastMessage: { $first: "$$ROOT" },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$receiver", new Types.ObjectId(currentUserId)] },
                      { $eq: ["$isRead", false] },
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
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $lookup: {
                  from: "organization_profiles",
                  localField: "organization_profile",
                  foreignField: "_id",
                  as: "organization_profile"
                }
              },
              {
                $unwind: {
                  path: "$organization_profile",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  name: 1,
                  image: 1,
                  role: 1,
                  organization_profile: {
                    title: 1
                  }
                },
              },
            ],
          },
        },
        {
          $unwind: "$user",
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

      return conversations;
    } catch (error: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error?.message || "Failed to fetch conversations",
      });
    }
  }),

  markAsRead: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { conversationId } = input;
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to mark messages as read",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const currentUserId = user._id;

        // Update all unread messages without time restriction
        const result = await Message.updateMany(
          {
            sender: new Types.ObjectId(conversationId),
            receiver: new Types.ObjectId(currentUserId),
            isRead: false
          },
          {
            $set: { isRead: true },
          }
        );

        // Only invalidate if we actually updated something
        if (result.modifiedCount > 0) {
          // Publish message read event
          messagePubSub.publishMessageRead(currentUserId.toString(), conversationId);

          // Also publish conversation update to refresh the sidebar
          const conversations = await Message.aggregate([
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
                    { $eq: ["$sender", new Types.ObjectId(currentUserId)] },
                    "$receiver",
                    "$sender",
                  ],
                },
                lastMessage: { $first: "$$ROOT" },
                unreadCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$receiver", new Types.ObjectId(currentUserId)] },
                          { $eq: ["$isRead", false] },
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
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user",
                pipeline: [
                  {
                    $lookup: {
                      from: "organization_profiles",
                      localField: "organization_profile",
                      foreignField: "_id",
                      as: "organization_profile"
                    }
                  },
                  {
                    $unwind: {
                      path: "$organization_profile",
                      preserveNullAndEmptyArrays: true
                    }
                  },
                  {
                    $project: {
                      name: 1,
                      image: 1,
                      role: 1,
                      organization_profile: {
                        title: 1
                      }
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$user",
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

          messagePubSub.publishConversationUpdate(currentUserId.toString(), conversations as Record<string, unknown>[]);

          return { success: true, updatedCount: result.modifiedCount };
        }

        return { success: true, updatedCount: 0 };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to mark messages as read",
        });
      }
    }),

  createGroup: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      memberIds: z.array(z.string()),
      isOrganizationGroup: z.boolean().optional(),
      adminIds: z.array(z.string()).optional(),
      opportunityId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to create a group",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Check if user can create groups
        const canCreateGroups = user.role === "admin" || user.role === "organization";

        // If user is a volunteer, check if they are assigned as a mentor
        if (!canCreateGroups && user.role === "volunteer") {
          const OpportunityMentor = (await import("@/server/db/models/opportunity-mentor")).default;

          if (input.opportunityId) {
            // Check if the user is assigned as a mentor for this specific opportunity
            const mentorAssignment = await OpportunityMentor.findOne({
              volunteer: user._id,
              opportunity: input.opportunityId,
            });

            if (!mentorAssignment) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "You can only create groups for opportunities where you are assigned as a mentor",
              });
            }
          } else {
            // Check if the user is assigned as a mentor for any opportunity
            const mentorAssignment = await OpportunityMentor.findOne({
              volunteer: user._id,
            });

            if (!mentorAssignment) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "Volunteers cannot create groups unless they are assigned as mentors",
              });
            }
          }
        }

        // Check if user is an admin or mentor when creating an organization group
        if (input.isOrganizationGroup && user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create organization groups",
          });
        }

        // Deduplicate member IDs and identify mentors
        const allMemberIds = [...input.memberIds.map(id => new Types.ObjectId(id)), user._id];
        const uniqueMemberIds = Array.from(new Set(allMemberIds.map(id => id.toString()))).map(id => new Types.ObjectId(id));

        // Check which members are mentors for this opportunity (if opportunityId is provided)
        const OpportunityMentor = (await import("@/server/db/models/opportunity-mentor")).default;
        let mentorIds: Types.ObjectId[] = [];

        if (input.opportunityId) {
          const mentorAssignments = await OpportunityMentor.find({
            volunteer: { $in: uniqueMemberIds },
            opportunity: input.opportunityId,
          });
          mentorIds = mentorAssignments.map(assignment => assignment.volunteer);
        }

        // Add any manually specified admin IDs
        const adminIds = input.adminIds || [];
        const allAdmins = [...new Set([user._id, ...mentorIds, ...adminIds.map(id => new Types.ObjectId(id))])];

        const group = await Group.create({
          name: input.name,
          description: input.description,
          createdBy: user._id,
          members: uniqueMemberIds,
          admins: allAdmins,
          isOrganizationGroup: input.isOrganizationGroup || false,
          opportunityId: input.opportunityId ? new Types.ObjectId(input.opportunityId) : undefined,
        });

        // Get the populated group data
        const populatedGroup = await Group.findById(group._id)
          .populate('members', 'name image role')
          .populate('admins', 'name image role')
          .lean();

        if (!populatedGroup) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create group",
          });
        }

        // Convert to the expected format with proper mentor labels
        const formattedGroup = {
          _id: group._id.toString(),
          name: group.name,
          description: group.description,
          members: (populatedGroup as any).members || [],
          admins: (populatedGroup as any).admins.map((admin: any) => ({
            ...admin,
            role: mentorIds.some(id => id.toString() === admin._id.toString()) ? "mentor" : admin.role
          })) || [],
          createdBy: group.createdBy.toString(),
          isOrganizationGroup: group.isOrganizationGroup,
          opportunityId: group.opportunityId?.toString(),
          avatar: group.avatar,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          lastMessage: null,
          unreadCount: 0
        };

        return formattedGroup;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to create group",
        });
      }
    }),

  getGroups: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to view groups",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const currentUserId = user._id;

        // Get groups where user is a member
        const groups = await Group.find({ members: currentUserId })
          .populate('members', 'name image role')
          .populate('admins', 'name image role')
          .lean();

        // Get the last message and unread count for each group
        const groupsWithMessages = await Promise.all(
          groups.map(async (group: any) => {
            const lastMessage = await Message.findOne({ group: group._id })
              .sort({ createdAt: -1 })
              .populate('sender', 'name image role')
              .lean() as (IMessage & { sender: { name: string; image: string; role: string } }) | null;

            // Count unread messages (messages not in readBy array for current user)
            const unreadCount = await Message.countDocuments({
              group: group._id,
              'readBy.user': { $ne: currentUserId },
              sender: { $ne: currentUserId }, // Don't count own messages
            });

            return {
              ...group,
              opportunityId: group.opportunityId?.toString(),
              lastMessage: lastMessage ? {
                content: lastMessage.content,
                isRead: lastMessage.readBy.some((read: { user: Types.ObjectId }) =>
                  read.user.toString() === currentUserId.toString()
                ),
                createdAt: lastMessage.createdAt,
              } : null,
              unreadCount,
            };
          })
        );

        return groupsWithMessages;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to fetch groups",
        });
      }
    }),

  sendGroupMessage: protectedProcedure
    .input(sendGroupMessageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to send messages",
          });
        }

        const { groupId, content, attachments } = input;

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const group = await Group.findOne({ _id: groupId, members: user._id });
        if (!group) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Group not found or you are not a member",
          });
        }

        const message = await Message.create({
          sender: user._id,
          group: group._id,
          content,
          attachments,
          readBy: [{ user: user._id }],
        });

        // Populate the sender information for the response
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name image role')
          .populate('group', 'name')
          .lean();

        // Publish the new message to all group members
        if (populatedMessage) {
          console.log('📤 Publishing group message via tRPC:', {
            groupId: input.groupId,
            senderId: user._id.toString(),
            messageId: (populatedMessage as any)._id,
            groupMembers: group.members.map((member: Types.ObjectId) => member.toString())
          });

          // Publish to all group members
          messagePubSub.publishGroupMessage(
            group.members.map((member: Types.ObjectId) => member.toString()),
            populatedMessage as Record<string, unknown>
          );
        }

        // Send push notifications to all group members except sender (mobile app)
        console.log(`🔔 ===== PUSH NOTIFICATION CHECK STARTED (WEB PORTAL - GROUP) =====`);
        try {
          const receiverIds = group.members.filter(
            (memberId: Types.ObjectId) => !memberId.equals(user._id)
          );

          if (receiverIds.length > 0) {
            const receivers = await User.find({
              _id: { $in: receiverIds }
            }).select('expoPushToken name');

            const tokens = receivers
              .filter((receiver) => receiver.expoPushToken)
              .map((receiver) => receiver.expoPushToken!);

            if (tokens.length > 0) {
              const senderName = user.name || 'Someone';
              const groupName = (populatedMessage as any)?.group?.name || 'Group';
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
                  groupId: groupId,
                  messageId: message._id.toString(),
                }
              );
            }
          }
        } catch (pushError) {
          console.error('❌ Error sending group push notifications:', pushError);
        }

        // --- Group Mention Logic ---
        if (content && content.includes('@')) {
          const mentionRegex = /@([\w\d_]+)/g;
          const matches = content.match(mentionRegex);
          console.log('🔍 Checking mentions in group message:', { matches, groupId });
          if (matches) {
            // Get members and find who was mentioned
            const members = await User.find({
              _id: { $in: group.members }
            }).select('name _id expoPushToken');

            for (const member of members) {
              if (member._id.toString() === user._id.toString()) continue;

              const formattedName = member.name.replace(/\s+/g, '_').toLowerCase();
              const isMentioned = matches.some(m => m.toLowerCase() === `@${formattedName}`);

              if (isMentioned) {
                console.log('✅ Mention detected in group for user:', member.name);
                // Real-time mention via Redis
                messagePubSub.publishMention(
                  member._id.toString(),
                  user.name,
                  groupId,
                  true
                );

                // Create persistent notification for the bell icon
                try {
                  await Notification.create({
                    user: member._id,
                    type: 'mention',
                    title: 'Group Mention',
                    message: `${user.name} mentioned you in ${group.name}`,
                    opportunity_id: group.opportunityId,
                    data: {
                      senderId: user._id.toString(),
                      senderName: user.name,
                      groupId: groupId,
                      isGroup: true
                    }
                  });
                } catch (notificationError: any) {
                  if (notificationError.code === 11000) {
                    console.log('⚠️ Duplicate group mention notification prevented');
                  } else {
                    console.error('❌ Error creating group mention notification:', notificationError);
                  }
                }

                // Urgent Push Notification for Mention
                if (member.expoPushToken) {
                  try {
                    await sendPushNotification(
                      member.expoPushToken,
                      'You were mentioned!',
                      `${user.name} mentioned you in ${group.name}`,
                      {
                        type: 'mention',
                        senderId: user._id.toString(),
                        groupId: groupId,
                        messageId: message._id.toString(),
                      }
                    );
                  } catch (e) {
                    console.error('Mention push error:', e);
                  }
                }
              }
            }
          }
        }

        return populatedMessage;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to send message",
        });
      }
    }),

  getGroupMessages: protectedProcedure
    .input(z.object({
      groupId: z.string(),
      limit: z.number().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const { groupId, limit, cursor } = input;
        const sessionUser = ctx.user as JwtPayload;

        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to view messages",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const group = await Group.findById(groupId);
        if (!group) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Group not found",
          });
        }

        // Check if user is a member of the group
        if (!group.members.includes(user._id)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this group",
          });
        }

        const query: any = { group: new Types.ObjectId(groupId) };
        if (cursor) {
          query._id = { $lt: new Types.ObjectId(cursor) };
        }

        const messages = await Message.find(query)
          .sort({ createdAt: -1 })
          .limit(limit + 1)
          .populate('sender', 'name image role')
          .lean();

        let nextCursor: string | undefined = undefined;
        if (messages.length > limit) {
          const nextItem = messages.pop();
          if (nextItem && typeof nextItem === 'object' && '_id' in nextItem) {
            nextCursor = (nextItem._id as Types.ObjectId).toString();
          }
        }

        // Mark messages as read for the current user
        await Message.updateMany(
          {
            group: new Types.ObjectId(groupId),
            'readBy.user': { $ne: user._id },
          },
          {
            $push: {
              readBy: {
                user: user._id,
                readAt: new Date(),
              },
            },
          }
        );

        return {
          messages: messages.reverse(),
          nextCursor,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to fetch group messages",
        });
      }
    }),

  getGroupMembers: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const { groupId } = input;
        const sessionUser = ctx.user as JwtPayload;

        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to view members",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const group = await Group.findById(groupId).populate('members', 'name image role');
        if (!group) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Group not found",
          });
        }

        // Check if user is a member of the group
        if (!group.members.some((m: any) => m._id.toString() === user._id.toString())) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a member of this group",
          });
        }

        return group.members;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to fetch group members",
        });
      }
    }),

  deleteGroup: protectedProcedure
    .input(z.object({
      groupId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to delete a group",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Note: Volunteer permissions are checked in the permission logic below

        // Find the group
        const group = await Group.findById(input.groupId);
        if (!group) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Group not found",
          });
        }

        // Check permissions: Allow if user is admin/organization OR if user is admin of the group OR if user is the group creator OR if user is an opportunity mentor
        const isAdminOrOrganization = user.role === "admin" || user.role === "organization";
        const isGroupAdmin = group.admins.includes(user._id);
        const isGroupCreator = group.createdBy.toString() === user._id.toString();

        // Check if user is an opportunity mentor for this group's opportunity
        let isOpportunityMentor = false;
        if (group.opportunityId && user.role === "volunteer") {
          const OpportunityMentor = (await import("@/server/db/models/opportunity-mentor")).default;
          const mentorAssignment = await OpportunityMentor.findOne({
            volunteer: user._id,
            opportunity: group.opportunityId,
          });
          isOpportunityMentor = !!mentorAssignment;
        }

        if (!isAdminOrOrganization && !isGroupAdmin && !isGroupCreator && !isOpportunityMentor) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete this group. Only group creators, admins, organizations, and opportunity mentors can delete groups.",
          });
        }

        // Delete all messages in the group (this will work even if no messages exist)
        await Message.deleteMany({ group: group._id });

        // Delete the group
        await Group.deleteOne({ _id: group._id });

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to delete group",
        });
      }
    }),

  addMember: protectedProcedure
    .input(z.object({
      groupId: z.string(),
      memberId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to add members",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Find the group
        const group = await Group.findById(input.groupId);
        if (!group) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Group not found",
          });
        }

        // Check permissions: Allow if user is admin/organization OR if user is admin of the group OR if user is an opportunity mentor OR if user is the group creator
        const isAdminOrOrganization = user.role === "admin" || user.role === "organization";
        const isGroupAdmin = group.admins.includes(user._id);
        const isGroupCreator = group.createdBy.toString() === user._id.toString();

        // Check if user is an opportunity mentor for this group's opportunity
        let isOpportunityMentor = false;
        if (group.opportunityId && user.role === "volunteer") {
          const OpportunityMentor = (await import("@/server/db/models/opportunity-mentor")).default;
          const mentorAssignment = await OpportunityMentor.findOne({
            volunteer: user._id,
            opportunity: group.opportunityId,
          });
          isOpportunityMentor = !!mentorAssignment;


        }

        if (!isAdminOrOrganization && !isGroupAdmin && !isOpportunityMentor && !isGroupCreator) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to add members to this group",
          });
        }

        // Check if the user to add exists
        const memberToAdd = await User.findById(input.memberId);
        if (!memberToAdd) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User to add not found",
          });
        }

        // Check if user is already a member
        if (group.members.includes(new Types.ObjectId(input.memberId))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is already a member of this group",
          });
        }

        // Add the member
        await Group.findByIdAndUpdate(input.groupId, {
          $addToSet: { members: new Types.ObjectId(input.memberId) }
        });

        // Get the updated group with populated data
        const updatedGroup = await Group.findById(input.groupId)
          .populate('members', 'name image role')
          .populate('admins', 'name image role')
          .lean();

        return updatedGroup;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to add member",
        });
      }
    }),

  removeMember: protectedProcedure
    .input(z.object({
      groupId: z.string(),
      memberId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to remove members",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Find the group
        const group = await Group.findById(input.groupId);
        if (!group) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Group not found",
          });
        }

        // Check permissions: Allow if user is admin/organization OR if user is admin of the group OR if user is an opportunity mentor OR if user is the group creator
        const isAdminOrOrganization = user.role === "admin" || user.role === "organization";
        const isGroupAdmin = group.admins.includes(user._id);
        const isGroupCreator = group.createdBy.toString() === user._id.toString();

        // Check if user is an opportunity mentor for this group's opportunity
        let isOpportunityMentor = false;
        if (group.opportunityId && user.role === "volunteer") {
          const OpportunityMentor = (await import("@/server/db/models/opportunity-mentor")).default;
          const mentorAssignment = await OpportunityMentor.findOne({
            volunteer: user._id,
            opportunity: group.opportunityId,
          });
          isOpportunityMentor = !!mentorAssignment;
        }

        if (!isAdminOrOrganization && !isGroupAdmin && !isOpportunityMentor && !isGroupCreator) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to remove members from this group",
          });
        }

        // Check if the user to remove is a member
        if (!group.members.includes(new Types.ObjectId(input.memberId))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is not a member of this group",
          });
        }

        // Prevent removing the last admin
        if (group.admins.includes(new Types.ObjectId(input.memberId))) {
          const adminCount = group.admins.length;
          if (adminCount <= 1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Cannot remove the last admin from the group",
            });
          }
        }

        // Remove the member (and from admins if they were an admin)
        await Group.findByIdAndUpdate(input.groupId, {
          $pull: {
            members: new Types.ObjectId(input.memberId),
            admins: new Types.ObjectId(input.memberId)
          }
        });

        // Get the updated group with populated data
        const updatedGroup = await Group.findById(input.groupId)
          .populate('members', 'name image role')
          .populate('admins', 'name image role')
          .lean();

        return updatedGroup;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to remove member",
        });
      }
    }),

  promoteToAdmin: protectedProcedure
    .input(z.object({
      groupId: z.string(),
      memberId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to promote members",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Find the group
        const group = await Group.findById(input.groupId);
        if (!group) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Group not found",
          });
        }

        // Check permissions: Allow if user is admin/organization OR if user is admin of the group OR if user is an opportunity mentor OR if user is the group creator
        const isAdminOrOrganization = user.role === "admin" || user.role === "organization";
        const isGroupAdmin = group.admins.includes(user._id);
        const isGroupCreator = group.createdBy.toString() === user._id.toString();

        // Check if user is an opportunity mentor for this group's opportunity
        let isOpportunityMentor = false;
        if (group.opportunityId && user.role === "volunteer") {
          const OpportunityMentor = (await import("@/server/db/models/opportunity-mentor")).default;
          const mentorAssignment = await OpportunityMentor.findOne({
            volunteer: user._id,
            opportunity: group.opportunityId,
          });
          isOpportunityMentor = !!mentorAssignment;
        }

        if (!isAdminOrOrganization && !isGroupAdmin && !isOpportunityMentor && !isGroupCreator) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to promote members in this group",
          });
        }

        // Check if the user to promote is a member
        if (!group.members.includes(new Types.ObjectId(input.memberId))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is not a member of this group",
          });
        }

        // Check if user is already an admin
        if (group.admins.includes(new Types.ObjectId(input.memberId))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is already an admin of this group",
          });
        }

        // Promote the member to admin
        await Group.findByIdAndUpdate(input.groupId, {
          $addToSet: { admins: new Types.ObjectId(input.memberId) }
        });

        // Get the updated group with populated data
        const updatedGroup = await Group.findById(input.groupId)
          .populate('members', 'name image role')
          .populate('admins', 'name image role')
          .lean();

        return updatedGroup;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to promote member",
        });
      }
    }),

  demoteFromAdmin: protectedProcedure
    .input(z.object({
      groupId: z.string(),
      memberId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to demote admins",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Find the group
        const group = await Group.findById(input.groupId);
        if (!group) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Group not found",
          });
        }

        // Check permissions: Allow if user is admin/organization OR if user is admin of the group OR if user is an opportunity mentor OR if user is the group creator
        const isAdminOrOrganization = user.role === "admin" || user.role === "organization";
        const isGroupAdmin = group.admins.includes(user._id);
        const isGroupCreator = group.createdBy.toString() === user._id.toString();

        // Check if user is an opportunity mentor for this group's opportunity
        let isOpportunityMentor = false;
        if (group.opportunityId && user.role === "volunteer") {
          const OpportunityMentor = (await import("@/server/db/models/opportunity-mentor")).default;
          const mentorAssignment = await OpportunityMentor.findOne({
            volunteer: user._id,
            opportunity: group.opportunityId,
          });
          isOpportunityMentor = !!mentorAssignment;
        }

        if (!isAdminOrOrganization && !isGroupAdmin && !isOpportunityMentor && !isGroupCreator) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to demote admins in this group",
          });
        }

        // Check if the user to demote is an admin
        if (!group.admins.includes(new Types.ObjectId(input.memberId))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User is not an admin of this group",
          });
        }

        // Prevent demoting the last admin
        const adminCount = group.admins.length;
        if (adminCount <= 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot demote the last admin from the group",
          });
        }

        // Demote the admin
        await Group.findByIdAndUpdate(input.groupId, {
          $pull: { admins: new Types.ObjectId(input.memberId) }
        });

        // Get the updated group with populated data
        const updatedGroup = await Group.findById(input.groupId)
          .populate('members', 'name image role')
          .populate('admins', 'name image role')
          .lean();

        return updatedGroup;
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to demote admin",
        });
      }
    }),

  deleteConversation: protectedProcedure
    .input(z.object({
      conversationId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to delete a conversation",
          });
        }

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Check if user is a volunteer
        if (user.role === "volunteer") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Volunteers cannot delete conversations",
          });
        }

        // Only allow admin or organization users to delete conversations
        const isAdminOrOrganization = user.role === "admin" || user.role === "organization";
        if (!isAdminOrOrganization) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete conversations",
          });
        }

        // Find the conversation (messages between the user and the target user)
        const conversationId = input.conversationId;

        // Delete all messages in the conversation
        await Message.deleteMany({
          $or: [
            { sender: user._id, receiver: conversationId },
            { sender: conversationId, receiver: user._id }
          ]
        });

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message || "Failed to delete conversation",
        });
      }
    }),

  // Subscription for real-time messages
  onMessage: protectedProcedure.subscription(({ ctx }) => {
    const sessionUser = ctx.user as JwtPayload;
    if (!sessionUser?.email) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to subscribe to messages",
      });
    }

    return observable<{ type: string; data: Record<string, unknown> }>((emit) => {
      // Get user ID from session
      const getUser = async () => {
        const user = await User.findOne({ email: sessionUser.email });
        return user?._id?.toString();
      };

      getUser().then((userId) => {
        if (userId) {
          console.log('📡 User subscribing to messages:', userId);
          return messagePubSub.subscribeToMessages(userId);
        }
      }).then((subscription) => {
        if (subscription) {
          subscription.subscribe({
            next: (data) => {
              console.log('📨 Subscription received:', data);
              emit.next(data);
            },
            error: (error) => {
              console.error('❌ Subscription error:', error);
              emit.error(error);
            },
          });
        }
      }).catch((error) => {
        console.error('❌ Failed to setup subscription:', error);
        emit.error(error);
      });

      return () => {
        console.log('📡 User unsubscribing from messages');
      };
    });
  }),

  // SSE subscription for messages
  subscribeToMessages: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
      isGroup: z.boolean().default(false),
    }))
    .subscription(async ({ ctx }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to subscribe to messages",
        });
      }

      const user = await User.findOne({ email: sessionUser.email });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const currentUserId = user._id.toString();

      return observable<{
        type: 'new_message' | 'message_read' | 'conversation_update' | 'connected' | 'typing' | 'mention';
        data: any;
      }>((emit) => {
        const messageHandler = (event: any) => {
          console.log('📡 SSE: Emitting message event:', event);
          emit.next(event);
        };

        const conversationHandler = (event: any) => {
          console.log('📡 SSE: Emitting conversation event:', event);
          emit.next({
            type: 'conversation_update',
            data: event
          });
        };

        // Subscribe to user-specific messages
        messagePubSub.on(`message:${currentUserId}`, messageHandler);

        // Subscribe to conversation updates
        messagePubSub.on(`conversation:${currentUserId}`, conversationHandler);

        // Send initial connection message
        emit.next({
          type: 'connected',
          data: { userId: currentUserId, timestamp: new Date().toISOString() }
        });

        return () => {
          console.log('📡 SSE: Cleaning up subscription for user:', currentUserId);
          messagePubSub.off(`message:${currentUserId}`, messageHandler);
          messagePubSub.off(`conversation:${currentUserId}`, conversationHandler);
        };
      });
    }),

  // SSE subscription for conversations
  subscribeToConversations: protectedProcedure
    .subscription(async ({ ctx }) => {
      const sessionUser = ctx.user as JwtPayload;
      if (!sessionUser?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to subscribe to conversations",
        });
      }

      const user = await User.findOne({ email: sessionUser.email });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const currentUserId = user._id.toString();

      return observable<{
        type: 'conversation_update' | 'group_update' | 'connected';
        data: any;
      }>((emit) => {
        const conversationHandler = (event: any) => {
          console.log('📡 SSE: Emitting conversation update:', event);
          emit.next({
            type: 'conversation_update',
            data: event
          });
        };

        const groupHandler = (event: any) => {
          console.log('📡 SSE: Emitting group update:', event);
          emit.next({
            type: 'group_update',
            data: event
          });
        };

        // Subscribe to conversation updates
        messagePubSub.on(`conversation:${currentUserId}`, conversationHandler);
        messagePubSub.on(`group:${currentUserId}`, groupHandler);

        // Send initial connection message
        emit.next({
          type: 'connected',
          data: { userId: currentUserId, timestamp: new Date().toISOString() }
        });

        return () => {
          console.log('📡 SSE: Cleaning up conversation subscription for user:', currentUserId);
          messagePubSub.off(`conversation:${currentUserId}`, conversationHandler);
          messagePubSub.off(`group:${currentUserId}`, groupHandler);
        };
      });
    }),

  setTypingStatus: protectedProcedure
    .input(z.object({
      targetId: z.string(),
      isTyping: z.boolean(),
      isGroup: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionUser = ctx.user as JwtPayload;
        if (!sessionUser?.email) return { success: false };

        const user = await User.findOne({ email: sessionUser.email });
        if (!user) return { success: false };

        const userId = user._id.toString();
        const { targetId, isTyping, isGroup } = input;

        // Use Redis to store typing status (expires in 3 seconds)
        const key = isGroup
          ? `typing:group:${targetId}:${userId}`
          : `typing:private:${targetId}:${userId}`;

        if (isTyping) {
          await redis.set(key, "1", { ex: 3 });
        } else {
          await redis.del(key);
        }

        // Broadcast to relevant users using in-memory pubsub for immediate delivery
        if (isGroup) {
          const group = await Group.findById(targetId);
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
      } catch (error) {
        console.error('Error in setTypingStatus:', error);
        return { success: false };
      }
    }),
});
