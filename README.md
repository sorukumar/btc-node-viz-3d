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
- Runs every Sunday at 22:00 UTC (late Sunday CST)
- Fetches data from `https://bitnodes.io/api/v1/snapshots/latest/`
- Saves it to `data/latest_snapshot.json`
- Automatically commits the updated data

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

## License

See LICENSE file for details.
