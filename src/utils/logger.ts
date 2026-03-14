// Custom Logger - Use this instead of console.log throughout your app
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  production: boolean;
  development: boolean;
  prefix?: string;
  timestamp?: boolean;
}

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      enabled: true,
      level: 'debug',
      production: false, // Disable in production
      development: true, // Enable in development
      prefix: '[App]',
      timestamp: true,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const isProd = import.meta.env.PROD;
    const isDev = import.meta.env.DEV;
    
    // Check if logging is enabled for current environment
    const environmentEnabled = isProd ? this.config.production : this.config.development;
    
    if (!this.config.enabled || !environmentEnabled) {
      return false;
    }

    // Check if current level should be logged
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(level: LogLevel, message: any, ...args: any[]): any[] {
    const parts: any[] = [];
    
    if (this.config.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    
    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }
    
    parts.push(`[${level.toUpperCase()}]`, message, ...args);
    
    return parts;
  }

  public debug(message: any, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log(...this.formatMessage('debug', message, ...args));
    }
  }

  public info(message: any, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(...this.formatMessage('info', message, ...args));
    }
  }

  public warn(message: any, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(...this.formatMessage('warn', message, ...args));
    }
  }

  public error(message: any, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(...this.formatMessage('error', message, ...args));
    }
  }

  public log(message: any, ...args: any[]) {
    // Alias for info
    this.info(message, ...args);
  }

  // Group logging for related messages
  public group(label: string) {
    if (this.shouldLog('debug')) {
      console.group(label);
    }
  }

  public groupEnd() {
    if (this.shouldLog('debug')) {
      console.groupEnd();
    }
  }

  // Time measurements
  public time(label: string) {
    if (this.shouldLog('debug')) {
      console.time(label);
    }
  }

  public timeEnd(label: string) {
    if (this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }

  // Configuration methods
  public setLevel(level: LogLevel) {
    this.config.level = level;
  }

  public enable() {
    this.config.enabled = true;
  }

  public disable() {
    this.config.enabled = false;
  }

  public getConfig() {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create default logger instance
export const logger = new Logger({
  enabled: true,
  level: 'debug',
  production: false, // Change to true if you want logs in production
  development: true,
  prefix: '[Rayo]',
  timestamp: import.meta.env.DEV, // Only show timestamps in development
});

// Create specialized loggers for different parts of your app
export const authLogger = new Logger({
  enabled: true,
  level: 'debug',
  production: false,
  development: true,
  prefix: '[Auth]',
  timestamp: false,
});

export const blogLogger = new Logger({
  enabled: true,
  level: 'debug',
  production: false,
  development: true,
  prefix: '[Blog]',
  timestamp: false,
});

export const apiLogger = new Logger({
  enabled: true,
  level: 'info', // Only show info and above for API calls
  production: false,
  development: true,
  prefix: '[API]',
  timestamp: false,
});

// Expose logger to window for debugging in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).logger = logger;
  (window as any).authLogger = authLogger;
  (window as any).blogLogger = blogLogger;
  (window as any).apiLogger = apiLogger;
}

export default logger; 