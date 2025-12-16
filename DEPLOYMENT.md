# Deployment Guide

This document explains how to deploy and troubleshoot the Bitcoin Node Visualization on GitHub Pages.

## Quick Start

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: Select `main` (or your default branch) and `/` (root)
   - Click Save

2. **Update Data** (Optional but recommended):
   - Go to Actions tab
   - Select "Fetch Bitcoin Node Data" workflow
   - Click "Run workflow" to fetch latest data

3. **Access Your Site**:
   - Your visualization will be available at: `https://[username].github.io/[repo-name]/`
   - Example: `https://sorukumar.github.io/btc-node-viz-3d/`

## Recent Fixes Applied

### Issue 1: Visualization Not Rendering

**Problem**: The 3D visualization was not displaying on GitHub Pages.

**Root Causes Identified**:
1. CDN libraries from unpkg.com were potentially blocked or unreliable
2. Jekyll processing might interfere with JavaScript files
3. No error handling for library loading failures

**Solutions Applied**:
1. ✅ Switched from unpkg.com to jsdelivr.net CDN (more reliable and widely accepted)
2. ✅ Added `.nojekyll` file to disable Jekyll processing
3. ✅ Added comprehensive error handling with user-friendly messages
4. ✅ Created library download script for local development

### Issue 2: Data Update

**Problem**: Need ability to fetch latest Bitcoin node data on demand.

**Solutions Applied**:
1. ✅ GitHub Actions workflow already configured with manual trigger capability
2. ✅ Created `fetch_latest_data.sh` script for local data updates
3. ✅ Updated README with instructions for manual data updates

## CDN Libraries Used

The visualization uses these external libraries from jsdelivr.net CDN:

- **Three.js v0.160.0**: 3D graphics rendering
- **three-globe v2.31.0**: Globe visualization component

These are loaded from:
```
https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js
https://cdn.jsdelivr.net/npm/three-globe@2.31.0/dist/three-globe.min.js
```

## Error Handling

The application now includes automatic error detection:

- If libraries fail to load, users see a clear error message
- The error message suggests common fixes (disable ad blockers, check network, etc.)
- If data fails to load, the app falls back to demo data automatically

## Testing the Deployment

1. **Check Console for Errors**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for any error messages

2. **Expected Behavior**:
   - Page loads with navigation header
   - Loading indicator appears briefly
   - 3D globe with Bitcoin nodes renders
   - Can switch between "Bitcoin Topography" and "Split World" views

3. **Common Issues**:
   - **Blank page**: Check if GitHub Pages is enabled
   - **Loading forever**: Check browser console for errors
   - **Library errors**: Ad blocker may be blocking CDN resources

## Local Development

For local development without CDN dependencies:

1. Run `./download_libs.sh` to download libraries locally
2. Update `index.html` to use local libraries instead of CDN
3. Serve with any HTTP server (e.g., `python3 -m http.server`)

## Data Updates

### Automatic Updates
- Runs every Sunday at 22:00 UTC via GitHub Actions

### Manual Update (via GitHub Actions)
1. Go to Actions tab
2. Select "Fetch Bitcoin Node Data" workflow
3. Click "Run workflow"
4. Wait for workflow to complete

### Manual Update (Local)
```bash
./fetch_latest_data.sh
git add data/latest_snapshot.json
git commit -m "Update Bitcoin node data"
git push
```

## Monitoring

Check the GitHub Actions tab to monitor:
- Data fetch workflow runs
- Any errors in automated data updates
- Workflow history and logs

## Support

If issues persist after following this guide:
1. Check GitHub Pages build status
2. Review browser console for specific errors
3. Verify CDN resources are accessible from your network
4. Try accessing from a different browser or network
