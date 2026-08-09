import { Schema, model, models } from 'mongoose';
import { IGroup } from '../interfaces/group';

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    admins: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    isOrganizationGroup: {
      type: Boolean,
      default: false,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: 'opportunity',
      required: false,
    },
    avatar: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

groupSchema.index({ members: 1 });
groupSchema.index({ createdBy: 1 });

export const Group = models.group || model<IGroup>('group', groupSchema); 