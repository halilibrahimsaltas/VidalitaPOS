import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vidalita-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, service, ...meta }) => {
          const ts = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${ts} [${service || 'vidalita-backend'}] ${level}: ${message} ${metaStr}`;
        })
      ),
    })
  );
}

export default logger;

