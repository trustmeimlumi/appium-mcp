# Using MCP Appium with Remote Appium Server

This example demonstrates how to use MCP Appium with a remote Appium server instead of localhost.

## Prerequisites

- A running Appium server on a remote machine
- Network access to the remote Appium server

## Configuration

### Method 1: Command Line Arguments

```bash
# Start MCP Appium with remote Appium server (space-separated arguments)
mcp-appium --appium-host your-appium-server.com --appium-port 4723

# Or use equals-separated arguments
mcp-appium --appium-host=your-appium-server.com --appium-port=4723

# Local development (if not installed globally)
npm run start -- --appium-host your-appium-server.com --appium-port 4723
```

### Method 2: Environment Variables

```bash
# Set environment variables
export APPIUM_HOST=your-appium-server.com
export APPIUM_PORT=4723
export APPIUM_PATH=/wd/hub  # Default path, adjust for your setup
export APPIUM_PLATFORM=android  # Optional: default platform (android or ios)
export APPIUM_UDID=00000000-0000000000000000  # Optional: default device UDID
export APPIUM_LOG_LEVEL=error  # Recommended: reduce log noise and fix JSON parse errors

# Start MCP Appium
mcp-appium
```

### Method 3: Using npm script

```bash
# Use the provided script (replace with your host)
npm run start:remote your-appium-server.com
```

### Method 4: Different Appium Setups

#### Standard Appium Server:
```bash
npm run start -- --appium-host your-server.com --appium-port 4723 --appium-path /wd/hub
```

#### Cloud/Device Farm Services:
```bash
# Some cloud services use root path instead of /wd/hub
npm run start -- --appium-host cloud-service.com --appium-port 443 --appium-path /
```

#### Custom Path:
```bash
# If your Appium server uses a custom path
npm run start -- --appium-host your-server.com --appium-port 4723 --appium-path /custom/path
```

## Usage

Once configured, use MCP Appium tools as normal. The server will connect to your remote Appium instance:

```javascript
// Create a session on the remote Appium server
await create_session({
  platform: "android",
  capabilities: {
    "appium:deviceName": "Remote Android Device",
    "appium:app": "/path/to/your/app.apk"
  }
});
```

### Using Default Platform and Device UDID

If you set `APPIUM_PLATFORM` and `APPIUM_UDID` in your environment variables or MCP configuration, you can create sessions with minimal parameters:

```javascript
// With APPIUM_PLATFORM="android" and APPIUM_UDID set
await create_session();  // No parameters needed!

// Or just override the platform
await create_session({
  platform: "ios"  // Uses APPIUM_UDID but changes platform
});

// Or override specific capabilities
await create_session({
  capabilities: {
    "appium:udid": "different-device-udid"  // This overrides APPIUM_UDID
  }
});
```

## Notes

- Remote connections use WebDriver protocol for communication
- Local connections (localhost) use direct Appium driver integration for better performance
- Ensure your remote Appium server has the necessary drivers installed (UiAutomator2 for Android, XCUITest for iOS)
- Make sure firewall rules allow traffic on the Appium port (default: 4723)