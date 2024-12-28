import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { BaseResponse } from '@/types/response';

export const authMiddleware = (
  req: Request,
  res: Response<BaseResponse>,
  next: NextFunction
): void => {
  const token = req.headers.cookie?.split('=')[1];
  if (!token) {
    res.status(403).json({
      code: 403,
      message: '未提供令牌',
    });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'viva_jwt_secret');

    if (decoded) {
      next();
    } else {
      res.status(401).json({
        code: 401,
        message: '无效的令牌',
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '服务器错误',
    });
    return;
  }
};
