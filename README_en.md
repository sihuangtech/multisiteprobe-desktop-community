# MultiSiteLatencyTool

A powerful network testing tool built with Electron + Vue3 for measuring latency of multiple sites and retrieving IP geolocation information.

## Features

- 🌍 IP/Domain Geolocation Query
  - Multi-tab query support
  - Independent domain settings per tab
  - Detailed location information
  - Export query results

- 🔍 Multiple Network Testing Tools
  - Ping Test: Measure network latency and packet loss
  - HTTP Test: Test website response time and status
  - DNS Test: Test domain resolution performance
  - MTR Test: Network path analysis
  - Traceroute: Display packet routing path

- ⭐ Favorites Management
  - Local persistent storage for favorites
  - Add, edit, and delete favorites
  - Notes and search functionality
  - Quick launch for all network tests

## Installation

1. Clone the repository
```bash
git clone https://gitee.com/Snake-Konginchrist/MultiSiteLatencyTool.git
cd MultiSiteLatencyTool
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` file and set your IP2Location API key

## Usage

### Development Mode
```bash
npm run electron:dev
```

### Preview Production Build
```bash
npm run electron:preview
```

### Build Application
```bash
# Build for all platforms
npm run electron:build

# Build for specific platform
npm run dist:mac    # macOS
npm run dist:win    # Windows
npm run dist:linux  # Linux
```

## Keyboard Shortcuts

- Developer Tools:
  - macOS: `Command + Shift + I`
  - Windows/Linux: `Ctrl + Shift + I`

## Tech Stack

- Electron 33.2
- Vue 3.4
- Element Plus 2.4
- Vite 5.4

## Dependencies

- `electron-store`: Data persistence
- `axios`: HTTP requests
- `ping`: ICMP testing
- `traceroute`: Route tracing
- `mtr`: MTR testing

## Contributing

Issues and Pull Requests are welcome.

## License

[GPL-3.0 License](LICENSE)