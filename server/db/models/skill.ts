import mongoose, { Schema } from "mongoose";
import { ISkill } from "../interfaces/skill";

const SkillSchema: Schema = new Schema<ISkill>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    is_custom: {
      type: Boolean,
      default: false
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: function () {
        return this.is_custom === true;
      }
    },
    usage_count: {
      type: Number,
      default: 0
    },
  },
  { timestamps: true }
);

// Create index for faster queries
SkillSchema.index({ is_custom: 1 });

const Skill = mongoose.models.skill || mongoose.model<ISkill>("skill", SkillSchema);

export default Skill; 