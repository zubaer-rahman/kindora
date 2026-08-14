
export type RosterVolunteerStatus = "pending" | "confirmed" | "absent";

export interface IRosterShiftAssignedVolunteer {
  volunteer: string;
  status: RosterVolunteerStatus;
  assignedAt?: Date;
}

export interface IRosterShift {
  opportunity: string;
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

