import { opportunityValidation } from "@/server/validators/opportunity.validator";
import { userValidation } from "@/server/validators/user.validator";
import { z } from "zod";

export type CreateOpportunityInput = z.infer<
  typeof opportunityValidation.createOpportunitySchema
>;

export type UpdateOpportunityInput = z.infer<
  typeof opportunityValidation.updateOpportunitySchema
>;

export type Opportunity = CreateOpportunityInput & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  date: {
    start_date: Date;
    end_date?: Date;
  };
  time: {
    start_time: string;
    end_time?: string;
  };
  organization_profile: z.infer<
    typeof userValidation.organizationProfileSchema
  > & {
    _id: string;
  };
  applicantCount?: number;
  recruitCount?: number;
  is_archived: boolean;
};
export interface TabConfig {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

export type OpportunityDetails = {
  id: string;
  title: string;
  organization: {
    title: string;
    id: string;
  };
  location: string;
}; 
