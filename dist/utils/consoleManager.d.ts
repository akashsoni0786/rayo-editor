/**
 * Console Manager - Provides fine-grained control over console logs
 *
 * Features:
 * - Automatically disables console logs in production
 * - Shows custom branded message (like Google/Facebook style)
 * - Security warning to prevent social engineering attacks
 * - Fully customizable message content
 * - Comprehensive console method disabling
 * - Runtime control via browser console (development only)
 *
 * Usage in browser console (development):
 * - window.consoleManager.enable() / disable()
 * - window.showConsoleMessage()
 * - window.enableConsole() / disableConsole()
 *
 * @author Rayo Development Team
 */
type ConsoleLevel = 'log' | 'warn' | 'error' | 'info' | 'debug' | 'trace';
interface ConsoleConfig {
    enabled: boolean;
    production: boolean;
    development: boolean;
    showCustomMessage: boolean;
    customMessage?: {
        title?: string;
        securityWarning?: boolean;
        companyName?: string;
        hiringMessage?: boolean;
    };
    levels: {
        log: boolean;
        warn: boolean;
        error: boolean;
        info: boolean;
        debug: boolean;
        trace: boolean;
    };
}
declare class ConsoleManager {
    private config;
    private originalConsole;
    constructor(config?: Partial<ConsoleConfig>);
    private applyConfiguration;
    private showCustomMessage;
    private _disableLevel;
    private _enableLevel;
    private disableAll;
    enable(): void;
    disable(): void;
    enableLevel(level: ConsoleLevel): void;
    disableLevel(level: ConsoleLevel): void;
    restore(): void;
    getConfig(): {
        enabled: boolean;
        production: boolean;
        development: boolean;
        showCustomMessage: boolean;
        customMessage?: {
            title?: string;
            securityWarning?: boolean;
            companyName?: string;
            hiringMessage?: boolean;
        };
        levels: {
            log: boolean;
            warn: boolean;
            error: boolean;
            info: boolean;
            debug: boolean;
            trace: boolean;
        };
    };
    updateConfig(newConfig: Partial<ConsoleConfig>): void;
    setCustomMessage(message: Partial<ConsoleConfig['customMessage']>): void;
    showMessage(): void;
}
export declare const consoleManager: ConsoleManager;
export default consoleManager;
//# sourceMappingURL=consoleManager.d.ts.map