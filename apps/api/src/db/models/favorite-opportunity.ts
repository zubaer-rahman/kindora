import mongoose, { Schema } from "mongoose";
import { IFavoriteOpportunity } from "../interfaces/favorite-opportunity";

const FavoriteOpportunitySchema = new Schema<IFavoriteOpportunity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    opportunity: {
      type: Schema.Types.ObjectId,
      ref: "opportunity",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

FavoriteOpportunitySchema.index(
  { user: 1, opportunity: 1 },
  { unique: true }
);

const FavoriteOpportunity =
  mongoose.models.favorite_opportunity ||
  mongoose.model<IFavoriteOpportunity>(
    "favorite_opportunity",
    FavoriteOpportunitySchema
  );

export default FavoriteOpportunity;
