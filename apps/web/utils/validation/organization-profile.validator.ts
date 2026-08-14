import { z } from 'zod';

export const organizationIdParamSchema = z.string();

export const listOrganizationsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['name', 'updated']).default('updated'),
});

export const favoriteOrganizationSchema = z.object({
  organizationId: z.string(),
});

export const favoritesPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(6),
});

export type ListOrganizationsQuery = z.infer<typeof listOrganizationsSchema>;
export type FavoriteOrganizationInput = z.infer<typeof favoriteOrganizationSchema>;
export type FavoritesPaginationInput = z.infer<typeof favoritesPaginationSchema>;