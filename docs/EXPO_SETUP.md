/**
 * EXAMPLE: Expo/React Native tRPC Client Setup
 * 
 * This is a complete example of how to set up the tRPC client in an Expo app
 * for mobile-ready authentication and API communication.
 * 
 * INSTALLATION STEPS:
 * 1. Install dependencies:
 *    npm install @trpc/client superjson expo-secure-store
 * 
 * 2. Create a context/auth-context.tsx file (as shown below)
 * 3. Wrap your app with AuthProvider in App.tsx
 * 4. Use the useAuth hook to access tokens and methods
 * 5. Use the useTRPC hook to access the tRPC client
 */

// ============================================================================
// 1. Token Storage using Expo Secure Store
// ============================================================================

import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('accessToken');
    } catch (error) {
      console.error('Error reading access token:', error);
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('refreshToken');
    } catch (error) {
      console.error('Error reading refresh token:', error);
      return null;
    }
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        SecureStore.setItemAsync('accessToken', accessToken),
        SecureStore.setItemAsync('refreshToken', refreshToken),
      ]);
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('accessToken'),
        SecureStore.deleteItemAsync('refreshToken'),
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },
};

// ============================================================================
// 2. Auth Context Setup (expo/auth-context.tsx)
// ============================================================================

/**
 * import React, { createContext, useContext, useEffect, useState } from 'react';
 * import { createMobileClient, setTokens as setClientTokens, clearTokens as clearClientTokens } from '@/utils/mobile-client';
 * import { tokenStorage } from '@/utils/token-storage';
 * import type { AppRouter } from '@/server';
 * 
 * interface AuthContextType {
 *   isAuthenticated: boolean;
 *   user: { id: string; email: string; name: string; role: string } | null;
 *   trpcClient: ReturnType<typeof createMobileClient> | null;
 *   login: (email: string, password: string) => Promise<void>;
 *   signup: (email: string, password: string, name: string, role?: string) => Promise<void>;
 *   logout: () => Promise<void>;
 *   isLoading: boolean;
 *   error: string | null;
 * }
 * 
 * const AuthContext = createContext<AuthContextType | undefined>(undefined);
 * 
 * export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
 *   const [isAuthenticated, setIsAuthenticated] = useState(false);
 *   const [user, setUser] = useState<AuthContextType['user']>(null);
 *   const [trpcClient, setTrpcClient] = useState<ReturnType<typeof createMobileClient> | null>(null);
 *   const [isLoading, setIsLoading] = useState(true);
 *   const [error, setError] = useState<string | null>(null);
 * 
 *   const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
 * 
 *   // Initialize tRPC client and restore session on app start
 *   useEffect(() => {
 *     const initializeClient = async () => {
 *       try {
 *         const accessToken = await tokenStorage.getAccessToken();
 *         const refreshToken = await tokenStorage.getRefreshToken();
 * 
 *         const client = createMobileClient({
 *           apiUrl: API_URL,
 *           tokenStorage: {
 *             accessToken,
 *             refreshToken,
 *           },
 *           onTokenRefresh: async (tokens) => {
 *             await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
 *           },
 *           onTokenExpired: async () => {
 *             setIsAuthenticated(false);
 *             setUser(null);
 *             await tokenStorage.clearTokens();
 *           },
 *         });
 * 
 *         setTrpcClient(client);
 * 
 *         if (accessToken && refreshToken) {
 *           setIsAuthenticated(true);
 *           // Optionally fetch user profile here
 *         }
 *       } catch (err) {
 *         console.error('Failed to initialize client:', err);
 *       } finally {
 *         setIsLoading(false);
 *       }
 *     };
 * 
 *     initializeClient();
 *   }, []);
 * 
 *   const login = async (email: string, password: string) => {
 *     try {
 *       setError(null);
 *       setIsLoading(true);
 * 
 *       if (!trpcClient) throw new Error('Client not initialized');
 * 
 *       const response = await trpcClient.auth.mobileLogin.mutate({ email, password });
 *       const { data } = response;
 * 
 *       await tokenStorage.setTokens(data.accessToken, data.refreshToken);
 *       
 *       setClientTokens(
 *         {
 *           apiUrl: API_URL,
 *           tokenStorage: {
 *             accessToken: data.accessToken,
 *             refreshToken: data.refreshToken,
 *           },
 *           onTokenRefresh: async (tokens) => {
 *             await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
 *           },
 *           onTokenExpired: async () => {
 *             setIsAuthenticated(false);
 *             setUser(null);
 *             await tokenStorage.clearTokens();
 *           },
 *         },
 *         data.accessToken,
 *         data.refreshToken
 *       );
 * 
 *       setUser(data.user);
 *       setIsAuthenticated(true);
 *     } catch (err: any) {
 *       const message = err?.message || 'Login failed';
 *       setError(message);
 *       throw err;
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 * 
 *   const signup = async (email: string, password: string, name: string, role?: string) => {
 *     try {
 *       setError(null);
 *       setIsLoading(true);
 * 
 *       if (!trpcClient) throw new Error('Client not initialized');
 * 
 *       const response = await trpcClient.auth.mobileSignup.mutate({
 *         email,
 *         password,
 *         name,
 *         role: (role as any) || 'volunteer',
 *       });
 *       const { data } = response;
 * 
 *       await tokenStorage.setTokens(data.accessToken, data.refreshToken);
 * 
 *       setClientTokens(
 *         {
 *           apiUrl: API_URL,
 *           tokenStorage: {
 *             accessToken: data.accessToken,
 *             refreshToken: data.refreshToken,
 *           },
 *           onTokenRefresh: async (tokens) => {
 *             await tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
 *           },
 *           onTokenExpired: async () => {
 *             setIsAuthenticated(false);
 *             setUser(null);
 *             await tokenStorage.clearTokens();
 *           },
 *         },
 *         data.accessToken,
 *         data.refreshToken
 *       );
 * 
 *       setUser(data.user);
 *       setIsAuthenticated(true);
 *     } catch (err: any) {
 *       const message = err?.message || 'Signup failed';
 *       setError(message);
 *       throw err;
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 * 
 *   const logout = async () => {
 *     try {
 *       setIsLoading(true);
 *       
 *       if (trpcClient) {
 *         await trpcClient.auth.logout.mutate().catch(() => {
 *           // Ignore logout errors; still proceed with clearing local state
 *         });
 *       }
 * 
 *       await tokenStorage.clearTokens();
 *       setIsAuthenticated(false);
 *       setUser(null);
 *       setError(null);
 *     } catch (err: any) {
 *       console.error('Logout error:', err);
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 * 
 *   const value: AuthContextType = {
 *     isAuthenticated,
 *     user,
 *     trpcClient,
 *     login,
 *     signup,
 *     logout,
 *     isLoading,
 *     error,
 *   };
 * 
 *   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
 * };
 * 
 * export const useAuth = () => {
 *   const context = useContext(AuthContext);
 *   if (!context) {
 *     throw new Error('useAuth must be used within AuthProvider');
 *   }
 *   return context;
 * };
 */

// ============================================================================
// 3. Environment Configuration (.env.local for Expo)
// ============================================================================

/**
 * Add to your Expo .env.local file:
 * 
 * EXPO_PUBLIC_API_URL=http://your-backend-url.com
 * # or for development:
 * EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
 * 
 * Note: Use your machine's IP address instead of localhost for physical devices
 */

// ============================================================================
// 4. Example Usage in a React Component
// ============================================================================

/**
 * import React, { useState } from 'react';
 * import { View, TextInput, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
 * import { useAuth } from '@/context/auth-context';
 * 
 * export const LoginScreen: React.FC = () => {
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *   const { login, isLoading, error } = useAuth();
 * 
 *   const handleLogin = async () => {
 *     try {
 *       await login(email, password);
 *       // Navigation to home screen happens automatically
 *     } catch (err) {
 *       // Error is handled in the context and displayed
 *     }
 *   };
 * 
 *   return (
 *     <View style={{ flex: 1, padding: 20 }}>
 *       <TextInput
 *         placeholder="Email"
 *         value={email}
 *         onChangeText={setEmail}
 *         editable={!isLoading}
 *       />
 *       <TextInput
 *         placeholder="Password"
 *         value={password}
 *         onChangeText={setPassword}
 *         secureTextEntry
 *         editable={!isLoading}
 *       />
 * 
 *       {error && <Text style={{ color: 'red' }}>{error}</Text>}
 * 
 *       <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
 *         {isLoading ? <ActivityIndicator /> : <Text>Login</Text>}
 *       </TouchableOpacity>
 *     </View>
 *   );
 * };
 */

// ============================================================================
// 5. Example: Using tRPC Client to Fetch Data
// ============================================================================

/**
 * import { useEffect, useState } from 'react';
 * import { useAuth } from '@/context/auth-context';
 * 
 * export const OpportunitiesScreen: React.FC = () => {
 *   const { trpcClient } = useAuth();
 *   const [opportunities, setOpportunities] = useState([]);
 *   const [loading, setLoading] = useState(true);
 * 
 *   useEffect(() => {
 *     const fetchOpportunities = async () => {
 *       try {
 *         if (!trpcClient) return;
 * 
 *         const data = await trpcClient.opportunities.getAll.query({
 *           page: 1,
 *           limit: 10,
 *         });
 * 
 *         setOpportunities(data);
 *       } catch (error) {
 *         console.error('Failed to fetch opportunities:', error);
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 * 
 *     fetchOpportunities();
 *   }, [trpcClient]);
 * 
 *   if (loading) return <Text>Loading...</Text>;
 * 
 *   return (
 *     <FlatList
 *       data={opportunities}
 *       renderItem={({ item }) => <Text>{item.title}</Text>}
 *       keyExtractor={(item) => item.id}
 *     />
 *   );
 * };
 */

// ============================================================================
// 6. TypeScript Types for Mobile Client
// ============================================================================

export type MobileUser = {
  id: string;
  email: string;
  name: string;
  role: 'volunteer' | 'admin' | 'mentor' | 'organization';
  image?: string | null;
};

export type MobileTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
};

export type MobileAuthResponse = {
  data: MobileTokens & {
    user: MobileUser;
  };
  message: string;
  status: number;
};
