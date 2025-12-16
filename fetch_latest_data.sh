#!/bin/bash
# Script to manually fetch the latest Bitcoin node data from Bitnodes API
# This is useful for testing or updating data outside of the scheduled workflow

set -e  # Exit on any error

mkdir -p data

echo "Fetching latest snapshot from Bitnodes API..."
if curl -fH "Accept: application/json" \
     -o data/latest_snapshot.json \
     https://bitnodes.io/api/v1/snapshots/latest/; then
    echo "✓ Data fetched successfully!"
    ls -lh data/latest_snapshot.json
    
    # Validate JSON
    if command -v python3 &> /dev/null; then
        if python3 -m json.tool data/latest_snapshot.json > /dev/null 2>&1; then
            echo "✓ JSON validation passed"
        else
            echo "✗ Warning: Downloaded file is not valid JSON"
            exit 1
        fi
    fi
    
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
    echo "✗ Failed to fetch data from Bitnodes API"
    echo "Please check your internet connection and try again"
    exit 1
fi
