#!/bin/bash
# Script to download Three.js and three-globe libraries for local development
# Run this script if you want to test locally without CDN dependencies

set -e  # Exit on any error

mkdir -p lib

echo "Downloading Three.js..."
if curl -fL -o lib/three.min.js https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js; then
    echo "✓ Three.js downloaded successfully"
else
    echo "✗ Failed to download Three.js"
    exit 1
fi

echo "Downloading three-globe..."
if curl -fL -o lib/three-globe.min.js https://cdn.jsdelivr.net/npm/three-globe@2.31.0/dist/three-globe.min.js; then
    echo "✓ three-globe downloaded successfully"
else
    echo "✗ Failed to download three-globe"
    exit 1
fi

echo "Downloading OrbitControls..."
if curl -fL -o lib/OrbitControls.js https://cdnjs.cloudflare.com/ajax/libs/three.js/r160/examples/js/controls/OrbitControls.js; then
    echo "✓ OrbitControls downloaded successfully"
else
    echo "✗ Failed to download OrbitControls"
    exit 1
fi

echo ""
echo "Done! Libraries downloaded to lib/ directory"
echo "To use local libraries, update the script tags in index.html to:"
echo '  <script src="lib/three.min.js"></script>'
echo '  <script src="lib/OrbitControls.js"></script>'
echo '  <script src="lib/three-globe.min.js"></script>'
