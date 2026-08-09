import { Document, Types } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  members: Types.ObjectId[];
  admins: Types.ObjectId[];
  createdBy: Types.ObjectId;
  isOrganizationGroup: boolean;
  opportunityId?: Types.ObjectId; // Add opportunity ID for opportunity-specific groups
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
} 