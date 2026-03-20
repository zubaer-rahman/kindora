import mongoose, { Schema } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  opportunity_id?: mongoose.Types.ObjectId;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    opportunity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "opportunity",
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ opportunity_id: 1, type: 1 });

// Index to speed up queries by user, opportunity and type
NotificationSchema.index(
  { user: 1, opportunity_id: 1, type: 1 }
);

const Notification =
  mongoose.models.notification ||
  mongoose.model<INotification>("notification", NotificationSchema);

export default Notification; 