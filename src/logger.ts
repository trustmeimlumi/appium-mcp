import { logger } from '@appium/support';

// Create custom logger that respects log level
const appiumLog = logger.getLogger('mcp-appium');

// Configure log level from environment variable
const logLevelEnv = process.env.APPIUM_LOG_LEVEL || 'info';
if (['error', 'warn', 'info', 'debug'].includes(logLevelEnv)) {
  appiumLog.level = logLevelEnv as 'error' | 'warn' | 'info' | 'debug';
}

// Wrapper to suppress logging when level is error
const log = {
  error: (message: string, ...args: any[]) => appiumLog.error(message, ...args),
  warn: (message: string, ...args: any[]) => {
    if (logLevelEnv !== 'error') appiumLog.warn(message, ...args);
  },
  info: (message: string, ...args: any[]) => {
    if (logLevelEnv !== 'error') appiumLog.info(message, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (logLevelEnv !== 'error' && logLevelEnv !== 'warn') appiumLog.debug(message, ...args);
  },
};

export default log;
export { log };

// For backward compatibility, export as named exports
// Note: @appium/support logger doesn't have trace method, using debug instead
export const trace = (message: string) => log.debug(message);
export const error = (message: string) => log.error(message);
