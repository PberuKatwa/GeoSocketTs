import winston, { Logger as WinstonLogger, LoggerOptions } from "winston";

// 1 Define custom log levels including SOCKETIO
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    httpreq: 3,
    debug: 4,
    SOCKETIO: 5,   // Custom level for socket events
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    httpreq: "magenta",
    debug: "blue",
    SOCKETIO: "cyan", // Color for socket events
  },
};

// 2 Register colors
winston.addColors(customLevels.colors);

// 3 Logger options
const loggerOptions: LoggerOptions = {
  levels: customLevels.levels,
  level: "SOCKETIO", // minimum level to log
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : "";
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
      ),
    }),
    new winston.transports.File({
      filename: "combined.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: "socketio.log",
      level: "SOCKETIO", // Only logs SOCKETIO messages
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
};

// 4 Extend WinstonLogger type to include SOCKETIO method
interface LoggerWithSocketIO extends WinstonLogger {
  SOCKETIO: (message: string, meta?: any) => void;
}

// 5 Create the logger and cast to LoggerWithSocketIO
const logger: LoggerWithSocketIO = winston.createLogger(loggerOptions) as any;

// 6 Add SOCKETIO method dynamically
logger.SOCKETIO = (message: string, meta?: any) => {
  logger.log("SOCKETIO", message, meta);
};

export default logger;
