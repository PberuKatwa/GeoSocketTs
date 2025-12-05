import winston, { Logger, LoggerOptions } from "winston";

// 1. Define custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    httpreq: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    httpreq: "magenta",
    debug: "blue",
  },
};

// 2. Register colors
winston.addColors(customLevels.colors);

// 3. Logger options
const loggerOptions: LoggerOptions = {
  levels: customLevels.levels,
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length > 0 
        ? JSON.stringify(meta, null, 2) 
        : '';
      return `${timestamp} [${level}]: ${message} ${metaString}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: "error.log", 
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({ 
      filename: "combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
  ],
};

// 4. Create logger
const logger = winston.createLogger(loggerOptions);

// 5. Optional: Add httpreq method if you need it
export default logger;