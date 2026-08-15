
export interface IMessage {
  sender: string;
  receiver?: string;
  group?: string;
  content?: string;
  attachments?: Array<{
    path: string;
    filename: string;
    fileType: string;
    size: number;
  }>;
  isRead: boolean;
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}