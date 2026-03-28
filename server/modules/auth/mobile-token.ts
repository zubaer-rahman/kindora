import jwt, { SignOptions } from 'jsonwebtoken';
import User from '@/server/db/models/user';

export interface MobileTokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

const signOptions: SignOptions = {
  issuer: 'kindora-backend',
  audience: 'mobile-app',
};

/**
 * Generate access token for mobile apps (short-lived)
 * Default expiration: 1 hour
 */
export const generateAccessToken = (userId: string, email: string, role: string, expiresIn = '1h'): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const token = jwt.sign(
    {
      id: userId,
      email,
      role,
    },
    secret as string,
    {
      ...signOptions,
      expiresIn,
    } as SignOptions
  );
  return token;
};

/**
 * Generate refresh token for mobile apps (long-lived)
 * Default expiration: 30 days
 */
export const generateRefreshToken = (userId: string, expiresIn = '30d'): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'your-secret-key';
  const token = jwt.sign(
    {
      id: userId,
      type: 'refresh',
    },
    secret as string,
    {
      ...signOptions,
      expiresIn,
    } as SignOptions
  );
  return token;
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): MobileTokenPayload | null => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key',
      {
        issuer: 'kindora-backend',
        audience: 'mobile-app',
      }
    ) as MobileTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): { id: string; type: string } | null => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'your-secret-key',
      {
        issuer: 'kindora-backend',
        audience: 'mobile-app',
      }
    ) as any;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Create mobile auth tokens for a user
 */
export const createMobileTokens = async (userId: string) => {
  const user = (await User.findById(userId).lean()) as any;
  if (!user) {
    throw new Error('User not found');
  }

  const accessToken = generateAccessToken(
    userId,
    user.email,
    user.role,
    '1h'
  );

  const refreshToken = generateRefreshToken(userId, '30d');

  return {
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 hour in seconds
    tokenType: 'Bearer',
  };
};
