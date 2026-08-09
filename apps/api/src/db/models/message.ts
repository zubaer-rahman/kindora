import { Schema, model, models } from 'mongoose';
import { IMessage } from '../interfaces/message';

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: false,
      index: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'group',
      required: false,
    },
    content: {
      type: String,
      required: false,
    },
    attachments: [{
      path: { type: String, required: true },
      filename: { type: String, required: true },
      fileType: { type: String, required: true },
      size: { type: Number, required: true },
    }],
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readBy: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
      readAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ group: 1 });
messageSchema.index({ 'readBy.user': 1 });

export const Message = models.message || model('message', messageSchema);