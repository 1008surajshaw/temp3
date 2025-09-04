import crypto from 'crypto';

export const generateAccessToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generatePlanToken = (userId: string, planId: string): string => {
  const timestamp = Date.now().toString();
  const data = `${userId}-${planId}-${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};