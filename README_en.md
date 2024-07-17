# MultiSiteLatencyTool

如果你想查看简体中文版本的README.md，请点击[这里](README.md)。

MultiSiteLatencyTool is an open-source project designed to provide a simple and user-friendly interface for measuring latency across multiple specified websites. It displays the IP addresses of these websites along with their geographic location information. Users can quickly assess the access speed of each website and easily manage the list of websites to measure. Additionally, the tool integrates IP2Location.io for IP geolocation services, offering users intuitive insights into the geographical distribution of website servers. Using concurrent measurement techniques, MultiSiteLatencyTool efficiently handles latency measurement tasks for multiple websites, providing comprehensive network performance analysis reports.

## Features

- Measure latency across multiple websites
- Display website IP addresses
- Retrieve geographic location information of IP addresses
- Simple and user-friendly interface
- Concurrent measurement of multiple websites

## Installation

1. Clone the repository locally:

   ```bash
   git clone https://github.com/Snake-Konginchrist/MultiSiteLatencyTool.git
   ```

2. Navigate into the project directory:

   ```bash
   cd MultiSiteLatencyTool
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

## Configuration

1. **Create `.env` file**: Create a file named `.env` in the root directory of the project.

2. **Add API Key**: Open the `.env` file and add your API Key obtained from IP2Location.io:

   ```
   IP2LOCATION_API_KEY=your_api_key_here
   ```

   Replace `your_api_key_here` with your actual API Key obtained from IP2Location.io.

## Usage

1. Start the application:

   ```bash
   npm start
   ```

2. In the application window, input the list of website URLs to measure, one per line.

3. Click the "Measure Latency" button to view the measurement results.

## File Structure

```plaintext
MultiSiteLatencyTool/
├── package.json
├── main.js
├── preload.js
├── renderer.js
├── index.html
├── assets/
│   └── styles.css
├── src/
│   ├── latency.js
│   └── geoip.js
└── node_modules/
```

- `package.json`: Project configuration file containing dependencies and scripts.
- `main.js`: Main process file responsible for creating and managing application windows.
- `preload.js`: Preload script used to enable Node.js modules in the renderer process.
- `renderer.js`: Renderer process script handling user interaction and UI updates.
- `index.html`: Main page of the application.
- `assets/styles.css`: Stylesheet for the application.
- `src/latency.js`: Module responsible for measuring website latency.
- `src/geoip.js`: Module responsible for retrieving IP addresses and geographic location information.

## Troubleshooting

### Error Installing Dependencies

If you encounter errors while installing dependencies, try the following steps:

1. Ensure no other processes are using the project folder.
2. Try deleting the `node_modules` folder and `package-lock.json` file:

   ```bash
   rm -rf node_modules package-lock.json
   ```

3. Clean npm cache:

   ```bash
   npm cache clean --force
   ```

4. Reinstall dependencies:

   ```bash
   npm install
   ```

### Error Starting the Application

If you encounter errors when starting the application, ensure all dependencies are properly installed and the IP2Location.io API key is correctly configured. You may also try running the terminal with administrator privileges and execute the following command to ensure correct file permissions:

```bash
npm start
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.