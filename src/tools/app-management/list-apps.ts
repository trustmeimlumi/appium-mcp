import { FastMCP } from 'fastmcp/dist/FastMCP.js';
import { z } from 'zod';
import { getDriver, getPlatformName } from '../../session-store.js';
import {
  createUIResource,
  createAppListUI,
  addUIResourceToResponse,
} from '../../ui/mcp-ui-utils.js';

async function listAppsFromDevice(): Promise<any[]> {
  const driver = await getDriver();
  if (!driver) {
    throw new Error('No driver found');
  }

  const platform = getPlatformName(driver);
  
  // Check if this is a WebDriverIO remote client
  if (driver.execute && typeof driver.execute === 'function') {
    // Use WebDriver protocol for remote connections
    try {
      const apps = await driver.execute('mobile: listApps', {});
      
      // Convert to array format if it's an object
      if (typeof apps === 'object' && !Array.isArray(apps)) {
        return Object.entries(apps).map(([bundleId, info]: [string, any]) => ({
          bundleId,
          name: info.CFBundleDisplayName || info.CFBundleName || bundleId,
          version: info.CFBundleShortVersionString || 'N/A',
        }));
      }
      
      return Array.isArray(apps) ? apps : [];
    } catch (error) {
      throw new Error(`Failed to list apps via WebDriver: ${error}`);
    }
  }
  
  // Local driver - original implementation
  if (platform === 'iOS') {
    throw new Error('listApps is not yet implemented for iOS with local drivers');
  }

  const appPackages = await driver.adb.adbExec([
    'shell',
    'cmd',
    'package',
    'list',
    'packages',
  ]);

  const apps: any[] = appPackages
    .split('package:')
    .filter((s: any) => s.trim())
    .map((s: any) => ({
      packageName: s.trim(),
      appName: '',
    }));

  return apps;
}

export default function listApps(server: FastMCP): void {
  const schema = z.object({});

  server.addTool({
    name: 'appium_list_apps',
    description: 'List all installed apps on the device.',
    parameters: schema,
    execute: async () => {
      try {
        const apps = await listAppsFromDevice();
        const textResponse = {
          content: [
            {
              type: 'text',
              text: `Installed apps: ${JSON.stringify(apps, null, 2)}`,
            },
          ],
        };

        // Add interactive app list UI
        const uiResource = createUIResource(
          `ui://appium-mcp/app-list/${Date.now()}`,
          createAppListUI(apps)
        );

        return addUIResourceToResponse(textResponse, uiResource);
      } catch (err: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to list apps. err: ${err.toString()}`,
            },
          ],
        };
      }
    },
  });
}
