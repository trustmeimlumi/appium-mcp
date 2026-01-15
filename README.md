# MCP Appium - MCP server for Mobile Development and Automation | iOS, Android, Simulator, Emulator, and Real Devices

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

MCP Appium is an intelligent MCP (Model Context Protocol) server designed to empower AI assistants with a robust suite of tools for mobile automation. It streamlines mobile app testing by enabling natural language interactions, intelligent locator generation, and automated test creation for both Android and iOS platforms.

## Table of Contents

- [Quick Start](#-quick-start)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Installation](#️-installation)
- [Configuration](#️-configuration)
- [Available Tools](#-available-tools)
- [Usage Examples](#-usage-examples)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Quick Start

**Want to get started quickly?**

👉 **[See the step-by-step Setup Guide](./docs/CURSOR_SETUP.md)**

This guide walks you through:
- Installing and building Appium MCP
- Configuring `mcp.json` for your MCP client
- Connecting to local or remote Appium servers
- Using MCP tools
- Troubleshooting common issues

## 🚀 Features

- **Cross-Platform Support**: Automate tests for both Android (UiAutomator2) and iOS (XCUITest).
- **Intelligent Locator Generation**: AI-powered element identification using priority-based strategies.
- **Interactive Session Management**: Easily create and manage sessions on local and remote mobile devices.
- **Smart Element Interactions**: Perform actions like clicks, text input, screenshots, and element finding.
- **Automated Test Generation**: Generate Java/TestNG test code from natural language descriptions.
- **Page Object Model Support**: Utilize built-in templates that follow industry best practices.
- **Unified Configuration**: All configuration managed through MCP settings (mcp.json) for consistency.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### System Requirements

- **Node.js** (v22 or higher)
- **npm** or **yarn**
- **Java Development Kit (JDK)** (8 or higher)
- **Android SDK** (for Android testing)
- **Xcode** (for iOS testing on macOS)

### Mobile Testing Setup

#### Android

1.  Install Android Studio and the Android SDK.
2.  Set the `ANDROID_HOME` environment variable.
3.  Add the Android SDK tools to your system's PATH.
4.  Enable USB debugging on your Android device.
5.  Install the Appium UiAutomator2 driver dependencies.

#### iOS (macOS only)

1.  Install Xcode from the App Store.
2.  Install the Xcode Command Line Tools: `xcode-select --install`.
3.  Install iOS simulators through Xcode.
4.  For real device testing, configure your provisioning profiles.

## 🛠️ Installation

### Building from Source

#### macOS/Linux:
```bash
git clone https://github.com/appium/appium-mcp.git
cd appium-mcp
npm install
npm run build
```

#### Windows:
```powershell
git clone https://github.com/appium/appium-mcp.git
cd appium-mcp
npm install
npm run build
```

**Note for Windows users:** The build script is Windows-compatible and uses `shx` for cross-platform shell commands. If you encounter build errors, ensure `shx` is installed: `npm install --save-dev shx`

### Using with MCP Clients

Add the following configuration to your MCP client settings (typically in `mcp.json` or similar):

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "command": "npx",
      "args": ["appium-mcp@latest"],
      "env": {
        "ANDROID_HOME": "/path/to/android/sdk",
        "APPIUM_HOST": "localhost",
        "APPIUM_PORT": "4723",
        "APPIUM_PATH": "/wd/hub",
        "APPIUM_PLATFORM": "android",
        "APPIUM_UDID": "your-device-udid"
      }
    }
  }
}
```

**Note:** Make sure to update:
- `ANDROID_HOME` path to match your Android SDK installation
- `APPIUM_UDID` with your actual device UDID (use `adb devices` for Android or `xcrun simctl list` for iOS simulators)
- `APPIUM_PLATFORM` to "android" or "ios" depending on your target platform
- `APPIUM_HOST` and `APPIUM_PORT` to match your Appium server location

### Example: Cursor IDE

For Cursor IDE users, use the one-click install:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en-US/install-mcp?name=appium-mcp&config=eyJkaXNhYmxlZCI6ZmFsc2UsInRpbWVvdXQiOjEwMCwidHlwZSI6InN0ZGlvIiwiZW52Ijp7IkFORFJPSURfSE9NRSI6Ii9Vc2Vycy94eXovTGlicmFyeS9BbmRyb2lkL3NkayJ9LCJjb21tYW5kIjoibnB4IGFwcGl1bS1tY3BAbGF0ZXN0In0%3D)

Or manually: **Cursor Settings → MCP → Add new MCP Server**, then configure with the settings above.

### Example: CLI Tools

```bash
# Gemini CLI
gemini mcp add appium-mcp npx -y appium-mcp@latest

# Claude Code CLI
claude mcp add appium-mcp -- npx -y appium-mcp@latest
```

**Important:** After CLI installation, you must manually add all required environment variables to the generated configuration.

## ⚙️ Configuration

### Appium Server Configuration

**ALL PARAMETERS ARE REQUIRED**: You must configure all parameters in your MCP settings (mcp.json) via environment variables.

#### Required Environment Variables
All these parameters **MUST** be configured in your `mcp.json` file:

- `APPIUM_HOST`: **REQUIRED** - Appium server hostname (e.g., localhost, 10.10.10.10, appium.example.com)
- `APPIUM_PORT`: **REQUIRED** - Appium server port (e.g., 4723)
- `APPIUM_PATH`: **REQUIRED** - Appium server path (e.g., /wd/hub, /)
- `APPIUM_PLATFORM`: **REQUIRED** - Platform to automate ("android" or "ios")
- `APPIUM_UDID`: **REQUIRED** - Device UDID (unique device identifier)

#### Optional Environment Variables
- `APPIUM_LOG_LEVEL`: Log level (error, warn, info, debug) - set to "error" to reduce log noise and fix JSON parse errors

#### Example Configuration in mcp.json:

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "command": "npx",
      "args": ["appium-mcp@latest"],
      "env": {
        "ANDROID_HOME": "/Users/youruser/Library/Android/sdk",
        "APPIUM_HOST": "localhost",
        "APPIUM_PORT": "4723",
        "APPIUM_PATH": "/wd/hub",
        "APPIUM_PLATFORM": "android",
        "APPIUM_UDID": "your-device-udid",
        "APPIUM_LOG_LEVEL": "error"
      }
    }
  }
}
```

#### Example for Remote Appium Server:

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "command": "npx",
      "args": ["appium-mcp@latest"],
      "env": {
        "APPIUM_HOST": "appium.example.com",
        "APPIUM_PORT": "4723",
        "APPIUM_PATH": "/wd/hub",
        "APPIUM_PLATFORM": "ios",
        "APPIUM_UDID": "00000000-0000000000000000",
        "APPIUM_LOG_LEVEL": "error"
      }
    }
  }
}
```

#### Example for Cloud Services:

```json
{
  "mcpServers": {
    "appium-mcp": {
      "disabled": false,
      "timeout": 100,
      "type": "stdio",
      "command": "npx",
      "args": ["appium-mcp@latest"],
      "env": {
        "APPIUM_HOST": "cloud-service.com",
        "APPIUM_PORT": "443",
        "APPIUM_PATH": "/",
        "APPIUM_PLATFORM": "android",
        "APPIUM_UDID": "cloud-device-id",
        "APPIUM_LOG_LEVEL": "error"
      }
    }
  }
}
```

**Note**: When using a remote Appium server (host other than localhost/127.0.0.1), the server uses WebDriver protocol for communication. Local connections (localhost) use direct Appium driver integration for better performance.

### Additional Configuration (Optional)

If you need to pass additional capabilities to Appium, you can do so when calling the `create_session` tool with custom capabilities parameter.

### Screenshots

Set the `SCREENSHOTS_DIR` environment variable to specify where screenshots are saved. If not set, screenshots are saved to the current working directory. Supports both absolute and relative paths (relative paths are resolved from the current working directory). The directory is created automatically if it doesn't exist.

## 🎯 Available Tools

MCP Appium provides a comprehensive set of tools organized into the following categories:

### Platform & Device Setup

| Tool              | Description                                                              |
| ----------------- | ------------------------------------------------------------------------ |
| `select_platform` | **REQUIRED FIRST**: Ask user to choose between Android or iOS platform   |
| `select_device`   | Select a specific device when multiple devices are available             |
| `boot_simulator`  | Boot an iOS simulator and wait for it to be ready (iOS only)             |
| `setup_wda`       | Download and setup prebuilt WebDriverAgent for iOS simulators (iOS only) |
| `install_wda`     | Install and launch WebDriverAgent on a booted iOS simulator (iOS only)   |

### Session Management

| Tool             | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `create_session` | Create a new mobile automation session for Android or iOS |
| `delete_session` | Delete the current mobile session and clean up resources  |

### Context Management

| Tool                  | Description                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `appium_get_contexts` | Get all available contexts in the current Appium session. Returns a list of context names including NATIVE_APP and any webview contexts (e.g., WEBVIEW_<id> or WEBVIEW_<package>). |
| `appium_switch_context` | Switch to a specific context in the Appium session. Use this to switch between native app context (NATIVE_APP) and webview contexts (WEBVIEW_<id> or WEBVIEW_<package>). Use appium_get_contexts to see available contexts first. |

### Element Discovery & Interaction

| Tool                  | Description                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `appium_find_element` | Find a specific element using various locator strategies (xpath, id, accessibility id, etc.) |
| `appium_click`        | Click on an element                                                                          |
| `appium_double_tap`   | Perform double tap on an element                                                             |
| `appium_long_press`   | Perform a long press (press and hold) gesture on an element                                  |
| `appium_drag_and_drop` | Perform a drag and drop gesture from a source location to a target location (supports element-to-element, element-to-coordinates, coordinates-to-element, and coordinates-to-coordinates) |
| `appium_set_value`    | Enter text into an input field                                                               |
| `appium_get_text`     | Get text content from an element                                                             |

### Screen & Navigation

| Tool                       | Description                                             |
| -------------------------- | ------------------------------------------------------- |
| `appium_screenshot`        | Take a screenshot of the current screen and save as PNG |
| `appium_scroll`            | Scroll the screen vertically (up or down)               |
| `appium_scroll_to_element` | Scroll until a specific element becomes visible         |
| `appium_swipe`             | Swipe the screen in a direction (left, right, up, down) or between custom coordinates |
| `appium_get_page_source`   | Get the page source (XML) from the current screen       |

### App Management

| Tool                  | Description                                                        |
| --------------------- | ------------------------------------------------------------------ |
| `appium_activate_app` | Activate (launch/bring to foreground) a specified app by bundle ID |
| `appium_installApp`   | Install an app on the device from a file path                      |
| `appium_uninstallApp` | Uninstall an app from the device by bundle ID                      |
| `appium_terminateApp` | Terminate (close) a specified app                                  |
| `appium_list_apps`    | List all installed apps on the device (Android only)               |

### Test Generation & Documentation

| Tool                         | Description                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `generate_locators`          | Generate intelligent locators for all interactive elements on the current screen |
| `appium_generate_tests`      | Generate automated test code from natural language scenarios                     |
| `appium_documentation_query` | Query Appium documentation using RAG for help and guidance                       |


## 📚 Usage Examples

### Amazon Mobile App Checkout Flow

Here's an example prompt to test the Amazon mobile app checkout process:

```
Open Amazon mobile app, search for "iPhone 15 Pro", select the first search result, add the item to cart, proceed to checkout, sign in with email "test@example.com" and password "testpassword123", select shipping address, choose payment method, review order details, and place the order. Use JAVA + TestNG for test generation.
```

This example demonstrates a complete e-commerce checkout flow that can be automated using MCP Appium's intelligent locator generation and test creation capabilities.

## 🙌 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss any changes.

## 📄 License

This project is licensed under the Apache-2.0. See the [LICENSE](LICENSE) file for details.
