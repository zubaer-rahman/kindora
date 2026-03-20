import mongoose, { Schema } from "mongoose";
import { IOrgnizationPofile } from "../interfaces/organization-profile";

const allowedTypes = [
  "ngo", "nonprofit", "community_group", "social_enterprise", "charity",
  "educational_institution", "healthcare_provider", "religious_institution",
  "environmental_group", "youth_organization", "arts_culture_group",
  "disaster_relief_agency", "advocacy_group", "international_aid",
  "sports_club", "animal_shelter"
];

const OrganizationProfileSchema: Schema = new Schema<IOrgnizationPofile>(
  {
    title: { type: String },
    contact_email: { type: String },
    phone_number: { type: String },
    bio: { type: String },
    type: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v: string) {
          return allowedTypes.includes(v);
        },
        message: props => `${props.value} is not a valid organization type`
      }
    },
    opportunity_types: { type: [String], required: true },
    required_skills: { type: [String], required: true },
    state: { type: String },
    area: { type: String },
    abn: { type: String },
    website: { type: String },
    profile_img: { type: String },
    cover_img: { type: String },
  },
  { 
    timestamps: true,
    validateBeforeSave: true
  }
);

// Add pre-save middleware to ensure arrays are not empty
OrganizationProfileSchema.pre('save', function(this: IOrgnizationPofile, next) {
  if (this.opportunity_types.length === 0) {
    next(new Error('At least one opportunity type is required'));
  }
  if (this.required_skills.length === 0) {
    next(new Error('At least one required skill is required'));
  }
  next();
});

const OrganizationProfile = mongoose.models.organization_profile || mongoose.model<IOrgnizationPofile>("organization_profile", OrganizationProfileSchema);

export default OrganizationProfile;