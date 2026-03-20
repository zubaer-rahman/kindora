import mongoose, { Schema } from "mongoose";
import { IReferral } from "../interfaces/referral";

const ReferralSchema: Schema = new Schema<IReferral>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    referral_name: { type: String, required: true },
    code: { type: String, required: true },
  },
  { timestamps: true }
);

const Referral = mongoose.models.referral || mongoose.model<IReferral>("referral", ReferralSchema);

export default Referral;