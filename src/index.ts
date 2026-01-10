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
const appiumHost =
  getArgValue('appium-host') || process.env.APPIUM_HOST || 'localhost';
const appiumPort =
  getArgValue('appium-port') || process.env.APPIUM_PORT || '4723';
const appiumPath =
  getArgValue('appium-path') || process.env.APPIUM_PATH || '/wd/hub';

async function startServer(): Promise<void> {
  log.info('Starting MCP Appium MCP Server...');

  // Configure Appium server connection
  setAppiumConfig(appiumHost, parseInt(appiumPort, 10), appiumPath);

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
