import { Document, Types } from "mongoose";

export interface IFavoriteOrganization extends Document {
    user: Types.ObjectId;
    organization: Types.ObjectId;
}
