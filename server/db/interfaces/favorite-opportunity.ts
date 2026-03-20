import { Document, Types } from "mongoose";

export interface IFavoriteOpportunity extends Document {
  user: Types.ObjectId;
  opportunity: Types.ObjectId;
}