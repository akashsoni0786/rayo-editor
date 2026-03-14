type LogLevel = 'debug' | 'info' | 'warn' | 'error';
interface LoggerConfig {
    enabled: boolean;
    level: LogLevel;
    production: boolean;
    development: boolean;
    prefix?: string;
    timestamp?: boolean;
}
declare class Logger {
    private config;
    constructor(config?: Partial<LoggerConfig>);
    private shouldLog;
    private formatMessage;
    debug(message: any, ...args: any[]): void;
    info(message: any, ...args: any[]): void;
    warn(message: any, ...args: any[]): void;
    error(message: any, ...args: any[]): void;
    log(message: any, ...args: any[]): void;
    group(label: string): void;
    groupEnd(): void;
    time(label: string): void;
    timeEnd(label: string): void;
    setLevel(level: LogLevel): void;
    enable(): void;
    disable(): void;
    getConfig(): {
        enabled: boolean;
        level: LogLevel;
        production: boolean;
        development: boolean;
        prefix?: string;
        timestamp?: boolean;
    };
    updateConfig(newConfig: Partial<LoggerConfig>): void;
}
export declare const logger: Logger;
export declare const authLogger: Logger;
export declare const blogLogger: Logger;
export declare const apiLogger: Logger;
export default logger;
//# sourceMappingURL=logger.d.ts.map