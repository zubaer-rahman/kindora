 type AppRouter = any; // mocked for migration
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>();