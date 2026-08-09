import mongoose, { Schema } from "mongoose";
import { AuthProvider, IUser, UserRole } from "../interfaces/user";

const UserSchema: Schema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return this.provider === "credentials";
      },
    },
    provider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.CREDENTIALS,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
    },
    image: { type: String },
    referred_by: { type: String },
    is_verified: {
      type: Boolean,
      default: false,
    },
    volunteer_profile: {
      type: Schema.Types.ObjectId,
      ref: "volunteer_profile",
    },
    mentor_profile: {
      type: Schema.Types.ObjectId,
      ref: "mentor_profile",
    },
    organization_profile: {
      type: Schema.Types.ObjectId,
      ref: "organization_profile",
    },
    last_seen: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expoPushToken: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.user || mongoose.model<IUser>("user", UserSchema);

export default User;
