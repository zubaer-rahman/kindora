import { Document, Types } from 'mongoose';

export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver?: Types.ObjectId;
  group?: Types.ObjectId;
  content?: string;
  attachments?: Array<{
    path: string;
    filename: string;
    fileType: string;
    size: number;
  }>;
  isRead: boolean;
  readBy: Array<{
    user: Types.ObjectId;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}