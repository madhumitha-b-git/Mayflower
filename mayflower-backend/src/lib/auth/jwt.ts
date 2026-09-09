import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  outletId?: string;
}

export const signToken = async (payload: JWTPayload): Promise<string> => {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<JWTPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
