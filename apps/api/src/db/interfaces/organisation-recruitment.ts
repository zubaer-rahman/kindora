import { Document } from "mongoose";
import mongoose from "mongoose";

export interface IOrganisationRecruitment extends Document {
  application: mongoose.Types.ObjectId;
  recruited_by: mongoose.Types.ObjectId;
} 