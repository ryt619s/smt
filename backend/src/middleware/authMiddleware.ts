import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token provided' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.sub).select('-passwordHash');
    if (!currentUser) {
      res.status(401).json({ error: 'The user belonging to this token no longer exists.' });
      return;
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, token failed or expired' });
  }
};

// Alias used by newer routes
export const authMiddleware = protect;
