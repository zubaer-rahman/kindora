import { Schema, model, models, Document } from "mongoose";

export interface IFeedback extends Document {
  _id: string;
  userId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ createdAt: -1 });

export const Feedback = models.Feedback || model<IFeedback>("Feedback", feedbackSchema);