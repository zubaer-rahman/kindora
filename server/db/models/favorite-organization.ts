import mongoose, { Schema, model } from "mongoose";
import { IFavoriteOrganization } from "../interfaces/favorite-organization";

const FavoriteOrganizationSchema = new Schema<IFavoriteOrganization>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        organization: {
            type: Schema.Types.ObjectId,
            ref: "organization_profile",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure uniqueness
FavoriteOrganizationSchema.index({ user: 1, organization: 1 }, { unique: true });

const FavoriteOrganization =
    mongoose.models.favorite_organization ||
    model<IFavoriteOrganization>("favorite_organization", FavoriteOrganizationSchema);

export default FavoriteOrganization;
