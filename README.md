# btc-node-viz-3d

3D visualization of the Bitcoin network's active node distribution, fetching real-time data from Bitnodes.

## Overview

This project provides two interactive 3D visualizations of the Bitcoin network:

1. **Bitcoin Topography** - A hex-binned 3D bar chart showing clearnet node distribution with color-coded height pillars
2. **Split World** - A dual-layer visualization showing clearnet nodes on the globe surface and Tor nodes as an abstract point cloud

## Features

- 🌍 Interactive 3D globe visualization using Three.js and three-globe
- 📊 Real-time data from Bitnodes API (updated weekly via GitHub Actions)
- 🔄 Switch between two visualization modes
- 🎨 Dark cyberpunk aesthetic theme
- 📱 Responsive design for desktop and mobile

## Visualization Concepts

### Bitcoin Topography
- Uses hexagonal binning to aggregate nodes by geographic region
- Height of pillars represents node density
- Color gradient from dark blue (low) to glowing orange (high)
- Shows only clearnet (non-Tor) nodes

### Split World
- **Surface Layer**: Clearnet nodes as glowing orange points on the globe
- **Privacy Layer**: Tor nodes as an abstract cyan/purple point cloud
- Includes submarine fiber optic cable visualization (arcs connecting major regions)

## Usage

Simply open `index.html` in a modern web browser. The visualization will:
1. Load the latest Bitcoin node snapshot data
2. Display the Bitcoin Topography view by default
3. Allow switching between visualizations using the navigation buttons

## Data Collection

The project uses a GitHub Actions workflow that:
- Runs automatically every Sunday at 22:00 UTC (late Sunday CST)
- Fetches data from `https://bitnodes.io/api/v1/snapshots/latest/`
- Saves it to `data/latest_snapshot.json`
- Automatically commits the updated data

### Manual Data Update

You can manually trigger the data fetch workflow:

1. Go to the **Actions** tab in the GitHub repository
2. Select the **"Fetch Bitcoin Node Data"** workflow
3. Click **"Run workflow"** button
4. Select the branch and click **"Run workflow"**

This will immediately fetch the latest Bitcoin node data from Bitnodes API.

## File Structure

```
.
├── .github/
│   └── workflows/
│       └── data_fetch.yml          # GitHub Actions workflow for data collection
├── data/
│   └── latest_snapshot.json        # Bitcoin node data (updated weekly)
├── index.html                      # Main HTML file
├── style.css                       # Styling and theme
├── topography_viz.js              # Bitcoin Topography visualization
└── split_world_viz.js             # Split World visualization
```

## Technologies

- [Three.js](https://threejs.org/) - 3D graphics library
- [three-globe](https://github.com/vasturiano/three-globe) - Globe visualization component
- [Bitnodes API](https://bitnodes.io/api/) - Bitcoin node data source
- GitHub Actions - Automated data collection

## Development

To run locally:
1. Clone the repository
2. (Optional) Run `./fetch_latest_data.sh` to get the latest Bitcoin node data
3. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, etc.)
4. The visualization will use demo data if `data/latest_snapshot.json` is not available

### Updating Data Manually

To fetch the latest Bitcoin node data outside of the scheduled workflow:
```bash
./fetch_latest_data.sh
```

This will download the latest snapshot from Bitnodes API and save it to `data/latest_snapshot.json`.

## Troubleshooting

### Visualization Not Rendering

If the visualization is not rendering on GitHub Pages:

1. **Check if libraries are loaded**: Open browser developer tools (F12) and check the Console tab for errors
2. **Ad Blockers**: Some ad blockers may block CDN resources. Try disabling them for this site
3. **Browser Compatibility**: Use a modern browser (Chrome, Firefox, Edge, Safari)
4. **Clear Cache**: Try clearing your browser cache and refreshing the page
5. **Check GitHub Pages**: Ensure GitHub Pages is enabled in repository settings and pointing to the correct branch

### Error: "Visualization Libraries Not Loaded"

This error appears when Three.js or three-globe libraries fail to load from the CDN. Common causes:

- **Ad Blocker**: Disable ad blockers or content security extensions
- **Network Issues**: Check your internet connection
- **CDN Blocked**: Your network may be blocking cdn.jsdelivr.net

**Solution**: The page will automatically display an informative error message. Follow the on-screen instructions.

### Data Issues

If you see demo data or old data:

1. Manually trigger the data fetch workflow (see Manual Data Update section above)
2. Or run `./fetch_latest_data.sh` locally and commit the changes

## License

See LICENSE file for details.
