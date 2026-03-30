import { z } from "zod";

const createOpportunitySchema = z.object({
  title: z.string().min(1, "Please enter a title for your opportunity"),
  description: z.string().min(1, "Please provide a description of your opportunity"),
  category: z.array(z.string()).min(1, "Please select at least one category"),
  required_skills: z.array(z.string()).min(1, "Please select at least one required skill"),
  requirements: z.array(z.string()).optional(),
  commitment_type: z.string().min(1, "Please select a commitment type"),
  location: z.string().min(1, "Please enter a location"),
  number_of_volunteers: z.coerce.number().min(1, "Number of volunteers must be at least 1"),
  email_contact: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone_contact: z.string().optional(),
  internal_reference: z.string().optional(),
  external_event_link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  start_date: z.string().optional(),
  start_time: z.string().optional(),
  end_date: z.string().optional(),
  end_time: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence: z.object({
    type: z.string(),
    days: z.array(z.string()).optional(),
    date_range: z.object({
      start_date: z.string(),
      end_date: z.string().optional()
    }),
    time_range: z.object({
      start_time: z.string(),
      end_time: z.string()
    }),
    occurrences: z.number().optional()
  }).optional(),
  banner_img: z.string().optional(),
  organization_id: z.string().optional()
}).refine((data) => {
  // For work-based opportunities, end_date is required
  if (data.commitment_type === "workbased") {
    return data.end_date && data.end_date.trim() !== "";
  }
  return true;
}, {
  message: "End date is required for work-based opportunities",
  path: ["end_date"]
}).refine((data) => {
  // If both start_date and end_date are provided, end_date must be after or equal to start_date
  if (data.start_date && data.end_date && data.start_date.trim() !== "" && data.end_date.trim() !== "") {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: "End date must be on or after start date",
  path: ["end_date"]
});

const updateOpportunitySchema = z.object({
  id: z.string().min(1, "Opportunity ID is required"),
  title: z.string().min(1, "Please enter a title for your opportunity"),
  description: z.string().min(1, "Please provide a description of your opportunity"),
  category: z.array(z.string()).min(1, "Please select at least one category"),
  required_skills: z.array(z.string()).min(1, "Please select at least one required skill"),
  requirements: z.array(z.string()).optional(),
  commitment_type: z.string().min(1, "Please select a commitment type"),
  location: z.string().min(1, "Please enter a location"),
  number_of_volunteers: z.coerce.number().min(1, "Number of volunteers must be at least 1"),
  email_contact: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone_contact: z.string().optional(),
  internal_reference: z.string().optional(),
  external_event_link: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  start_date: z.string().optional(),
  start_time: z.string().optional(),
  end_date: z.string().optional(),
  end_time: z.string().optional(),
  is_recurring: z.boolean().default(false),
  recurrence: z.object({
    type: z.string(),
    days: z.array(z.string()).optional(),
    date_range: z.object({
      start_date: z.string(),
      end_date: z.string().optional()
    }),
    time_range: z.object({
      start_time: z.string(),
      end_time: z.string()
    }),
    occurrences: z.number().optional()
  }).optional(),
  banner_img: z.string().optional(),
  organization_id: z.string().optional()
}).refine((data) => {
  // For work-based opportunities, end_date is required
  if (data.commitment_type === "workbased") {
    return data.end_date && data.end_date.trim() !== "";
  }
  return true;
}, {
  message: "End date is required for work-based opportunities",
  path: ["end_date"]
}).refine((data) => {
  // If both start_date and end_date are provided, end_date must be after or equal to start_date
  if (data.start_date && data.end_date && data.start_date.trim() !== "" && data.end_date.trim() !== "") {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: "End date must be on or after start date",
  path: ["end_date"]
});

const getAllOpportunitiesSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(6),
  search: z.string().optional(),
  categories: z.array(z.string()).optional(),
  commitmentType: z.enum(["all", "workbased", "eventbased"]).default("all"),
  location: z.string().optional(),
  availability: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }).optional(),
  sortBy: z.enum(["recently_added", "start_date", "best_matches"]).default("recently_added"),
});

export const opportunityValidation = {
  createOpportunitySchema,
  updateOpportunitySchema,
  getAllOpportunitiesSchema
};
