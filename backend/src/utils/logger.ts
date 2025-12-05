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

// 3. Logger options with new layout
const loggerOptions: LoggerOptions = {
  levels: customLevels.levels,
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const color = winston.format.colorize().colorize;

      const metaString =
        Object.keys(meta).length > 0 ? JSON.stringify(meta) : "";

      // ✔ Format exactly as requested:
      // INFO 2025-11-22T10:20:01.719Z : message
      return `${color(level, level.toUpperCase())} ${timestamp} : ${message} ${metaString}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
};

// 4. Create logger
const baseLogger = winston.createLogger(loggerOptions) as AppLogger;

export const logger = baseLogger;