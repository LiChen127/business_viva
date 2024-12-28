import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * 验证token
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const authMIddleware = (req: Request, res: Response, next: NextFunction) => {

  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1]

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  // jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
  //   if (err) return res.status(401).json({ message: 'Unauthorized' });
  // });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
