# Mobile Backend Quick Reference

## 🚀 Quick Start Checklist

### Backend Setup (Already Done ✅)
- [x] Token generation system (`mobile-token.ts`)
- [x] Mobile auth endpoints (`auth.mobileLogin`, `auth.mobileSignup`, `auth.refreshToken`)
- [x] CORS configuration (`cors.ts`)
- [x] Authorization header support (in context & middleware)
- [x] tRPC HTTP client for mobile (`mobile-client.ts`)
- [x] Documentation & examples

### Next: Expo App Setup

```bash
# 1. Install dependencies
npm install @trpc/client superjson expo-secure-store

# 2. Create token storage (see EXPO_SETUP.md)
# 3. Create auth context (see EXPO_SETUP.md)
# 4. Set environment variables
# 5. Initialize in App.tsx
```

---

## API Endpoints

### Login (Mobile)
```
POST /api/trpc/auth.mobileLogin
Content-Type: application/json

{
  "json": {
    "email": "user@example.com",
    "password": "password123"
  }
}

✅ Returns: { accessToken, refreshToken, user }
```

### Signup (Mobile)
```
POST /api/trpc/auth.mobileSignup
Content-Type: application/json

{
  "json": {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "role": "volunteer"
  }
}

✅ Returns: { accessToken, refreshToken, user }
```

### Refresh Token
```
POST /api/trpc/auth.refreshToken
Content-Type: application/json

{
  "json": {
    "refreshToken": "eyJhbGc..."
  }
}

✅ Returns: { accessToken, refreshToken, expiresIn }
```

### Protected Endpoints
```
POST /api/trpc/volunteers.getVolunteerProfile
Authorization: Bearer <accessToken>

✅ Auto-refreshes token on 401
✅ Queues requests during refresh
```

---

## Environment Variables

### Backend (.env.local)
```env
JWT_SECRET=your-secret-key-min-32-chars
REFRESH_TOKEN_SECRET=your-refresh-secret-key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8081,http://192.168.1.100:3000
NODE_ENV=development
```

### Expo App (.env.local)
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```
⚠️ Use machine IP for physical devices, not localhost

---

## Token Flow

```
┌─────────────────────────────────────┐
│ 1. User Login (mobileLogin)         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. Receive accessToken + refreshToken│
│    Store in Secure Storage          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. API Request with Bearer Token    │
│    Authorization: Bearer <token>    │
└────────────┬────────────────────────┘
             │
             ├─── Token Valid? ──────────────────► API Success
             │
             └─── Token Expired? ─────┬──────────► 401 Response
                                      │
                                      ▼
                      ┌──────────────────────────┐
                      │ 4. Auto-Refresh Token    │
                      │    (refreshToken)        │
                      └────────┬─────────────────┘
                               │
                               ▼
                      ┌──────────────────────────┐
                      │ 5. Retry Original Request│
                      │    with new token        │
                      └────────┬─────────────────┘
                               │
                               ▼
                             Success ✅
```

---

## Code Examples

### Initialize Client (Expo)
```typescript
import { createMobileClient } from '@/utils/mobile-client';
import { tokenStorage } from '@/utils/token-storage';

const client = createMobileClient({
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  tokenStorage: {
    accessToken: await tokenStorage.getAccessToken(),
    refreshToken: await tokenStorage.getRefreshToken(),
  },
  onTokenRefresh: async (tokens) => {
    await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
  },
  onTokenExpired: async () => {
    // Redirect to login
  },
});
```

### Use in Component
```typescript
const { trpcClient } = useAuth();

// Query
const data = await trpcClient.opportunities.getOpportunities.query({
  page: 1,
  limit: 10,
});

// Mutation
const result = await trpcClient.applications.applyToOpportunity.mutate({
  opportunityId: "123",
});
```

---

## Testing

### cURL Test
```bash
# Login
curl -X POST http://localhost:3000/api/trpc/auth.mobileLogin \
  -H "Content-Type: application/json" \
  -d '{"json":{"email":"test@example.com","password":"password123"}}'

# Refresh
curl -X POST http://localhost:3000/api/trpc/auth.refreshToken \
  -H "Content-Type: application/json" \
  -d '{"json":{"refreshToken":"YOUR_REFRESH_TOKEN"}}'
```

### Test CORS
```bash
curl -X OPTIONS http://localhost:3000/api/trpc/auth.mobileLogin \
  -H "Origin: http://localhost:8081" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check token validity, ensure Bearer format |
| CORS Error | Add origin to `ALLOWED_ORIGINS`, restart server |
| Token not refreshing | Verify `REFRESH_TOKEN_SECRET` is set |
| Physical device can't connect | Use machine IP, not localhost |
| SecureStore not working | Install `expo-secure-store`, rebuild Expo app |

---

## Security Checklist

- [ ] JWT_SECRET is strong (>32 characters)
- [ ] HTTPS enabled in production
- [ ] ALLOWED_ORIGINS whitelist configured
- [ ] Refresh tokens stored securely
- [ ] Access tokens short-lived (1 hour)
- [ ] No sensitive data in JWT payload
- [ ] CORS headers validated
- [ ] Rate limiting implemented (optional)

---

## File References

| File | Purpose |
|------|---------|
| `server/modules/auth/mobile-token.ts` | Token generation & validation |
| `server/modules/auth/index.ts` | Mobile auth endpoints |
| `server/middlewares/cors.ts` | CORS configuration |
| `server/middlewares/with-auth.ts` | Authorization header support |
| `server/config/context.ts` | tRPC context with header support |
| `utils/mobile-client.ts` | tRPC client for mobile |
| `app/api/trpc/[trpc]/route.ts` | CORS-enabled tRPC handler |
| `docs/MOBILE_SETUP.md` | Detailed setup guide |
| `docs/EXPO_SETUP.md` | Expo example code |

---

## Resources

- [tRPC HTTP Client Docs](https://trpc.io/docs/client/headers)
- [Expo Secure Store](https://docs.expo.dev/modules/expo-secure-store/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## Support

For issues or questions:
1. Check troubleshooting table above
2. Review `docs/MOBILE_SETUP.md` for detailed explanations
3. Check `docs/EXPO_SETUP.md` for code examples
4. Verify environment variables are set correctly
5. Enable development logging for debugging
