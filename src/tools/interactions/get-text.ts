import { FastMCP } from 'fastmcp/dist/FastMCP.js';
import { z } from 'zod';
import { getDriver } from '../../session-store.js';
import { elementUUIDScheme } from '../../schema.js';

export default function getText(server: FastMCP): void {
  const getTextSchema = z.object({
    elementUUID: elementUUIDScheme,
  });

  server.addTool({
    name: 'appium_get_text',
    description: 'Get text from an element',
    parameters: getTextSchema,
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
    },
    execute: async (args: any, context: any): Promise<any> => {
      const driver = getDriver();
      if (!driver) {
        throw new Error('No driver found');
      }

      try {
        let text;
        // Support both local drivers and WebDriverIO
        if (driver.getElementText) {
          // WebDriverIO client
          text = await driver.getElementText(args.elementUUID);
        } else {
          // Local Appium driver
          text = await driver.getText(args.elementUUID);
        }
        return {
          content: [
            {
              type: 'text',
              text: `Successfully got text ${text} from element ${args.elementUUID}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to get text from element ${args.elementUUID}. err: ${err.toString()}`,
            },
          ],
        };
      }
    },
  });
}
