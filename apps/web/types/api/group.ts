
export interface IGroup {
  name: string;
  description?: string;
  members: string[];
  admins: string[];
  createdBy: string;
  isOrganizationGroup: boolean;
  opportunityId?: string; // Add opportunity ID for opportunity-specific groups
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
} 