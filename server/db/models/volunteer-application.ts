import mongoose, { Schema } from "mongoose";
import { IVolunteerApplication } from "../interfaces/volunteer-application";

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    opportunity: {
      type: Schema.Types.ObjectId,
      ref: "opportunity",
      required: true,
    },
    volunteer: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

VolunteerApplicationSchema.index(
  { opportunity: 1, volunteer: 1 },
  { unique: true }
);

const VolunteerApplication =
  mongoose.models.volunteer_application ||
  mongoose.model<IVolunteerApplication>(
    "volunteer_application",
    VolunteerApplicationSchema
  );

export default VolunteerApplication;
