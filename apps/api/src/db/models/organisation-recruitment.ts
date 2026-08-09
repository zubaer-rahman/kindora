import mongoose, { Schema } from "mongoose";
import { IOrganisationRecruitment } from "../interfaces/organisation-recruitment";

const OrganisationRecruitmentSchema: Schema = new Schema<IOrganisationRecruitment>(
  {
    application: {
      type: Schema.Types.ObjectId,
      ref: "volunteer_application",
      required: true,
    },
    recruited_by: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

 OrganisationRecruitmentSchema.index(
  { application: 1 },
  { unique: true }
);

const OrganisationRecruitment = mongoose.models.organisation_recruitment || 
  mongoose.model<IOrganisationRecruitment>("organisation_recruitment", OrganisationRecruitmentSchema);

export default OrganisationRecruitment; 