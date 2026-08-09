import { Document, Types } from "mongoose";

export interface IVolunteerApplication extends Document {
  opportunity: Types.ObjectId;
  volunteer: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
} 