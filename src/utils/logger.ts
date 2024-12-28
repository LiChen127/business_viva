import winston from 'winston';
import { TransformableInfo } from 'logform';


// 定义日志级别
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// 定义日志类型
export enum LogType {
  USER = 'user',
  AUTH = 'auth',
  SYSTEM = 'system',
  ERROR = 'error',
  API = 'api',
  DB = 'db',
  CACHE = 'cache'
}

// 定义日志格式接口
interface LogInfo extends TransformableInfo {
  level: LogLevel;
  type?: LogType;
  method?: string;
  url?: string;
  userId?: string;
  action?: string;
  duration?: number;
  error?: Error;
  metadata?: Record<string, any>;
}

// 自定义格式化
const customFormat = winston.format.printf((info: TransformableInfo) => {
  const {
    timestamp = new Date().toISOString(),
    level,
    type = LogType.SYSTEM,
    method,
    url,
    userId,
    action,
    duration,
    error,
    metadata
  } = info as LogInfo;

  let logMessage = `${timestamp} [${level.toUpperCase()}] [${type}]`;

  if (method && url) {
    logMessage += ` ${method.toUpperCase()} ${url}`;
  }

  if (userId) {
    logMessage += ` UserId:${userId}`;
  }

  if (action) {
    logMessage += ` Action:${action}`;
  }

  if (duration) {
    logMessage += ` Duration:${duration}ms`;
  }

  if (error) {
    logMessage += `\nError: ${error.message}\nStack: ${error.stack}`;
  }

  if (metadata) {
    logMessage += `\nMetadata: ${JSON.stringify(metadata)}`;
  }

  return logMessage;
});

// 创建logger实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    customFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// 辅助方法
export const logUserAction = (
  action: string,
  userId: string,
  metadata?: Record<string, any>
) => {
  logger.info('', {
    type: LogType.USER,
    action,
    userId,
    metadata
  });
};

export const logAPICall = (
  method: string,
  url: string,
  duration: number,
  metadata?: Record<string, any>
) => {
  logger.info('', {
    type: LogType.API,
    method,
    url,
    duration,
    metadata
  });
};

export const logError = (
  error: Error,
  metadata?: Record<string, any>
) => {
  logger.error(LogType.ERROR, {
    error,
    metadata
  });
};

export default logger;
