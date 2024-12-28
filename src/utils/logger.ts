import winston from 'winston';
import { TransformableInfo } from 'logform';

type LogFormat = {
  timestamp: string;
  method: string;
  url: string;
}

const logFormat = winston.format.printf((info: TransformableInfo) => {
  const { timestamp, method, url } = info;
  return `${timestamp} [${String(method).toUpperCase()}] ${url}`;
});


const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log', level: 'info' }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
  exitOnError: false,
})


export default logger;
