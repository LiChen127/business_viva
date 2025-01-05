/**
 * Response fomatter
 */
import { Response } from 'express';

export const responseFormatHandler = (res: Response, code: number, message: string, data?: any) => {
  return res.status(code).json({
    code,
    message,
    data: data || {},
  });
}

