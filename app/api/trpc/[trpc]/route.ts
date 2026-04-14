import { createContext } from "@/server/config/context";
import { appRouter } from "@/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { applyCORSHeaders } from "@/server/middlewares/cors";

const handler = async (req: Request) => {
  // Apply CORS headers to all tRPC requests
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      // Extract headers from request for mobile auth support
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });

      // Create context with headers
      return createContext({ headers });
    },
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
          );
        }
        : undefined,
  });

  // Apply CORS headers to response
  if (response instanceof Response) {
    applyCORSHeaders(req, response);
  }

  return response;
};

// Handle CORS preflight
const optionsHandler = (req: Request) => {
  const response = new Response(null, { status: 204 });
  return applyCORSHeaders(req, response);
};

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE, optionsHandler as OPTIONS };
