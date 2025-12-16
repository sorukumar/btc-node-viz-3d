#!/bin/bash
# Script to download Three.js and three-globe libraries for local development
# Run this script if you want to test locally without CDN dependencies

mkdir -p lib

echo "Downloading Three.js..."
curl -L -o lib/three.min.js https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js

echo "Downloading three-globe..."
curl -L -o lib/three-globe.min.js https://cdn.jsdelivr.net/npm/three-globe@2.31.0/dist/three-globe.min.js

echo "Done! Libraries downloaded to lib/ directory"
echo "To use local libraries, update the script tags in index.html to:"
echo '  <script src="lib/three.min.js"></script>'
echo '  <script src="lib/three-globe.min.js"></script>'
