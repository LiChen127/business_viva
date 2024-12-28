/**
 * 装饰器校验
 */

import { Request, Response, NextFunction } from 'express';

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    next();
  }
}