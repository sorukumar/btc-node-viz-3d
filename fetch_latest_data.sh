#!/bin/bash
# Script to manually fetch the latest Bitcoin node data from Bitnodes API
# This is useful for testing or updating data outside of the scheduled workflow

mkdir -p data

echo "Fetching latest snapshot from Bitnodes API..."
curl -H "Accept: application/json" \
     -o data/latest_snapshot.json \
     https://bitnodes.io/api/v1/snapshots/latest/

if [ -f data/latest_snapshot.json ]; then
    echo "Data fetched successfully!"
    ls -lh data/latest_snapshot.json
    echo ""
    echo "Preview of data:"
    head -c 500 data/latest_snapshot.json
    echo ""
    echo ""
    echo "To commit this data, run:"
    echo "  git add data/latest_snapshot.json"
    echo "  git commit -m 'chore: update Bitcoin node data snapshot'"
    echo "  git push"
else
    echo "Failed to fetch data"
    exit 1
fi
