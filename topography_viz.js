/**
 * Bitcoin Topography Visualization
 * 3D hex-binned bar chart showing clearnet node distribution
 */

window.initTopographyViz = function() {
    // Constants for Bitnodes API data structure
    const BITNODES_INDEX = {
        PROTOCOL: 0,
        USER_AGENT: 1,
        LAST_SEEN: 2,
        ASN: 3,
        HEIGHT: 4
    };
    
    // Visualization constants
    const HEX_BIN_RESOLUTION = 4;
    const MAX_VALUE_DIVISOR = 20;
    const ALTITUDE_MULTIPLIER = 0.02;
    const MAX_ALTITUDE = 0.3;
    const GLOBE_ROTATION_SPEED = 0.002;
    
    // Scene setup
    let scene, camera, renderer, globe, controls;
    let animationFrameId;
    let originalNodeData = [];
    let nodeDataGlobal = [];
    let hexBins = [];
    let hexbinGlobal;
    let totalCount = 0;
    let mouseX, mouseY;
    let mouseMoveListener;
    
    const container = document.getElementById('globeViz');
    const loadingDiv = document.getElementById('loading');
    const statsDiv = document.getElementById('stats');

    /**
     * Initialize the Three.js scene, camera, and renderer
     */
    function initScene() {
        // Scene
        scene = new THREE.Scene();
        
        // Camera
        camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 300;
        
        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Orbit controls for zoom and pan
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 150; // Minimum zoom distance
        controls.maxDistance = 500; // Maximum zoom distance
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);
    }

    /**
     * Create color gradient from cyan to yellow to red based on value
     */
    function getColorForValue(value, maxValue) {
        const ratio = Math.min(value / maxValue, 1);
        let r, g, b;
        if (ratio < 0.5) {
            const subRatio = ratio * 2;
            // Cyan to yellow
            r = Math.floor(0 + (255 - 0) * subRatio);
            g = Math.floor(255 + (255 - 255) * subRatio);
            b = Math.floor(255 + (0 - 255) * subRatio);
        } else {
            const subRatio = (ratio - 0.5) * 2;
            // Yellow to red
            r = Math.floor(255 + (255 - 255) * subRatio);
            g = Math.floor(255 + (0 - 255) * subRatio);
            b = Math.floor(0 + (0 - 0) * subRatio);
        }
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Load and process Bitcoin node data
     */
    async function loadData() {
        try {
            loadingDiv.classList.remove('hidden');
            
            const response = await fetch('./data/bitnode_data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Country approximate centers for invalid coordinates
            const countryCenters = {
                'US': [37.0902, -95.7129],
                'DE': [51.1657, 10.4515],
                'FR': [46.2276, 2.2137],
                'CA': [56.1304, -106.3468],
                'FI': [61.9241, 25.7482],
                'NL': [52.1326, 5.2913],
                'GB': [55.3781, -3.4360],
                'CH': [46.8182, 8.2275],
                'AU': [-25.2744, 133.7751],
                'KR': [35.9078, 127.7669],
                // Add more as needed
            };
            
            // Extract and filter clearnet nodes (non-Tor)
            const nodes = data;
            const clearnetNodes = [];
            const torNodes = [];
            
            Object.entries(nodes).forEach(([address, nodeData]) => {
                // Use provided coordinates if available, otherwise random
                let lat = nodeData.latitude || (Math.random() - 0.5) * 180;
                let lng = nodeData.longitude || (Math.random() - 0.5) * 360;
                
                // Validate and correct coordinates
                if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
                    const country = nodeData.country;
                    if (country && countryCenters[country]) {
                        [lat, lng] = countryCenters[country];
                        // Add small random offset to avoid exact overlap
                        lat += (Math.random() - 0.5) * 2;
                        lng += (Math.random() - 0.5) * 2;
                    } else {
                        // Fallback to random if country not in centers
                        lat = (Math.random() - 0.5) * 180;
                        lng = (Math.random() - 0.5) * 360;
                    }
                }
                
                const node = {
                    lat: Math.round(lat * 10000) / 10000,
                    lng: Math.round(lng * 10000) / 10000,
                    address: address,
                    country: nodeData.country || 'Unknown',
                    version: nodeData.user_agent?.split(':')[1] || 'Unknown',
                    city: nodeData.city || 'Unknown'
                };
                
                if (nodeData.addr_family === 'onion' || address.includes('.onion')) {
                    torNodes.push(node);
                } else {
                    clearnetNodes.push(node);
                }
            });
            
            console.log(`Loaded ${clearnetNodes.length} clearnet nodes`);
            
            originalNodeData = [...clearnetNodes];
            nodeDataGlobal = [...clearnetNodes];
            totalCount = Object.keys(nodes).length;
            
            // Update stats
            updateStats(clearnetNodes.length, totalCount);
            
            return clearnetNodes;
            
        } catch (error) {
            console.error('Error loading data:', error);
            loadingDiv.innerHTML = '<p style="color: #ff6b00;">Error loading data. Using demo mode.</p>';
            
            // Return demo data for testing
            const demoData = generateDemoData();
            originalNodeData = [...demoData];
            totalCount = demoData.length;
            console.log(`Loaded ${demoData.length} clearnet nodes (demo)`);
            return demoData;
        }
    }

    /**
     * Generate demo data for testing
     */
    function generateDemoData() {
        const demoData = [];
        const regions = [
            { lat: 40.7128, lng: -74.0060, count: 150 },  // New York
            { lat: 51.5074, lng: -0.1278, count: 200 },   // London
            { lat: 35.6762, lng: 139.6503, count: 100 },  // Tokyo
            { lat: 37.7749, lng: -122.4194, count: 120 }, // San Francisco
            { lat: 52.5200, lng: 13.4050, count: 90 },    // Berlin
            { lat: -33.8688, lng: 151.2093, count: 60 },  // Sydney
        ];
        
        regions.forEach(region => {
            for (let i = 0; i < region.count; i++) {
                demoData.push({
                    lat: region.lat + (Math.random() - 0.5) * 10,
                    lng: region.lng + (Math.random() - 0.5) * 10,
                    address: `demo-${i}`
                });
            }
        });
        
        updateStats(demoData.length, demoData.length);
        return demoData;
    }

    /**
     * Update statistics display
     */
    function updateStats(clearnetCount, totalCount) {
        statsDiv.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Clearnet Nodes:</span>
                <span class="stat-value">${clearnetCount.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Nodes:</span>
                <span class="stat-value">${totalCount.toLocaleString()}</span>
            </div>
        `;
    }

    /**
     * Show details for clicked hex bin
     */
    function showHexDetails(hexData) {
        const detailsDiv = document.getElementById('details');
        detailsDiv.classList.remove('hidden');
        detailsDiv.innerHTML = `
            <div class="details-item">
                <span class="details-label">Nodes in Region:</span>
                <span class="details-value">${hexData.sumWeight}</span>
            </div>
            <div class="details-item">
                <span class="details-label">Latitude:</span>
                <span class="details-value">${hexData.lat.toFixed(2)}°</span>
            </div>
            <div class="details-item">
                <span class="details-label">Longitude:</span>
                <span class="details-value">${hexData.lng.toFixed(2)}°</span>
            </div>
        `;
    }

    /**
     * Show tooltip on hex hover
     */
    function showTooltip(hexData) {
        const tooltip = document.getElementById('tooltip');
        tooltip.innerHTML = `
            <strong>Region Info</strong><br>
            Region: ${hexData.region || 'Unknown'}<br>
            City: ${hexData.city || 'Unknown'}<br>
            Nodes: ${hexData.sumWeight}<br>
            Lat: ${hexData.lat}°<br>
            Lng: ${hexData.lng}°<br>
            Distance: ${hexData.dist || 'N/A'}<br>
            Nodes Found: ${hexData.foundNodes || 'N/A'}
        `;
        tooltip.classList.remove('hidden');
        tooltip.style.left = mouseX + 10 + 'px';
        tooltip.style.top = mouseY + 10 + 'px';
    }

    /**
     * Hide tooltip
     */
    function hideTooltip() {
        const tooltip = document.getElementById('tooltip');
        tooltip.classList.add('hidden');
    }

    /**
     * Initialize the globe with hex-binned layer
     */
    function initGlobe(nodeData, countries) {
        // Bin the data for hover detection
        hexbinGlobal = d3.hexbin().radius(5).extent([[-180, -90], [180, 90]]);
        hexBins = hexbinGlobal(nodeData.map(d => [d.lng, d.lat]));
        
        globe = new ThreeGlobe();
        globe.globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-dark.jpg');
        globe.bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-topology.png');
        
        // Add country polygons for better region distinction
        globe.polygonsData(countries);
        globe.polygonCapColor(() => 'rgba(150, 150, 150, 0.4)');
        globe.polygonSideColor(() => 'rgba(150, 150, 150, 0.4)');
        globe.polygonStrokeColor(() => 'rgba(255, 255, 255, 0.8)');
        
        globe.hexBinPointsData(nodeData);
        globe.hexBinPointLat('lat');
        globe.hexBinPointLng('lng');
        globe.hexBinResolution(HEX_BIN_RESOLUTION);
        globe.hexTopColor(d => getColorForValue(d.sumWeight, nodeData.length / MAX_VALUE_DIVISOR));
        globe.hexSideColor(d => getColorForValue(d.sumWeight, nodeData.length / MAX_VALUE_DIVISOR));
        globe.hexAltitude(d => Math.min(d.sumWeight * ALTITUDE_MULTIPLIER, MAX_ALTITUDE));
        globe.hexBinMerge(true);
        
        scene.add(globe);
        
        loadingDiv.classList.add('hidden');
    }

    /**
     * Load country polygons data
     */
    async function loadCountries() {
        const response = await fetch('./data/countries.geo.json');
        const data = await response.json();
        return data.features;
    }

    /**
     * Animation loop
     */
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Auto-rotate globe only when zoomed out
        if (globe && camera.position.z > 350) {
            globe.rotation.y += GLOBE_ROTATION_SPEED;
        }
        
        // Update orbit controls
        if (controls) {
            controls.update();
        }
        
        renderer.render(scene, camera);
    }

    /**
     * Handle window resize
     */
    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    /**
     * Cleanup function
     */
    function cleanup() {
        // Stop animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        
        // Remove event listener
        window.removeEventListener('resize', onWindowResize);
        
        if (mouseMoveListener) {
            container.removeEventListener('mousemove', mouseMoveListener);
        }
        
        // Dispose of Three.js objects
        if (renderer) {
            renderer.dispose();
            if (renderer.domElement && renderer.domElement.parentNode) {
                renderer.domElement.parentNode.removeChild(renderer.domElement);
            }
        }
        
        if (globe) {
            scene.remove(globe);
        }
        
        if (controls) {
            controls.dispose();
        }
        
        // Clear stats
        statsDiv.innerHTML = '';
        
        // Clear details
        const detailsDiv = document.getElementById('details');
        if (detailsDiv) {
            detailsDiv.classList.add('hidden');
            detailsDiv.innerHTML = '';
        }
        
        // Hide tooltip
        const tooltip = document.getElementById('tooltip');
        if (tooltip) {
            tooltip.classList.add('hidden');
        }
    }

    /**
     * Initialize the visualization
     */
    async function init() {
        initScene();
        const nodeData = await loadData();
        const countries = await loadCountries();
        initGlobe(nodeData, countries);
        animate();
        
        mouseMoveListener = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Raycasting for hover
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            const rect = container.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = - ((e.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(globe);
            if (intersects.length > 0) {
                const point = intersects[0].point;
                
                // Account for globe rotation (only y-axis rotation)
                const angle = -globe.rotation.y;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const x = point.x * cos - point.z * sin;
                const z = point.x * sin + point.z * cos;
                const y = point.y;
                
                const lat = Math.asin(y / 100) * 180 / Math.PI;
                const lng = Math.atan2(z, x) * 180 / Math.PI;
                
                // Find the closest hex bin
                let hoveredBin = null;
                let minDist = Infinity;
                hexBins.forEach(bin => {
                    const dist = Math.sqrt((bin.x - lng) ** 2 + (bin.y - lat) ** 2);
                    if (dist < minDist) {
                        minDist = dist;
                        hoveredBin = bin;
                    }
                });
                
                if (hoveredBin && minDist < 10) {
                    // Find primary country and city
                    const countries = {};
                    const cities = {};
                    let foundNodes = 0;
                    hoveredBin.forEach(point => {
                        const node = nodeDataGlobal.find(n => n.lng === point[0] && n.lat === point[1]);
                        if (node) {
                            foundNodes++;
                            countries[node.country] = (countries[node.country] || 0) + 1;
                            cities[node.city] = (cities[node.city] || 0) + 1;
                        }
                    });
                    const primaryCountry = Object.keys(countries).reduce((a, b) => countries[a] > countries[b] ? a : b, 'Unknown');
                    const primaryCity = Object.keys(cities).reduce((a, b) => cities[a] > cities[b] ? a : b, 'Unknown');
                    
                    showTooltip({ sumWeight: hoveredBin.length, lat: lat.toFixed(2), lng: lng.toFixed(2), region: primaryCountry, city: primaryCity, dist: minDist.toFixed(2), foundNodes });
                } else {
                    showTooltip({ lat: lat.toFixed(2), lng: lng.toFixed(2), sumWeight: 'No data', region: 'Unknown', city: 'Unknown', dist: minDist.toFixed(2), foundNodes: 0 });
                }
            } else {
                hideTooltip();
            }
        };
        container.addEventListener('mousemove', mouseMoveListener);
        
        window.addEventListener('resize', onWindowResize);
    }

    // Start initialization
    init();

    // Return cleanup function
    return { 
        cleanup,
        filterNodes: (query) => {
            const filtered = originalNodeData.filter(node => node.address.toLowerCase().includes(query));
            nodeDataGlobal = filtered;
            hexBins = hexbinGlobal(filtered.map(d => [d.lng, d.lat]));
            globe.hexBinPointsData(filtered);
            globe.hexTopColor(d => getColorForValue(d.sumWeight, filtered.length / MAX_VALUE_DIVISOR));
            globe.hexSideColor(d => getColorForValue(d.sumWeight, filtered.length / MAX_VALUE_DIVISOR));
            globe.hexAltitude(d => Math.min(d.sumWeight * ALTITUDE_MULTIPLIER, MAX_ALTITUDE));
            updateStats(filtered.length, totalCount);
        }
    };
};
