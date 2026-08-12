import { createOpportunitySchema } from "@/server/validators/opportunity.validator";
import { organizationProfileSchema } from "@/server/validators/user.validator";
import { z } from "zod";

export type CreateOpportunityInput = z.infer<typeof createOpportunitySchema>;

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
    typeof organizationProfileSchema

  > & {
    _id: string;
  };
  applicantCount?: number;
  recruitCount?: number;
  is_archived: boolean;
}; 
