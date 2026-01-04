# Data Analysis for btc-node-viz-3d

## Data Source
The dataset is derived from the Bitnodes API snapshot, processed via `process.py` to extract relevant fields for visualization.

## Data Dictionary

### Raw Data Fields (from Bitnodes API)
- `port` (integer): The port number the node is listening on (e.g., 8333 for Bitcoin mainnet).
- `addr_family` (string): Address family, either 'ipv4' or 'onion' (Tor hidden service).
- `city` (string): City name where the node is located (may be null).
- `country` (string): ISO 3166-1 alpha-2 country code (e.g., 'US', 'DE').
- `asn` (integer): Autonomous System Number for the node's network.
- `org` (string): Organization name associated with the ASN.
- `latitude` (float): Geographic latitude in decimal degrees (-90 to 90).
- `longitude` (float): Geographic longitude in decimal degrees (-180 to 180).
- `timestamp` (string): ISO 8601 timestamp of when the snapshot was taken.
- `user_agent` (string): Bitcoin client user agent string (e.g., '/Satoshi:25.0.0/').
- `protocol_version` (integer): Bitcoin protocol version supported by the node.

### Processed Data Fields (used in visualization)
- `address` (string): The node address (IP or onion), used as the key in the JSON object.
- `lat` (float): Latitude, validated to be within -90 to 90.
- `lng` (float): Longitude, validated to be within -180 to 180.
- `country` (string): Country code, defaults to 'Unknown' if null.
- `city` (string): City name, defaults to 'Unknown' if null.
- `version` (string): Extracted version from user_agent (e.g., '25.0.0'), defaults to 'Unknown'.
- `addr_family` (string): Used to classify nodes as clearnet or Tor.

## Exploratory Data Analysis

### Dataset Overview
- **Total Nodes**: 24,165
- **Clearnet Nodes** (IPv4): 8,502
- **Tor Nodes** (Onion): 15,663

### Clearnet Nodes Analysis
- **Country Population**: 100% of clearnet nodes have a country code populated.
- **City Population**: 86.5% of clearnet nodes have a city name populated.
- **Both Country and City**: 86.5% have both fields populated.

### Geographic Distribution

#### Top 10 Countries (by node count)
1. US (United States): 2,464 nodes
2. DE (Germany): 1,283 nodes
3. FR (France): 698 nodes
4. CA (Canada): 411 nodes
5. FI (Finland): 398 nodes
6. NL (Netherlands): 343 nodes
7. GB (United Kingdom): 312 nodes
8. CH (Switzerland): 248 nodes
9. AU (Australia): 170 nodes
10. KR (South Korea): 149 nodes

#### Top 10 Cities (by node count)
1. Falkenstein (Germany): 397 nodes
2. Helsinki (Finland): 358 nodes
3. Nuremberg (Germany): 176 nodes
4. Lauterbourg (France): 160 nodes
5. Frankfurt am Main (Germany): 151 nodes
6. Singapore (Singapore): 103 nodes
7. Ashburn (United States): 103 nodes
8. Zurich (Switzerland): 98 nodes
9. Amsterdam (Netherlands): 97 nodes
10. Sydney (Australia): 74 nodes

### Data Quality Notes
- **Coordinate Validation**: Invalid latitudes (>90 or <-90) and longitudes (>180 or <-180) are randomized to prevent visualization errors.
- **Missing Data**: City data is missing for ~13.5% of clearnet nodes, but country is complete.
- **Geographic Clustering**: Many nodes are hosted in data centers (e.g., Falkenstein, Helsinki), leading to high concentrations in specific cities.
- **Tor vs Clearnet**: Tor nodes use onion addresses and lack geographic data, represented as abstract clouds in visualization.

### Visualization Usage
- **Clearnet Nodes**: Used for both topography (hex-binned bars) and split world (surface points).
- **Tor Nodes**: Used only in split world as abstract point clouds around poles.
- **Country Polygons**: Overlay for better land/ocean distinction.
- **Hover Tooltips**: Display country, city, and other node details where available.

This analysis ensures the dataset is well-understood for accurate visualization and future enhancements.