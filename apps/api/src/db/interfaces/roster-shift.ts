import { Document, Types } from "mongoose";

export type RosterVolunteerStatus = "pending" | "confirmed" | "absent";

export interface IRosterShiftAssignedVolunteer {
  volunteer: Types.ObjectId;
  status: RosterVolunteerStatus;
  assignedAt?: Date;
}

export interface IRosterShift extends Document {
  opportunity: Types.ObjectId;
  title: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  role: string;
  maxVolunteers: number;
  assignedVolunteers: IRosterShiftAssignedVolunteer[];
  createdAt: Date;
  updatedAt: Date;
}

