import { Document, Types } from "mongoose";

export interface IOpportunityMentor extends Document {
  opportunity: Types.ObjectId;
  volunteer: Types.ObjectId;
  organization_profile: Types.ObjectId;
  assigned_by: Types.ObjectId;
  assigned_at: Date;
} 