/**
 * Tool to create a new mobile session (Android or iOS)
 */
import { z } from 'zod';
import { access, readFile } from 'fs/promises';
import { constants } from 'fs';
import { AndroidUiautomator2Driver } from 'appium-uiautomator2-driver';
import { XCUITestDriver } from 'appium-xcuitest-driver';
import { remote } from 'webdriverio';
import {
  setSession,
  hasActiveSession,
  safeDeleteSession,
  getAppiumConfig,
} from '../../session-store.js';
import {
  getSelectedDevice,
  getSelectedDeviceType,
  getSelectedDeviceInfo,
  clearSelectedDevice,
} from './select-device.js';
import { IOSManager } from '../../devicemanager/ios-manager.js';
import log from '../../logger.js';
import {
  createUIResource,
  createSessionDashboardUI,
  addUIResourceToResponse,
} from '../../ui/mcp-ui-utils.js';

// Define capabilities type
interface Capabilities {
  platformName: string;
  'appium:automationName': string;
  'appium:deviceName'?: string;
  [key: string]: any;
}

// Define capabilities config type
interface CapabilitiesConfig {
  android: Record<string, any>;
  ios: Record<string, any>;
}

/**
 * Load capabilities configuration from file if specified in environment
 */
async function loadCapabilitiesConfig(): Promise<CapabilitiesConfig> {
  const configPath = process.env.CAPABILITIES_CONFIG;
  if (!configPath) {
    return { android: {}, ios: {} };
  }

  try {
    await access(configPath, constants.F_OK);
    const configContent = await readFile(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    log.warn(`Failed to parse capabilities config: ${error}`);
    return { android: {}, ios: {} };
  }
}

/**
 * Remove empty string values from capabilities object
 */
function filterEmptyCapabilities(capabilities: Capabilities): Capabilities {
  const filtered = { ...capabilities };
  Object.keys(filtered).forEach(key => {
    if (filtered[key] === '') {
      delete filtered[key];
    }
  });
  return filtered;
}

/**
 * Build Android capabilities by merging defaults, config, device selection, and custom capabilities
 */
function buildAndroidCapabilities(
  configCaps: Record<string, any>,
  customCaps: Record<string, any> | undefined
): Capabilities {
  const defaultCaps: Capabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Android Device',
  };

  const selectedDeviceUdid = getSelectedDevice();
  const envUdid = process.env.APPIUM_UDID;

  const capabilities = {
    ...defaultCaps,
    ...configCaps,
    ...(selectedDeviceUdid && { 'appium:udid': selectedDeviceUdid }),
    ...(envUdid && !selectedDeviceUdid && { 'appium:udid': envUdid }),
    ...customCaps,
  };

  if (selectedDeviceUdid) {
    clearSelectedDevice();
  }

  return filterEmptyCapabilities(capabilities);
}

/**
 * Validate iOS device selection when multiple devices are available
 */
async function validateIOSDeviceSelection(
  deviceType: 'simulator' | 'real' | null
): Promise<void> {
  if (!deviceType) {
    return;
  }

  const iosManager = IOSManager.getInstance();
  const devices = await iosManager.getDevicesByType(deviceType);

  if (devices.length > 1) {
    const selectedDevice = getSelectedDevice();
    if (!selectedDevice) {
      throw new Error(
        `Multiple iOS ${deviceType === 'simulator' ? 'simulators' : 'devices'} found (${devices.length}). Please use the select_device tool to choose which device to use before creating a session.`
      );
    }
  }
}

/**
 * Build iOS capabilities by merging defaults, config, device selection, and custom capabilities
 */
async function buildIOSCapabilities(
  configCaps: Record<string, any>,
  customCaps: Record<string, any> | undefined
): Promise<Capabilities> {
  const deviceType = getSelectedDeviceType();
  await validateIOSDeviceSelection(deviceType);

  const defaultCaps: Capabilities = {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:deviceName': 'iPhone Simulator',
  };

  const selectedDeviceUdid = getSelectedDevice();
  const selectedDeviceInfo = getSelectedDeviceInfo();
  const envUdid = process.env.APPIUM_UDID;

  log.debug('Selected device info:', selectedDeviceInfo);

  const platformVersion =
    selectedDeviceInfo?.platform && selectedDeviceInfo.platform.trim() !== ''
      ? selectedDeviceInfo.platform
      : undefined;

  log.debug('Platform version:', platformVersion);

  const capabilities = {
    ...defaultCaps,
    // Auto-detected platform version as fallback (before config)
    ...(platformVersion && { 'appium:platformVersion': platformVersion }),
    ...configCaps,
    ...(selectedDeviceUdid && { 'appium:udid': selectedDeviceUdid }),
    ...(envUdid && !selectedDeviceUdid && { 'appium:udid': envUdid }),
    ...(deviceType === 'simulator' && {
      'appium:usePrebuiltWDA': true,
      'appium:wdaStartupRetries': 4,
      'appium:wdaStartupRetryInterval': 20000,
    }),
    ...customCaps,
  };

  if (selectedDeviceUdid) {
    clearSelectedDevice();
  }

  return filterEmptyCapabilities(capabilities);
}

/**
 * Create the appropriate driver instance for the given platform
 */
function createDriverForPlatform(platform: 'android' | 'ios'): any {
  const { host } = getAppiumConfig();

  // Use local appium drivers for localhost, webdriverio for remote hosts
  if (host === 'localhost' || host === '127.0.0.1') {
    if (platform === 'android') {
      return new AndroidUiautomator2Driver();
    }
    if (platform === 'ios') {
      return new XCUITestDriver();
    }
  } else {
    // For remote connections, return a marker that indicates webdriverio should be used
    return { useWebdriverio: true, platform };
  }

  throw new Error(
    `Unsupported platform: ${platform}. Please choose 'android' or 'ios'.`
  );
}

/**
 * Create a new session with the given driver and capabilities
 */
async function createDriverSession(
  driver: any,
  capabilities: Capabilities
): Promise<{ sessionId: string; client?: any }> {
  const { host, port } = getAppiumConfig();

  // Handle webdriverio remote connections
  if (driver && driver.useWebdriverio) {
    const { path } = getAppiumConfig();
    const client = await remote({
      protocol: 'http',
      hostname: host,
      port: parseInt(port.toString(), 10),
      path: path,
      capabilities: capabilities,
      logLevel: 'info',
    });

    return { sessionId: client.sessionId, client };
  }

  // Handle local appium drivers
  // @ts-ignore
  const sessionId = await driver.createSession(null, {
    alwaysMatch: capabilities,
    firstMatch: [{}],
  });
  return { sessionId };
}

export default function createSession(server: any): void {
  server.addTool({
    name: 'create_session',
    description: `Create a new mobile session with Android or iOS device.
      If APPIUM_PLATFORM environment variable is set, platform parameter is optional.
      Otherwise, MUST use select_platform tool first to ask the user which platform they want.
      `,
    parameters: z.object({
      platform: z
        .enum(['ios', 'android'])
        .optional()
        .describe(
          `Platform to create session for. If not provided, uses APPIUM_PLATFORM environment variable.
          If neither is set, you must use select_platform tool first.`
        ),
      capabilities: z
        .object({})
        .optional()
        .describe('Optional custom capabilities for the session (W3C format).'),
    }),
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
    },
    execute: async (args: any, context: any): Promise<any> => {
      try {
        if (hasActiveSession()) {
          log.info(
            'Existing session detected, cleaning up before creating new session...'
          );
          await safeDeleteSession();
        }

        // Get platform from args or environment variable
        let platform = args.platform;
        if (!platform) {
          const envPlatform = process.env.APPIUM_PLATFORM?.toLowerCase();
          if (envPlatform === 'android' || envPlatform === 'ios') {
            platform = envPlatform;
            log.info(`Using platform from APPIUM_PLATFORM: ${platform}`);
          } else {
            throw new Error(
              'Platform not specified. Either provide platform parameter or set APPIUM_PLATFORM environment variable to "android" or "ios".'
            );
          }
        }

        const { capabilities: customCapabilities } = args;

        const configCapabilities = await loadCapabilitiesConfig();
        const platformCaps =
          platform === 'android'
            ? configCapabilities.android
            : configCapabilities.ios;

        const finalCapabilities =
          platform === 'android'
            ? buildAndroidCapabilities(platformCaps, customCapabilities)
            : await buildIOSCapabilities(platformCaps, customCapabilities);

        const driver = createDriverForPlatform(platform);

        log.info(
          `Creating new ${platform.toUpperCase()} session with capabilities:`,
          JSON.stringify(finalCapabilities, null, 2)
        );

        const { sessionId, client } = await createDriverSession(
          driver,
          finalCapabilities
        );

        // Store the driver/client in session
        setSession(client || driver, sessionId);

        // Safely convert sessionId to string for display
        const sessionIdStr =
          typeof sessionId === 'string'
            ? sessionId
            : String(sessionId || 'Unknown');

        log.info(
          `${platform.toUpperCase()} session created successfully with ID: ${sessionIdStr}`
        );

        const textResponse = {
          content: [
            {
              type: 'text',
              text: `${platform.toUpperCase()} session created successfully with ID: ${sessionIdStr}\nPlatform: ${finalCapabilities.platformName}\nAutomation: ${finalCapabilities['appium:automationName']}\nDevice: ${finalCapabilities['appium:deviceName']}`,
            },
          ],
        };

        // Add interactive session dashboard UI
        const uiResource = createUIResource(
          `ui://appium-mcp/session-dashboard/${sessionIdStr}`,
          createSessionDashboardUI({
            sessionId: sessionIdStr,
            platform: finalCapabilities.platformName,
            automationName: finalCapabilities['appium:automationName'],
            deviceName: finalCapabilities['appium:deviceName'],
            platformVersion: finalCapabilities['appium:platformVersion'],
            udid: finalCapabilities['appium:udid'],
          })
        );

        return addUIResourceToResponse(textResponse, uiResource);
      } catch (error: any) {
        log.error('Error creating session:', error);
        throw new Error(`Failed to create session: ${error.message}`);
      }
    },
  });
}
