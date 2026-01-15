import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import { XCUITestDriver } from 'appium-xcuitest-driver';
import log from './logger.js';

let driver: any = null;
let sessionId: string | null = null;
let isDeletingSession = false; // Lock to prevent concurrent deletion

// Appium server configuration - must be set via setAppiumConfig()
let appiumConfig: {
  host: string | null;
  port: number | null;
  path: string;
} = {
  host: null,
  port: null,
  path: '/wd/hub',
};

export const PLATFORM = {
  android: 'Android',
  ios: 'iOS',
};

export function setSession(d: any, id: string | null) {
  driver = d;
  sessionId = id;
  // Reset deletion flag when setting a new session
  if (d && id) {
    isDeletingSession = false;
  }
}

export function getDriver() {
  return driver;
}

export function getSessionId() {
  return sessionId;
}

export function isDeletingSessionInProgress() {
  return isDeletingSession;
}

export function hasActiveSession(): boolean {
  return driver !== null && sessionId !== null && !isDeletingSession;
}

export async function safeDeleteSession(): Promise<boolean> {
  // Check if there's no session to delete
  if (!driver || !sessionId) {
    log.info('No active session to delete.');
    return false;
  }

  // Check if deletion is already in progress
  if (isDeletingSession) {
    log.info('Session deletion already in progress, skipping...');
    return false;
  }

  // Set lock
  isDeletingSession = true;

  try {
    log.info('Deleting current session');

    // Handle webdriverio clients
    if (driver && typeof driver.deleteSession === 'function') {
      await driver.deleteSession();
    } else if (driver && typeof driver.end === 'function') {
      await driver.end();
    } else {
      // Fallback for other driver types
      await driver.deleteSession();
    }

    // Clear the session from store
    driver = null;
    sessionId = null;

    log.info('Session deleted successfully.');
    return true;
  } catch (error) {
    log.warn('Error deleting session (session may already be closed):', error);
    // Clear the session from store even if deletion failed
    // This handles cases where the session was already closed or connection was lost
    driver = null;
    sessionId = null;
    return false;
  } finally {
    // Always release lock
    isDeletingSession = false;
  }
}

export function setAppiumConfig(
  host: string,
  port: number,
  path?: string
): void {
  if (!host || !port) {
    throw new Error(
      'Invalid Appium configuration: host and port are required'
    );
  }
  appiumConfig.host = host;
  appiumConfig.port = port;
  if (path) {
    appiumConfig.path = path;
  }
  log.info(`Appium server configured: ${host}:${port}${appiumConfig.path}`);
}

export function getAppiumConfig(): {
  host: string;
  port: number;
  path: string;
} {
  if (!appiumConfig.host || !appiumConfig.port) {
    throw new Error(
      'Appium server configuration not set. Host and port must be configured via MCP settings (mcp.json). See documentation for setup instructions.'
    );
  }
  return {
    host: appiumConfig.host,
    port: appiumConfig.port,
    path: appiumConfig.path,
  };
}

export const getPlatformName = (driver: any): string => {
  if (driver instanceof AndroidUiautomator2Driver) return PLATFORM.android;
  if (driver instanceof XCUITestDriver) return PLATFORM.ios;

  // Handle WebDriverIO remote client
  if (driver && driver.capabilities) {
    const platformName = driver.capabilities.platformName;
    if (platformName === 'Android') return PLATFORM.android;
    if (platformName === 'iOS') return PLATFORM.ios;
  }

  throw new Error('Unknown driver type');
};
