import mongoose, { Schema, model } from "mongoose";
import { IMentorProfile } from "../interfaces/mentor-profile";

const MentorProfileSchema = new Schema<IMentorProfile>(
    {
        bio: {
            type: String,
            required: false,
        },
        interested_on: {
            type: [String],
            required: true,
        },
        interested_categories: {
            type: [String],
            default: [],
        },
        phone_number: {
            type: String,
            required: true,
        },
        country: {
            type: String,
        },
        state: {
            type: String,
        },
        area: {
            type: String,
        },
        postcode: {
            type: String,
        },
        student_type: {
            type: String,
            enum: ["yes", "no"],
            required: false,
        },
        home_country: {
            type: String,
        },
        course: {
            type: String,
        },
        major: {
            type: String,
        },
        major_other: {
            type: String,
        },
        referral_source: {
            type: String,
        },
        referral_source_other: {
            type: String,
        },
        // New fields for staff/alumni
        is_currently_studying: {
            type: String,
            enum: ["yes", "no"],
        },
        non_student_type: {
            type: String,
            enum: ["staff", "alumni", "general_public"],
        },
        university: {
            type: String,
        },
        graduation_year: {
            type: String,
        },
        study_area: {
            type: String,
        },
        availability_date: {
            start_date: { type: String },
            end_date: { type: String }
        },
        availability_time: {
            start_time: { type: String },
            end_time: { type: String }
        },
        is_available: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const MentorProfile =
    mongoose.models.mentor_profile || model<IMentorProfile>("mentor_profile", MentorProfileSchema);
export default MentorProfile;
