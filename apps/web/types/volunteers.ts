import { volunteerValidation } from "@/server/validators/volunteer-profile.validator";
import { z } from "zod";

export type VolunteerProfileFormData = z.infer<typeof volunteerValidation.updateVolunteerProfileSchema>;

export interface Volunteer {
  _id: string;
  name: string;
  image?: string;
  volunteer_profile?: {
    student_type?: string;
    course?: string;
    availability_date?: {
      start_date?: string;
      end_date?: string;
    };
  };
}