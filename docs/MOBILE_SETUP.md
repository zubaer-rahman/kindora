# Mobile-Ready Backend Setup Guide

This document covers all the changes made to make your Kindora backend mobile-ready for Expo/React Native apps.

## What Was Implemented

### 1. **Token-Based Authentication**
- **File**: `server/modules/auth/mobile-token.ts`
- Separate token generation for mobile apps
- **Access Token**: Short-lived (1 hour) for API requests
- **Refresh Token**: Long-lived (30 days) for obtaining new access tokens
- JWT-based with proper expiration handling

### 2. **New Mobile-Specific Auth Endpoints**
- **File**: `server/modules/auth/index.ts`

#### `auth.mobileLogin`
```typescript
// Request
POST /api/trpc/auth.mobileLogin
{
  email: "user@example.com",
  password: "password123"
}

// Response
{
  message: "Logged in successfully",
  data: {
    accessToken: "eyJhbGc...",
    refreshToken: "eyJhbGc...",
    expiresIn: 3600,
    tokenType: "Bearer",
    user: {
      id: "userId",
      email: "user@example.com",
      name: "User Name",
      role: "volunteer"
    }
  }
}
```

#### `auth.mobileSignup`
```typescript
// Request
POST /api/trpc/auth.mobileSignup
{
  email: "user@example.com",
  password: "password123",
  name: "User Name",
  role: "volunteer" // optional
}

// Response (same as mobileLogin)
```

#### `auth.refreshToken`
```typescript
// Request
POST /api/trpc/auth.refreshToken
{
  refreshToken: "eyJhbGc..."
}

// Response
{
  message: "Token refreshed successfully",
  data: {
    accessToken: "eyJhbGc...",
    refreshToken: "eyJhbGc...",
    expiresIn: 3600,
    tokenType: "Bearer"
  }
}
```

### 3. **CORS Configuration**
- **File**: `server/middlewares/cors.ts`
- Allows mobile clients to make HTTP requests from different origins
- Configurable allowed origins (development: all, production: whitelist)
- Proper handling of preflight requests (OPTIONS)

**Configuration** (environment variables):
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://192.168.1.100:3000
```

### 4. **Authorization Header Support**
- **Files**: 
  - `server/config/context.ts`
  - `server/middlewares/with-auth.ts`

Mobile apps pass tokens via `Authorization: Bearer <token>` header instead of cookies.

The middleware now:
- Checks for session (NextAuth) first
- Falls back to Authorization header if no session
- Validates JWT tokens from headers
- Works seamlessly with both web and mobile clients

### 5. **tRPC HTTP Client for Mobile**
- **File**: `utils/mobile-client.ts`

Features:
- Automatic token refresh on 401 responses
- Request/response interceptors
- Error handling and logging
- Queue management for concurrent refresh requests
- SuperJSON transformer for Date/Map serialization

### 6. **Complete Expo Setup Example**
- **File**: `docs/EXPO_SETUP.md`

Includes:
- Token storage using Expo Secure Store
- Auth context setup
- Environment configuration
- Example components
- Usage patterns

## Backend Configuration

### Environment Variables
```env
# Auth
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-secret-key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://192.168.1.100:3000

# For production
NODE_ENV=production
```

## Frontend Setup (Expo App)

### Step 1: Install Dependencies
```bash
npm install @trpc/client superjson expo-secure-store
# or
yarn add @trpc/client superjson expo-secure-store
```

### Step 2: Create Token Storage
```typescript
// utils/token-storage.ts
import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('accessToken');
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('refreshToken');
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync('accessToken', accessToken),
      SecureStore.setItemAsync('refreshToken', refreshToken),
    ]);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
    ]);
  },
};
```

### Step 3: Create Auth Context
See `docs/EXPO_SETUP.md` for complete implementation.

### Step 4: Configure Environment
```env
# .env.local
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
# Use machine IP, not localhost for physical devices
```

### Step 5: Initialize Client in App
```typescript
import { AuthProvider } from '@/context/auth-context';

export default function App() {
  return (
    <AuthProvider>
      {/* Your app content */}
    </AuthProvider>
  );
}
```

## Usage Examples

### Login
```typescript
const { login } = useAuth();

try {
  await login('user@example.com', 'password123');
  // User is authenticated, tokens are stored securely
} catch (error) {
  console.error('Login failed:', error);
}
```

### Making API Calls
```typescript
const { trpcClient } = useAuth();

const opportunities = await trpcClient.opportunities.getOpportunities.query({
  page: 1,
  limit: 10,
});
```

### Logout
```typescript
const { logout } = useAuth();

await logout();
// Tokens are cleared, user is logged out
```

## Security Considerations

### 1. Token Storage
- **Mobile**: Tokens stored in secure storage (`expo-secure-store`)
- **Web**: Tokens stored in memory or secure cookies
- Never store tokens in AsyncStorage or plain text

### 2. Token Lifetime
- **Access Token**: 1 hour (short-lived for security)
- **Refresh Token**: 30 days (long-lived for convenience)
- Tokens are automatically refreshed when expired

### 3. HTTPS in Production
- Always use HTTPS in production
- Configure CORS whitelist to specific origins
- Never expose sensitive endpoints to all origins

### 4. Token Rotation
- Consider implementing token rotation on refresh
- Invalidate old refresh tokens after rotation

## Testing Mobile Endpoints

### Using cURL
```bash
# Login
curl -X POST http://localhost:3000/api/trpc/auth.mobileLogin \
  -H "Content-Type: application/json" \
  -d '{"json":{"email":"user@example.com","password":"password123"}}'

# Refresh Token
curl -X POST http://localhost:3000/api/trpc/auth.refreshToken \
  -H "Content-Type: application/json" \
  -d '{"json":{"refreshToken":"your-refresh-token"}}'

# Protected Endpoint with Token
curl -X GET http://localhost:3000/api/trpc/volunteers.getVolunteerProfile \
  -H "Authorization: Bearer your-access-token"
```

### Using Postman
1. Set request method to POST
2. URL: `http://localhost:3000/api/trpc/auth.mobileLogin`
3. Headers: `Content-Type: application/json`
4. Body (JSON):
```json
{
  "json": {
    "email": "user@example.com",
    "password": "password123"
  }
}
```

## Troubleshooting

### 401 Unauthorized
- Check if token is valid
- Verify Authorization header format: `Bearer <token>`
- Try refreshing the token

### CORS Errors
- Check `ALLOWED_ORIGINS` environment variable
- Verify origin matches exactly (protocol, host, port)
- In development, you can allow all origins

### Token Refresh Loop
- Ensure `REFRESH_TOKEN_SECRET` is set
- Verify refresh token hasn't expired
- Check that user still exists in database

### Network Errors on Physical Device
- Use machine IP address instead of localhost
- Ensure device is on same network as backend
- Check firewall rules

## Files Changed

```
server/
  ├── modules/auth/
  │   ├── index.ts (added mobile endpoints)
  │   └── mobile-token.ts (new)
  ├── middlewares/
  │   ├── cors.ts (new)
  │   └── with-auth.ts (updated for headers)
  └── config/
      └── context.ts (updated for mobile tokens)

app/api/trpc/
  └── [trpc]/route.ts (added CORS support)

utils/
  └── mobile-client.ts (new)

docs/
  └── EXPO_SETUP.md (new - complete example)
```

## Next Steps

1. **Test the endpoints**: Use cURL or Postman to verify endpoints work
2. **Set up Expo project**: Follow the steps in `docs/EXPO_SETUP.md`
3. **Configure environment**: Set `ALLOWED_ORIGINS` and token secrets
4. **Deploy**: Ensure HTTPS is enabled in production
5. **Monitor**: Log authentication events for security auditing

## References

- [tRPC Documentation](https://trpc.io)
- [Expo Documentation](https://docs.expo.dev)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [CORS Specification](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
