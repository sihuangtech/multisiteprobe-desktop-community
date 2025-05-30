# Multi-site Operations Monitoring Tool

A multi-functional network testing tool based on Electron + Vue3 for measuring latency of multiple websites, obtaining IP geolocation information, and providing operations monitoring functions.

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Vue](https://img.shields.io/badge/Vue-3.5-green.svg)
![Electron](https://img.shields.io/badge/Electron-36.3-blue.svg)

## 🚀 Features

### 🔍 IP/Domain Geolocation Query
- Support batch query of multiple IP addresses or domains
- Display detailed geolocation information (country, region, city, ISP, etc.)
- Integrated IP2Location API service
- Support export query results

### 🌐 Multiple Network Testing Functions
- **Ping Test**: Measure network latency and packet loss, support custom packet size, timeout, test count
- **HTTP Test**: Test website response time and status, support GET/POST/HEAD methods
- **DNS Test**: Test domain resolution performance, support A/AAAA/CNAME/MX record queries
- **MTR Test**: Network path analysis, display detailed information for each hop
- **Traceroute**: Show the routing path of data packets

### ⭐ Favorites Function
- Local persistent storage of favorite records
- Support add, edit, delete favorites
- Support notes and search functionality
- One-click launch various network tests

### 🎨 User Interface
- Modern graphical interface design
- Based on Element Plus component library
- Responsive layout, support multiple screen sizes
- Chinese interface, simple and intuitive operation

## 📋 System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **Node.js**: 16.0+
- **Memory**: Minimum 512MB RAM
- **Disk Space**: Minimum 200MB available space

## 🛠 Installation

### 1. Clone the project
```bash
git clone https://gitee.com/Snake-Konginchrist/MultiSiteLatencyTool.git
cd MultiSiteLatencyTool
```

### 2. Install dependencies
```bash
npm install
```

> 💡 **Development Notes**: 
> - The project ignores `package-lock.json` file by default, it will not be tracked by Git
> - You may see warnings about optional dependencies during installation, these can usually be ignored

### 3. Configure environment variables
Create a `.env` file and configure API key:
```bash
# IP2Location API Configuration
IP2LOCATION_API_KEY=your_api_key_here

# Application Configuration
NODE_ENV=development
VITE_APP_TITLE=MultiSite Latency Tool
VITE_APP_VERSION=1.0.0

# Disable automatic code signing discovery (recommended for development)
CSC_IDENTITY_AUTO_DISCOVERY=false
```

> 💡 **Get API Key**: Please visit [IP2Location](https://www.ip2location.com/) to register an account and get a free API key
> 
> 📋 **Environment Variables**: You can copy `.env.example` file to `.env` and modify the configurations
> 
> 🔐 **Code Signing**: By default, your developer certificate will be used. To disable signing, add `CSC_IDENTITY_AUTO_DISCOVERY=false` to `.env`

## 🚀 Usage

### Development Mode
```bash
npm run electron:dev
```
Start development server and Electron app with hot reload

### Preview Production Version
```bash
npm run electron:preview
```
Build and preview production version

### Build Application
```bash
# Build for all platforms
npm run electron:build

# Build for specific platform
npm run dist:win    # Windows (all architectures)
npm run dist:mac    # macOS (all architectures)
npm run dist:linux  # Linux (all architectures)

# Build for specific platform and architecture
# Windows
npm run dist:win:x64        # Windows 64-bit
npm run dist:win:ia32       # Windows 32-bit
npm run dist:win:arm64      # Windows ARM64

# macOS
npm run dist:mac:x64        # macOS Intel (x64)
npm run dist:mac:arm64      # macOS Apple Silicon (ARM64)
npm run dist:mac:universal  # macOS Universal (x64 + ARM64)

# Linux
npm run dist:linux:x64      # Linux 64-bit
npm run dist:linux:arm64    # Linux ARM64 (Raspberry Pi, etc.)

# Unsigned builds (recommended for development)
npm run dist:unsigned       # All platforms unsigned build
npm run dist:win:unsigned   # Windows unsigned build
npm run dist:mac:unsigned   # macOS unsigned build
npm run dist:linux:unsigned # Linux unsigned build
```

> 💡 **About Code Signing**：
> - **Default builds**: Will use your developer certificate for signing, showing developer information
> - **Unsigned builds**: Use `unsigned` versions, no developer information shown, suitable for development testing
> - **macOS**: Signed apps provide better user experience with fewer security warnings
> - **Windows**: Signed apps avoid SmartScreen warnings and increase user trust
>
> 💡 **About Windows Installer**：
> - The project uses NSIS to create custom installers that allow users to choose installation location
> - Uninstallation will thoroughly clean up application data to avoid residual files
> - Supports x64, ia32, and ARM64 architectures

## 📖 Feature Usage Guide

### IP/Domain Query
1. Enter IP addresses or domains in the input box on the homepage (one per line)
2. Click "Start Query" button
3. View detailed geolocation information
4. Add frequently used addresses to favorites

### Ping Test
1. Switch to "Ping Test" page
2. Enter host addresses to test
3. Configure test parameters (packet size, timeout, test count)
4. Click "Start Test" to view results

### HTTP Test
1. Switch to "HTTP Test" page
2. Enter URLs to test
3. Select HTTP method (GET/POST/HEAD)
4. Click "Start Test" to view response time and status

### DNS Test
1. Switch to "DNS Test" page
2. Enter domains to query
3. Select record type (A/AAAA/CNAME/MX)
4. Click "Start Test" to view resolution results

### MTR Test
1. Switch to "MTR Test" page
2. Enter target host
3. Configure test count
4. View detailed path analysis results

### Traceroute
1. Switch to "Traceroute" page
2. Enter target host
3. Configure maximum hops
4. View complete routing path

### Favorites Management
1. Switch to "Favorites" page
2. Add new favorite items
3. Edit or delete existing favorites
4. Use search function to quickly find items
5. One-click launch various tests

## ⌨️ Keyboard Shortcuts

- **Developer Tools**:
  - macOS: `Command + Shift + I`
  - Windows/Linux: `Ctrl + Shift + I`

## 🏗 Tech Stack

- **Frontend Framework**: Vue 3.5 + Composition API
- **UI Component Library**: Element Plus 2.9
- **Router Management**: Vue Router 4.5
- **Desktop Framework**: Electron 36.3
- **Build Tool**: Vite 6.3
- **HTTP Client**: Axios 1.9
- **Data Storage**: electron-store 10.0

## 📁 Project Structure

```
MultiSiteLatencyTool/
├── src/
│   ├── components/          # Vue components
│   │   ├── IpLookupView.vue    # IP query page
│   │   ├── PingView.vue        # Ping test page
│   │   ├── HttpView.vue        # HTTP test page
│   │   ├── DnsView.vue         # DNS test page
│   │   ├── MtrView.vue         # MTR test page
│   │   ├── TracerouteView.vue  # Traceroute page
│   │   └── FavoritesView.vue   # Favorites page
│   ├── router/             # Router configuration
│   ├── services/           # Business services
│   │   ├── ip2location.js      # IP geolocation service
│   │   ├── network.js          # Network testing service
│   │   └── storage.js          # Data storage service
│   ├── utils/              # Utility functions
│   ├── App.vue             # Main app component
│   └── main.js             # Vue app entry
├── public/                 # Static assets
├── dist/                   # Build output
├── main.js                 # Electron main process
├── preload.js              # Preload script
├── package.json            # Project configuration
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

## 🔧 Development Guide

### Adding New Features
1. Create new Vue components in `src/views/` directory
2. Add route configuration in `src/router/index.js`
3. Add navigation menu items in `src/App.vue`
4. Add corresponding services in `src/services/` if needed

### Debugging Tips
- Use keyboard shortcuts to open developer tools
- Check console output to understand application status
- Use Vue DevTools to debug Vue components

## 🤝 Contributing

1. Fork this project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Pull Request

## 📄 License

This project is licensed under the [GPL-3.0 License](LICENSE).

## 🙏 Acknowledgments

- [IP2Location](https://www.ip2location.com/) - Providing IP geolocation data services
- [Element Plus](https://element-plus.org/) - Excellent Vue 3 component library
- [Electron](https://www.electronjs.org/) - Cross-platform desktop application framework
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework

## 📞 Contact

- Author: Snake Konginchrist
- Project URL: [Gitee](https://gitee.com/Snake-Konginchrist/MultiSiteLatencyTool)
- Issue Reports: [Issues](https://gitee.com/Snake-Konginchrist/MultiSiteLatencyTool/issues)

---

⭐ If this project helps you, please give it a star!