import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

export interface AuthRequest extends Request {
  owner?: JwtPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access token required' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    req.owner = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorizeOwner = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.owner) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  if (req.owner.accountType !== 'admin' && req.owner.accountType !== 'superadmin') {
    res.status(403).json({ success: false, message: 'Owner access required' });
    return;
  }

  next();
};