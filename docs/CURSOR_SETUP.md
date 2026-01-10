# 🚀 Appium MCP Setup for Cursor IDE

Simple step-by-step guide for using Appium MCP in Cursor IDE.

## 📋 Prerequisites

- **Cursor IDE** installed
- **Node.js** v22+ installed
- **Running Appium server** (local or remote)
- **Android/iOS device** connected to the Appium server

---

## 🔧 Step 1: Appium MCP Installation

### Clone and Build

#### macOS/Linux:

```bash
cd ~/projects  # or wherever you prefer
git clone ...
cd appium-mcp
npm install
npm run build
```

#### Windows:

```powershell
cd C:\projects  # or wherever you prefer
git clone ...
cd appium-mcp
npm install
npm run build
```

**Important**: 
- After building, verify that the `dist/index.js` file was created!
- **On Windows**: The build script automatically handles Windows-specific commands (using the `shx` package). If you get a build error, check that the `shx` package is installed: `npm install --save-dev shx`

---

## ⚙️ Step 2: Cursor MCP Configuration

### Open the Cursor MCP config file:

**macOS/Linux:**
```bash
~/.cursor/mcp.json
```

**Windows:**
```
%USERPROFILE%\.cursor\mcp.json
```
or
```
C:\Users\<username>\.cursor\mcp.json
```

> **⚠️ Windows Paths**: In JSON strings, backslashes must be doubled (`\\`). For example: `"c:\\projects\\appium-mcp\\dist/index.js"`

### Add this configuration:

#### For Remote Appium Server (recommended):

**Option A: Environment Variables (simpler)**

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "env": {
        "ANDROID_HOME": "/Users/youruser/Library/Android/sdk",
        "APPIUM_HOST": "10.10.10.10",
        "APPIUM_PORT": "4723",
        "APPIUM_PATH": "/wd/hub",
        "APPIUM_PLATFORM": "android",
        "APPIUM_UDID": "00000000-0000000000000000",
        "APPIUM_LOG_LEVEL": "error"
      },
      "command": "node",
      "args": ["/Users/youruser/projects/appium-mcp/dist/index.js"]
      // Windows: ["c:\\projects\\appium-mcp\\dist/index.js"]
    }
  }
}
```

**Option B: Command Line Arguments**

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "env": {
        "ANDROID_HOME": "/Users/youruser/Library/Android/sdk",
        "APPIUM_PLATFORM": "android",
        "APPIUM_UDID": "00000000-0000000000000000",
        "APPIUM_LOG_LEVEL": "error"
      },
      "command": "node",
      "args": [
        "/Users/youruser/projects/appium-mcp/dist/index.js",
        "--appium-host", "10.10.10.10",
        "--appium-port", "4723",
        "--appium-path", "/wd/hub"
      ]
    }
  }
}
```

#### For Local Appium Server (localhost:4723):

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "env": {
        "ANDROID_HOME": "/Users/youruser/Library/Android/sdk",
        "APPIUM_PLATFORM": "android",
        "APPIUM_UDID": "your-device-udid"
      },
      "command": "node",
      "args": ["/Users/youruser/projects/appium-mcp/dist/index.js"]
      // Windows: ["c:\\projects\\appium-mcp\\dist/index.js"]
    }
  }
}
```

> **Note**: For local setup, only `ANDROID_HOME` and optionally `APPIUM_UDID` are needed. Default host/port/path values: `localhost:4723/wd/hub`

### 🤔 Which Option Should I Choose?

**Option A (Environment Variables)** - If:
- ✅ You want simpler configuration
- ✅ You use the same server across multiple projects
- ✅ You want easy copy/paste

**Option B (Command Line Arguments)** - If:
- ✅ You want to see arguments explicitly
- ✅ You want project-specific settings

> **Tip**: Option A (env) is usually more practical!

### ⚠️ Values to Replace:

| Field | Example Value | Your Value |
|-------|-------------|-------------|
| `args[0]` | `/Users/youruser/projects/appium-mcp/dist/index.js` (macOS/Linux)<br>`c:\\projects\\appium-mcp\\dist/index.js` (Windows) | Your installation path<br>**Windows**: Backslashes must be doubled (`\\`) |
| `ANDROID_HOME` | `/Users/youruser/Library/Android/sdk` | Your Android SDK path |
| `APPIUM_HOST` | `10.10.10.10` | Remote Appium server IP/hostname |
| `APPIUM_PORT` | `4723` | Remote Appium server port |
| `APPIUM_PATH` | `/wd/hub` | Appium path (usually `/wd/hub` or `/`) |
| `APPIUM_PLATFORM` | `android` | Platform: `android` or `ios` (optional) |
| `APPIUM_UDID` | `00000000-0000000000000000` | Device UDID (optional) |
| `APPIUM_LOG_LEVEL` | `error` | Log level (error/warn/info/debug) - recommended: `error` |

---

## 🔄 Step 3: Restart Cursor

**Important!** After updating the MCP configuration, **you must fully restart Cursor IDE**:

1. Close Cursor IDE completely
2. Restart it

---

## ✅ Step 4: Verification

### Check MCP Server Status:

1. Open Cursor
2. Go to **Settings** → **Features** → **Model Context Protocol**
3. Find the `appium-mcp` server
4. You should see: **✅ Running**

### Test in Cursor Chat:

Open Cursor Chat (Cmd/Ctrl + L) and type:

```
@appium-mcp Create an iOS session
```

If it works, you should see this response:
```
✅ IOS session created successfully with ID: abc123...
Platform: iOS
Automation: XCUITest
Device: iPhone
```

---

## 📱 Step 5: Usage

### Example Workflow:

```markdown
# 1. Create session (if APPIUM_PLATFORM and APPIUM_UDID are set)
@appium-mcp Create a session

# OR with explicit platform:
@appium-mcp Create an iOS session

# 2. Take screenshot
@appium-mcp Take a screenshot

# 3. List applications
@appium-mcp List all installed apps

# 4. Launch app
@appium-mcp Activate app with bundle ID: com.example.app

# 5. Find element and click
@appium-mcp Find element with text "Login" and click on it

# 6. Close session
@appium-mcp Delete the current session
```

---

## 🎯 Available MCP Tools

### Session Management
- `create_session` - Create session (Android/iOS)
- `delete_session` - Delete session
- `select_platform` - Select platform
- `select_device` - Select device

### Interactions
- `appium_screenshot` - Take screenshot
- `appium_click` - Click element
- `appium_find_element` - Find element
- `appium_set_value` - Enter text
- `appium_get_text` - Read text
- `appium_get_page_source` - UI hierarchy

### App Management
- `appium_list_apps` - List installed apps
- `appium_activate_app` - Launch app
- `appium_install_app` - Install app
- `appium_terminate_app` - Stop app

### Navigation
- `appium_scroll` - Scroll
- `appium_swipe` - Swipe gesture
- `appium_scroll_to_element` - Scroll to element

---

## 🐛 Troubleshooting

### Issue: Windows Build Error - "chmod is not recognized"

**Error:**
```
'chmod' is not recognized as an internal or external command,
operable program or batch file.
```

**Cause:** The build script uses Unix commands (`chmod`) that don't work on Windows.

**Solution:** The project has a Windows-compatible build script. If you still get an error:

1. Check that the `shx` package is installed:
```powershell
npm install --save-dev shx
```

2. If the `package.json` build script still contains the `chmod` command, remove it:
```json
// ❌ Incorrect (on Windows):
"build": "rimraf dist && tsc && chmod +x dist/index.js && npm run copy-docs"

// ✅ Correct (Windows-compatible):
"build": "rimraf dist && tsc && npm run copy-docs"
```

3. The `copy-docs` script should use `shx`:
```json
"copy-docs": "shx mkdir -p dist/tools/documentation/uploads && shx cp -f src/tools/documentation/uploads/documents.json dist/tools/documentation/uploads/documents.json || exit 0"
```

### Issue: JSON Parse Error in logs

**Error:**
```
Client error for command Unexpected non-whitespace character after JSON at position 4
```

**Cause:** Appium drivers or WebDriverIO log messages are written to stdout, which pollutes the JSON-RPC response.

**Solution:** Reduce the log level in `mcp.json`:
```json
"env": {
  "APPIUM_LOG_LEVEL": "error"
}
```

**Valid log levels:** `error`, `warn`, `info`, `debug`

Then restart Cursor: `Cmd+Shift+P` → "Developer: Reload Window"

**Note:** Starting from `appium-mcp` version 1.7.3+, the logger wrapper **explicitly suppresses** info/debug level messages when `APPIUM_LOG_LEVEL=error`. This prevents log messages from polluting the JSON-RPC communication.

**Technical details:** 
1. **Logger wrapper**: The `@appium/support` logger writes all messages to stderr by default. The wrapper layer simply **doesn't call** the logger methods if they're below the set level.
2. **Console suppression**: When `APPIUM_LOG_LEVEL=error`, the `console.log/info/warn/debug` methods are silenced to prevent raw console output from dependencies (WebDriverIO, Appium drivers) that would pollute the stdio JSON-RPC protocol.

---

### Issue: "MCP server not available"

**Solution:**
```bash
# 1. Check the build
cd ~/projects/appium-mcp
npm run build

# 2. Test manually
node dist/index.js

# 3. Check the logs
cat ~/.cursor/logs/mcp-*.log
```

### Issue: "Session creation failed"

**Solution:**
```bash
# Check the Appium server
curl http://10.10.10.10:4723/wd/hub/status

# Expected response:
# {"value":{"ready":true,"message":"The server is ready..."}}
```

### Issue: "Device not found"

**Solution:**
- Check that the device is connected to the Appium server
- iOS: List devices with `idevice_id -l` command
- Android: List devices with `adb devices` command
- Update the `APPIUM_UDID` value in `mcp.json`

### Issue: "Invalid path in mcp.json"

**Solution:**

#### macOS/Linux:
```bash
# Find the exact path
pwd
# Output: /Users/youruser/projects/appium-mcp

# Use this in mcp.json:
# "/Users/youruser/projects/appium-mcp/dist/index.js"
```

#### Windows:
```powershell
# Find the exact path
pwd
# Output: C:\projects\appium-mcp

# Use this in mcp.json (backslashes must be doubled!):
# "c:\\projects\\appium-mcp\\dist/index.js"
```

**⚠️ Windows JSON Escape**: In JSON strings, backslash is an escape character, so it must be doubled:
- ❌ Incorrect: `"c:\projects\appium-mcp\dist/index.js"` → JSON parse error
- ✅ Correct: `"c:\\projects\\appium-mcp\\dist/index.js"`

---

## 💡 Pro Tips

### 1. Default Platform and Device
Set `APPIUM_PLATFORM` and `APPIUM_UDID` so you don't have to specify them every time:
```json
"env": {
  "APPIUM_PLATFORM": "android",
  "APPIUM_UDID": "00000000-0000000000000000",
  "APPIUM_LOG_LEVEL": "error"
}
```

Then simply:
```javascript
// Just write this, platform and UDID are automatic!
await create_session();
```

### 2. Screenshot Directory
Set a separate directory for screenshots:
```json
"env": {
  "SCREENSHOTS_DIR": "/Users/youruser/screenshots"
}
```

### 3. Capabilities File
Use a capabilities file for complex configuration:
```json
"env": {
  "CAPABILITIES_CONFIG": "/Users/youruser/appium-caps.json"
}
```

### 4. Natural Language
You can use natural language in Cursor Chat:
```
@appium-mcp Launch the banking app and take a screenshot
```

---

## 📚 Additional Information

- **Detailed documentation**: [README.md](./README.md)
- **Remote server examples**: [examples/remote-appium-server.md](./examples/remote-appium-server.md)
- **GitHub Issues**: https://github.com/appium/appium-mcp/issues

---

## ✅ Installation Checklist

- [ ] Node.js v22+ installed
- [ ] Appium MCP cloned and built
- [ ] `mcp.json` updated with correct paths
- [ ] Cursor IDE restarted
- [ ] MCP server in "Running" status
- [ ] Test session created successfully

**If everything is checked, you're ready! 🎉**
