/**
 * tRPC HTTP Client for Mobile Apps (Expo/React Native)
 * This client handles:
 * - Token refresh on 401 responses
 * - Request/response interceptors
 * - Error handling
 * - SuperJSON transformer support
 *
 * NOTE: Configure superjson transformer at the tRPC initialization level in your Expo app:
 * const trpcClient = createTRPCClient({
 *   transformer: superjson,
 *   links: [httpBatchLink({ ... })]
 * })
 */

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server';

interface TokenStorage {
  accessToken: string | null;
  refreshToken: string | null;
}

interface MobileClientConfig {
  apiUrl: string;
  tokenStorage: TokenStorage;
  onTokenRefresh?: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  onTokenExpired?: () => Promise<void>;
}

let clientConfig: MobileClientConfig | null = null;

/**
 * Initialize the mobile tRPC client with configuration
 */
export const initializeMobileClient = (config: MobileClientConfig) => {
  clientConfig = config;
};

/**
 * Get the authorization header with current access token
 */
const getAuthHeader = (): Record<string, string> => {
  if (!clientConfig?.tokenStorage.accessToken) {
    return {};
  }
  return {
    Authorization: `Bearer ${clientConfig.tokenStorage.accessToken}`,
  };
};

/**
 * Refresh the access token using the refresh token
 */
const refreshAccessToken = async (): Promise<boolean> => {
  if (!clientConfig || !clientConfig.tokenStorage.refreshToken) {
    await clientConfig?.onTokenExpired?.();
    return false;
  }

  try {
    const response = await fetch(`${clientConfig.apiUrl}/api/trpc/auth.refreshToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          refreshToken: clientConfig.tokenStorage.refreshToken,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    if (data.result?.data) {
      const { accessToken, refreshToken } = data.result.data;
      
      clientConfig.tokenStorage.accessToken = accessToken;
      clientConfig.tokenStorage.refreshToken = refreshToken;
      
      await clientConfig.onTokenRefresh?.({ accessToken, refreshToken });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    await clientConfig?.onTokenExpired?.();
    return false;
  }
};

/**
 * Create a tRPC client for mobile apps with auto token refresh
 */
export const createMobileClient = (config: MobileClientConfig) => {
  initializeMobileClient(config);

  let isRefreshing = false;
  let refreshQueue: ((token: string) => void)[] = [];

  const processQueue = (token: string) => {
    refreshQueue.forEach(callback => callback(token));
    refreshQueue = [];
  };

  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${config.apiUrl}/api/trpc`,
        headers: () => getAuthHeader(),
        async fetch(url, options) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let response = await fetch(url, options as any);

            // Handle 401 - try to refresh token
            if (response.status === 401 && config.tokenStorage.refreshToken) {
              if (!isRefreshing) {
                isRefreshing = true;
                const success = await refreshAccessToken();
                isRefreshing = false;

                if (success) {
                  processQueue(config.tokenStorage.accessToken!);

                  // Retry the original request with new token
                  const newHeaders = {
                    ...((options as any)?.headers || {}),
                    ...getAuthHeader(),
                  };

                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  response = await fetch(url, {
                    ...(options as any),
                    headers: newHeaders,
                  });
                } else {
                  processQueue('');
                }
              } else {
                // Wait for refresh to complete
                await new Promise<void>(resolve => {
                  refreshQueue.push(() => resolve());
                });

                const newHeaders = {
                  ...((options as any)?.headers || {}),
                  ...getAuthHeader(),
                };

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                response = await fetch(url, {
                  ...(options as any),
                  headers: newHeaders,
                });
              }
            }

            return response;
          } catch (error) {
            console.error('Fetch error:', error);
            throw error;
          }
        },
      }),
    ],
  });
};

/**
 * Utility function to handle logout (clear stored tokens)
 */
export const clearTokens = async (config: MobileClientConfig) => {
  config.tokenStorage.accessToken = null;
  config.tokenStorage.refreshToken = null;
  await config.onTokenExpired?.();
};

/**
 * Utility function to set tokens (after login)
 */
export const setTokens = (
  config: MobileClientConfig,
  accessToken: string,
  refreshToken: string
) => {
  config.tokenStorage.accessToken = accessToken;
  config.tokenStorage.refreshToken = refreshToken;
};
