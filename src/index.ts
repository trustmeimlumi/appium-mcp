#!/usr/bin/env node

import server from './server.js';
import { setAppiumConfig } from './session-store.js';
import log from './logger.js';

// CRITICAL FIX: Suppress all console output to prevent JSON-RPC pollution
// MCP uses stdio protocol - ANY console output breaks JSON-RPC parsing
if (process.env.APPIUM_LOG_LEVEL === 'error') {
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.warn = noop;
  console.debug = noop;
  // Keep console.error for actual errors
}

// Parse command line arguments
function getArgValue(argName: string): string | undefined {
  const index = args.indexOf(`--${argName}`);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  const equalsArg = args.find(arg => arg.startsWith(`--${argName}=`));
  return equalsArg?.split('=')[1];
}

const args = process.argv.slice(2);
const useHttpStream = args.includes('--httpStream');
const port = getArgValue('port') || process.env.PORT || '8080';
const appiumHost = getArgValue('appium-host') || process.env.APPIUM_HOST;
const appiumPort = getArgValue('appium-port') || process.env.APPIUM_PORT;
const appiumPath = getArgValue('appium-path') || process.env.APPIUM_PATH;
const appiumPlatform = process.env.APPIUM_PLATFORM;
const appiumUdid = process.env.APPIUM_UDID;

async function startServer(): Promise<void> {
  log.info('Starting MCP Appium MCP Server...');

  // Validate required Appium configuration
  const missingParams: string[] = [];

  if (!appiumHost) missingParams.push('APPIUM_HOST');
  if (!appiumPort) missingParams.push('APPIUM_PORT');
  if (!appiumPath) missingParams.push('APPIUM_PATH');
  if (!appiumPlatform) missingParams.push('APPIUM_PLATFORM');
  if (!appiumUdid) missingParams.push('APPIUM_UDID');

  if (missingParams.length > 0) {
    const errorMsg = `Missing required configuration parameters: ${missingParams.join(', ')}. All these parameters must be configured in your MCP settings (mcp.json) using environment variables.`;
    log.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Validate platform value
  if (appiumPlatform !== 'android' && appiumPlatform !== 'ios') {
    const errorMsg = `Invalid APPIUM_PLATFORM value: "${appiumPlatform}". Must be "android" or "ios".`;
    log.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Configure Appium server connection
  // At this point all required params are validated and guaranteed to be defined
  setAppiumConfig(appiumHost!, parseInt(appiumPort!, 10), appiumPath!);

  try {
    if (useHttpStream) {
      server.start({
        transportType: 'httpStream',
        httpStream: {
          endpoint: '/sse',
          port: parseInt(port, 10),
        },
      });

      log.info(
        `Server started with httpStream transport on http://localhost:${port}/sse`
      );
      log.info('Waiting for client connections...');
    } else {
      // Start with stdio transport
      server.start({
        transportType: 'stdio',
      });

      log.info('Server started with stdio transport');
      log.info('Waiting for client connections...');
    }
  } catch (error: any) {
    log.error('Error starting server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
