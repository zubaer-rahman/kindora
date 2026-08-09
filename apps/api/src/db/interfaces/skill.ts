import { Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  is_custom: boolean;
  created_by?: string;
  usage_count: number;
} 