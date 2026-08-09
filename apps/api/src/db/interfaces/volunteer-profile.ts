import { Document } from "mongoose";

export interface IVolunteerProfile extends Document {
  bio?: string;
  interested_on: string[];
  interested_categories: string[];
  phone_number: string;
  country: string;
  state?: string;
  area?: string;
  postcode?: string;

  student_type?: "yes" | "no" | undefined;
  home_country?: string;
  course?: string;
  major?: string;
  major_other?: string;
  referral_source?: string;
  referral_source_other?: string;

  // New fields for staff/alumni
  is_currently_studying?: "yes" | "no";
  non_student_type?: "staff" | "alumni" | "general_public";
  university?: string;
  graduation_year?: string;
  study_area?: string;

  profile_img?: string;
  availability_date?: {
    start_date?: string;
    end_date?: string;
  };
  availability_time?: {
    start_time?: string;
    end_time?: string;
  };
  is_available?: boolean;
}
