import { FastMCP } from 'fastmcp/dist/FastMCP.js';
import { z } from 'zod';
import { getDriver } from '../../session-store.js';

export const findElementSchema = z.object({
  strategy: z.enum([
    'xpath',
    'id',
    'name',
    'class name',
    'accessibility id',
    'css selector',
    '-android uiautomator',
    '-ios predicate string',
    '-ios class chain',
  ]),
  selector: z.string().describe('The selector to find the element'),
});

export default function findElement(server: FastMCP): void {
  server.addTool({
    name: 'appium_find_element',
    description:
      'Find an element with the given strategy and selector which will return a uuid that can be used while interaction',
    parameters: findElementSchema,
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
        let elementId;
        
        // Support both local drivers and WebDriverIO
        if (driver.$) {
          // WebDriverIO client - convert strategy to WebDriverIO selector
          let selector = args.selector;
          if (args.strategy === 'xpath') {
            selector = args.selector;
          } else if (args.strategy === 'id') {
            selector = `#${args.selector}`;
          } else if (args.strategy === 'accessibility id') {
            selector = `~${args.selector}`;
          } else if (args.strategy === 'class name') {
            selector = `.${args.selector}`;
          }
          
          const element = await driver.$(selector);
          elementId = await element.elementId;
        } else {
          // Local Appium driver
          const element = await driver.findElement(args.strategy, args.selector);
          elementId = element.ELEMENT;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Successfully found element ${args.selector} with strategy ${args.strategy}. Element id ${elementId}`,
            },
          ],
        };
      } catch (err: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to find element ${args.selector} with strategy ${args.strategy}. err: ${err.toString()}`,
            },
          ],
        };
      }
    },
  });
}
