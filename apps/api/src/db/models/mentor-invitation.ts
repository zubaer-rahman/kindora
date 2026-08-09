import mongoose, { Schema } from "mongoose";

const MentorInvitationSchema: Schema = new Schema(
  {
    organization_profile: {
      type: Schema.Types.ObjectId,
      ref: "organization_profile",
      required: true
    },
    invited_by: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    expires: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

// Create TTL index to automatically delete expired invitations
MentorInvitationSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

const MentorInvitation = mongoose.models.mentor_invitation || 
  mongoose.model("mentor_invitation", MentorInvitationSchema);

export default MentorInvitation; 