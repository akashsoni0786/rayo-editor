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

// Default configuration
const defaultConfig: ConsoleConfig = {
  enabled: true,
  production: false, // Disable in production
  development: true, // Enable in development
  showCustomMessage: true,
  customMessage: {
    title: '🚀 Welcome to Rayo!',
    securityWarning: true,
    companyName: 'Rayo',
    hiringMessage: true,
  },
  levels: {
    log: true,
    warn: true,
    error: true, // Always keep errors visible
    info: true,
    debug: true,
    trace: false, // Usually too verbose
  }
};

class ConsoleManager {
  private config: ConsoleConfig;
  private originalConsole: {
    log: typeof console.log;
    warn: typeof console.warn;
    error: typeof console.error;
    info: typeof console.info;
    debug: typeof console.debug;
    trace: typeof console.trace;
  };

  constructor(config: Partial<ConsoleConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    
    // Store original console methods
    this.originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
      trace: console.trace.bind(console),
    };

    this.applyConfiguration();
  }

  private applyConfiguration() {
    const isProd = import.meta.env.PROD;
    const isDev = import.meta.env.DEV;
    
    // Determine if console should be enabled based on environment
    const environmentEnabled = isProd ? this.config.production : this.config.development;
    const globalEnabled = this.config.enabled && environmentEnabled;

    if (!globalEnabled) {
      // Show custom message before disabling console
      if (this.config.showCustomMessage) {
        this.showCustomMessage();
      }
      // Disable all console methods
      this.disableAll();
      return;
    }

    // Apply level-specific configuration
    Object.entries(this.config.levels).forEach(([level, enabled]) => {
      if (!enabled) {
        this._disableLevel(level as ConsoleLevel);
      } else {
        this._enableLevel(level as ConsoleLevel);
      }
    });
  }

  private showCustomMessage() {
    // Store original console methods before we disable them
    const originalLog = console.log.bind(console);
    const originalWarn = console.warn.bind(console);
    const originalError = console.error.bind(console);
    
    const msg = this.config.customMessage || {};
    const companyName = msg.companyName || 'Rayo';
    
    try {
      // Clear console first
      if (console.clear) console.clear();
      
      // Custom messages with styling (works in modern browsers)
      if (msg.title) {
        originalLog(
          `%c${msg.title}`, 
          'color: #4F46E5; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);'
        );
      }
      
      if (msg.securityWarning) {
        originalLog(
          '%c⚠️ SECURITY WARNING', 
          'color: #DC2626; font-size: 18px; font-weight: bold; background: #FEE2E2; padding: 8px; border-radius: 4px;'
        );
        
        originalLog(
          '%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable a feature or "hack" someone\'s account, it is a scam and will give them access to your account.',
          'color: #991B1B; font-size: 14px; line-height: 1.5; margin: 8px 0;'
        );
      }
      
      originalLog(
        `%c🔒 Console logging has been disabled for security and performance reasons.`,
        'color: #059669; font-size: 12px; font-style: italic;'
      );
      
      if (msg.hiringMessage) {
        originalLog(
          `%c💼 Interested in working with ${companyName}? Check out our careers page!`,
          'color: #5E33FF; font-size: 12px; font-weight: bold;'
        );
      }
      
      // Add some spacing and branding
      originalLog('');
      originalLog(`%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'color: #6B7280;');
      originalLog(`%c© ${new Date().getFullYear()} ${companyName}. All rights reserved.`, 'color: #6B7280; font-size: 11px;');
      originalLog('');
      
      // Fun Easter egg for developers
      setTimeout(() => {
        originalLog(
          '%c🥚 Easter Egg: You found the hidden developer message! 🎉',
          'color: #F59E0B; font-size: 14px; font-weight: bold; animation: blink 1s infinite;'
        );
      }, 2000);
      
    } catch (error) {
      // Fallback for browsers that don't support console styling
      originalLog(`🚀 Welcome to ${companyName}!`);
      if (msg.securityWarning) {
        originalWarn('⚠️ SECURITY WARNING: This console is for developers only!');
        originalError('Do not paste code here that someone told you to run!');
      }
      originalError('🔒 Console logging disabled for security reasons.');
      if (msg.hiringMessage) {
        originalLog(`💼 Interested in working with ${companyName}? Contact us!`);
      }
    }
  }

  private _disableLevel(level: ConsoleLevel) {
    console[level] = () => {};
  }

  private _enableLevel(level: ConsoleLevel) {
    console[level] = this.originalConsole[level];
  }

  private disableAll() {
    // Comprehensive console disabling
    const noop = () => {};
    const noopReturn = () => undefined;
    
    // Basic console methods
    console.log = noop;
    console.warn = noop;
    console.error = noop;
    console.info = noop;
    console.debug = noop;
    console.trace = noop;
    
    // Additional console methods that might exist
    console.dir = noop;
    console.dirxml = noop;
    console.table = noop;
    console.group = noop;
    console.groupCollapsed = noop;
    console.groupEnd = noop;
    console.time = noop;
    console.timeEnd = noop;
    console.timeLog = noop;
    console.count = noop;
    console.countReset = noop;
    console.assert = noop;
    console.profile = noop;
    console.profileEnd = noop;
    console.timeStamp = noop;
    
    // Make console.clear also show our message again
    const originalClear = console.clear;
    console.clear = () => {
      if (originalClear) originalClear.call(console);
      if (this.config.showCustomMessage) {
        // Small delay to ensure clear happens first
        setTimeout(() => this.showCustomMessage(), 100);
      }
    };
  }

  // Public methods for runtime control
  public enable() {
    this.config.enabled = true;
    this.applyConfiguration();
  }

  public disable() {
    this.config.enabled = false;
    this.disableAll();
  }

  public enableLevel(level: ConsoleLevel) {
    this.config.levels[level] = true;
    console[level] = this.originalConsole[level];
  }

  public disableLevel(level: ConsoleLevel) {
    this.config.levels[level] = false;
    console[level] = () => {};
  }

  public restore() {
    // Restore all original console methods
    Object.entries(this.originalConsole).forEach(([level, method]) => {
      console[level as ConsoleLevel] = method;
    });
  }

  public getConfig() {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ConsoleConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.applyConfiguration();
  }

  public setCustomMessage(message: Partial<ConsoleConfig['customMessage']>) {
    this.config.customMessage = { ...this.config.customMessage, ...message };
  }

  public showMessage() {
    if (this.config.showCustomMessage) {
      this.showCustomMessage();
    }
  }
}

// Create and export the console manager instance
export const consoleManager = new ConsoleManager({
  enabled: true,
  production: false, // Console logs disabled in production
  development: true, // Console logs enabled in development
  showCustomMessage: true, // Show custom message when disabling
  customMessage: {
    title: '🚀 Welcome to Rayo Developer Console!',
    securityWarning: true,
    companyName: 'Rayo',
    hiringMessage: true,
  },
  levels: {
    log: true,
    warn: true,
    error: true, // Always keep errors in development
    info: true,
    debug: true,
    trace: false, // Usually too verbose
  }
});

// For debugging purposes - expose to window in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).consoleManager = consoleManager;
  
  // Also add some helpful methods to window for easy access
  (window as any).showConsoleMessage = () => consoleManager.showMessage();
  (window as any).enableConsole = () => consoleManager.enable();
  (window as any).disableConsole = () => consoleManager.disable();
}

export default consoleManager; 