# Using MCP Appium with Remote Appium Server

This example demonstrates how to use MCP Appium with a remote Appium server.

## Prerequisites

- A running Appium server (local or remote)
- Network access to the Appium server

> **⚠️ IMPORTANT**: `APPIUM_HOST` and `APPIUM_PORT` are **REQUIRED** parameters. You must configure them in your MCP settings (mcp.json) either via environment variables or command-line arguments. The server will not start without these parameters.

## Configuration

### Configuration in mcp.json

All configuration must be done in your MCP settings file (`~/.cursor/mcp.json` or equivalent):

#### Example: Remote Appium Server

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "env": {
        "ANDROID_HOME": "/Users/youruser/Library/Android/sdk",
        "APPIUM_HOST": "your-appium-server.com",
        "APPIUM_PORT": "4723",
        "APPIUM_PATH": "/wd/hub",
        "APPIUM_PLATFORM": "android",
        "APPIUM_UDID": "your-device-udid",
        "APPIUM_LOG_LEVEL": "error"
      },
      "command": "node",
      "args": ["/path/to/appium-mcp/dist/index.js"]
    }
  }
}
```

#### Example: Local Appium Server

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "env": {
        "ANDROID_HOME": "/Users/youruser/Library/Android/sdk",
        "APPIUM_HOST": "localhost",
        "APPIUM_PORT": "4723",
        "APPIUM_PATH": "/wd/hub",
        "APPIUM_PLATFORM": "android",
        "APPIUM_UDID": "your-device-udid",
        "APPIUM_LOG_LEVEL": "error"
      },
      "command": "node",
      "args": ["/path/to/appium-mcp/dist/index.js"]
    }
  }
}
```

#### Example: Cloud/Device Farm Services

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "env": {
        "APPIUM_HOST": "cloud-service.com",
        "APPIUM_PORT": "443",
        "APPIUM_PATH": "/",
        "APPIUM_PLATFORM": "ios",
        "APPIUM_UDID": "cloud-device-id",
        "APPIUM_LOG_LEVEL": "error"
      },
      "command": "node",
      "args": ["/path/to/appium-mcp/dist/index.js"]
    }
  }
}
```

## Usage

Once configured in your mcp.json, the server will automatically connect to your Appium instance with the configured settings. 

Since `APPIUM_PLATFORM` and `APPIUM_UDID` are required in your configuration, you can create sessions without any parameters:

```javascript
// Create a session using all configured environment variables
await create_session();

// Or override with custom capabilities if needed
await create_session({
  capabilities: {
    "appium:app": "/path/to/your/app.apk",
    "appium:deviceName": "Custom Device Name"
  }
});
```

## Notes

- Remote connections use WebDriver protocol for communication
- Local connections (localhost) use direct Appium driver integration for better performance
- Ensure your remote Appium server has the necessary drivers installed (UiAutomator2 for Android, XCUITest for iOS)
- Make sure firewall rules allow traffic on the Appium port (default: 4723)