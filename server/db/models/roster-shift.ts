import mongoose, { Schema } from "mongoose";
import { IRosterShift, RosterVolunteerStatus } from "../interfaces/roster-shift";

const ROSTER_VOLUNTEER_STATUS_VALUES: RosterVolunteerStatus[] = [
  "pending",
  "confirmed",
  "absent",
];

const RosterShiftSchema: Schema = new Schema<IRosterShift>(
  {
    opportunity: {
      type: Schema.Types.ObjectId,
      ref: "opportunity",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    date: { type: String, required: true }, // ISO date string (YYYY-MM-DD)
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    role: { type: String, required: true },
    maxVolunteers: { type: Number, required: true, min: 1 },
    assignedVolunteers: [
      {
        volunteer: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        status: {
          type: String,
          enum: ROSTER_VOLUNTEER_STATUS_VALUES,
          required: true,
        },
        assignedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

RosterShiftSchema.index({ opportunity: 1, date: 1, startTime: 1 });

const RosterShift =
  mongoose.models.roster_shift ||
  mongoose.model<IRosterShift>("roster_shift", RosterShiftSchema);

export default RosterShift;

