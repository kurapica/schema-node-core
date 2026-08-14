/** Log level. */
export enum LogLevel {
  TRACE = 0,
  VERBOSE = 1,
  DEBUG = 2,
  INFO = 3,
  WARN = 4,
  ERROR = 5,
  NONE = 99,
}

/** Logger. */
export class Logger {
  private level: LogLevel = LogLevel.INFO;
  constructor(private prefix = "") {}

  /** Set the log level. */
  setLevel = (value: LogLevel) => this.level = value;

  /** Log a trace message. */
  trace = (...args: unknown[]) => this.level <= LogLevel.TRACE && console.trace(`${this.prefix}[TRACE]`, ...args);

  /** Log a verbose message. */
  verbose = (...args: unknown[]) => this.level <= LogLevel.VERBOSE && console.debug(`${this.prefix}[VERBOSE]`, ...args);

  /** Log a debug message. */
  debug = (...args: unknown[]) => this.level <= LogLevel.DEBUG && console.debug(`${this.prefix}[DEBUG]`, ...args);

  /** Log an info message. */
  info = (...args: unknown[]) => this.level <= LogLevel.INFO && console.info(`${this.prefix}[INFO]`, ...args);

  /** Log a warn message. */
  warn = (...args: unknown[]) => this.level <= LogLevel.WARN && console.warn(`${this.prefix}[WARN]`, ...args);

  /** Log an error message. */
  error = (...args: unknown[]) => this.level <= LogLevel.ERROR && console.error(`${this.prefix}[ERROR]`, ...args);
}

/** Schema core logger. */
export const logger = new Logger("[Schema][Core]");