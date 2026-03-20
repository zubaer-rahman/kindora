import { Document } from "mongoose";

export interface IReferral extends Document {
  name: string;
  email: string;
  referral_name: string;
  code: string;
}
