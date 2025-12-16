/**
 * Bitcoin Topography Visualization
 * 3D hex-binned bar chart showing clearnet node distribution
 */

window.initTopographyViz = function() {
    // Scene setup
    let scene, camera, renderer, globe;
    let animationFrameId;
    
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
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);
    }

    /**
     * Create color gradient from dark blue to glowing orange based on value
     */
    function getColorForValue(value, maxValue) {
        const ratio = Math.min(value / maxValue, 1);
        
        // Dark blue to orange gradient
        const darkBlue = { r: 30, g: 60, b: 114 };
        const orange = { r: 255, g: 107, b: 0 };
        
        const r = Math.floor(darkBlue.r + (orange.r - darkBlue.r) * ratio);
        const g = Math.floor(darkBlue.g + (orange.g - darkBlue.g) * ratio);
        const b = Math.floor(darkBlue.b + (orange.b - darkBlue.b) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Load and process Bitcoin node data
     */
    async function loadData() {
        try {
            loadingDiv.classList.remove('hidden');
            
            const response = await fetch('./data/latest_snapshot.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extract and filter clearnet nodes (non-Tor)
            const nodes = data.nodes || {};
            const clearnetNodes = [];
            
            Object.entries(nodes).forEach(([address, nodeData]) => {
                // Filter for clearnet nodes (tor field is false or doesn't exist as true)
                if (!nodeData[11]) { // Index 11 is the 'tor' flag in Bitnodes data
                    const lat = nodeData[7];  // Index 7 is latitude
                    const lng = nodeData[8];  // Index 8 is longitude
                    
                    if (lat !== null && lng !== null) {
                        clearnetNodes.push({
                            lat: lat,
                            lng: lng,
                            address: address
                        });
                    }
                }
            });
            
            console.log(`Loaded ${clearnetNodes.length} clearnet nodes`);
            
            // Update stats
            updateStats(clearnetNodes.length, Object.keys(nodes).length);
            
            return clearnetNodes;
            
        } catch (error) {
            console.error('Error loading data:', error);
            loadingDiv.innerHTML = '<p style="color: #ff6b00;">Error loading data. Using demo mode.</p>';
            
            // Return demo data for testing
            return generateDemoData();
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
     * Initialize the globe with hex-binned layer
     */
    function initGlobe(nodeData) {
        globe = new ThreeGlobe()
            .globeImageUrl('https://unpkg.com/three-globe@2.31.0/example/img/earth-dark.jpg')
            .bumpImageUrl('https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png')
            .hexBinPointsData(nodeData)
            .hexBinPointLat('lat')
            .hexBinPointLng('lng')
            .hexBinResolution(5)
            .hexTopColor(d => getColorForValue(d.sumWeight, nodeData.length / 20))
            .hexSideColor(d => getColorForValue(d.sumWeight, nodeData.length / 20))
            .hexAltitude(d => d.sumWeight * 0.01)
            .hexBinMerge(true)
            .enablePointerInteraction(true);
        
        scene.add(globe);
        
        loadingDiv.classList.add('hidden');
    }

    /**
     * Animation loop
     */
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Auto-rotate globe
        if (globe) {
            globe.rotation.y += 0.002;
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
        
        // Clear stats
        statsDiv.innerHTML = '';
    }

    /**
     * Initialize the visualization
     */
    async function init() {
        initScene();
        const nodeData = await loadData();
        initGlobe(nodeData);
        animate();
        
        window.addEventListener('resize', onWindowResize);
    }

    // Start initialization
    init();

    // Return cleanup function
    return { cleanup };
};
