# 🔌 API Integration Guide

This document explains how the frontend (`apps/web`) communicates with the backend REST API (`apps/api`).

## 📡 Base Configuration

- **Base URL**: Set via `NEXT_PUBLIC_API_URL` (usually `http://localhost:8000/api/v1` in development).
- **Authentication**: Requests to protected routes require a Bearer token in the `Authorization` header.

## 🔐 Fetching Data (Frontend)

The frontend uses `@tanstack/react-query` alongside Axios for robust data fetching and caching.

### The `useAxiosAuth` Hook
When making requests from client components to protected endpoints, always use the `useAxiosAuth` hook. This hook automatically intercepts the request and attaches the user's `api_token` from their NextAuth session.

**Example Usage:**
```tsx
import { useQuery } from '@tanstack/react-query';
import useAxiosAuth from '@/hooks/useAxiosAuth';

export function UserProfile() {
  const axiosAuth = useAxiosAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await axiosAuth.get('/profiles/me');
      return response.data.data;
    }
  });

  if (isLoading) return <div>Loading...</div>;
  return <div>{data.name}</div>;
}
```

## 🛠 Building New Endpoints (Backend)

When creating a new API endpoint, follow the established modular architecture.

1. **Define Validation Schema (Zod)**
   Create a schema in `src/validators/` to validate incoming requests.
   ```typescript
   export const createItemSchema = z.object({
     title: z.string().min(3),
     description: z.string().optional(),
   });
   ```

2. **Create the Service Function**
   Put business logic in `src/services/`.
   ```typescript
   export async function createItem(input: z.infer<typeof createItemSchema>) {
     // Database operations...
     return await ItemModel.create(input);
   }
   ```

3. **Create the Controller**
   Wrap your controller logic with `catchAsync` to handle errors gracefully. Use `sendResponse` to standardize the JSON output.
   ```typescript
   import { catchAsync } from '../utils/catchAsync';
   import { sendResponse } from '../utils/response';

   export const createItemHandler = catchAsync(async (req, res) => {
     const input = createItemSchema.parse(req.body);
     const data = await createItem(input);
     sendResponse(res, 201, data);
   });
   ```

4. **Register the Route**
   Add the controller to the appropriate router in `src/routes/` and protect it with `requireAuth` if necessary.
   ```typescript
   import { Router } from 'express';
   import { requireAuth } from '../middleware/auth';
   import { createItemHandler } from '../controllers/item.controller';

   const router = Router();
   router.post('/', requireAuth, createItemHandler);
   export default router;
   ```

## 🔍 Pagination & Listing
The API heavily relies on a standardized `listQuerySchema` for GET routes that return lists. This handles `page`, `limit`, `sortBy`, and standard search filters natively, returning paginated meta-data automatically.
