import mongoose, { Schema } from "mongoose";
import { IOpportunity } from "../interfaces/opportunity";

const OpportunitySchema: Schema = new Schema<IOpportunity>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: [String], required: true },
    required_skills: { type: [String], required: true },
    commitment_type: { type: String, required: true },
    location: { type: String, required: true },
    number_of_volunteers: { type: Number, required: true },
    email_contact: { type: String, required: false },
    phone_contact: { type: String },
    requirements: { type: [String], default: [] },
    internal_reference: { type: String },
    external_event_link: { type: String },
    date: {
      start_date: { type: Date, required: true },
      end_date: { type: Date },
    },
    time: {
      start_time: { type: String, required: true },
      end_time: { type: String, required: false },
    },
    is_archived: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    is_recurring: { type: Boolean, default: false },
    recurrence: {
      type: { type: String },
      days: { type: [String] },
      date_range: {
        start_date: { type: Date },
        end_date: { type: Date },
      },
      time_range: {
        start_time: { type: String },
        end_time: { type: String },
      },
      occurrences: { type: Number },
    },
    banner_img: { type: String },
    organization_profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organization_profile",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const Opportunity =
  mongoose.models.opportunity ||
  mongoose.model<IOpportunity>("opportunity", OpportunitySchema);

export default Opportunity;
