/**
 * Split World Visualization
 * Shows clearnet nodes on globe surface and Tor nodes as abstract point cloud
 */

window.initSplitWorldViz = function() {
    // Constants for Bitnodes API data structure
    const BITNODES_INDEX = {
        TOR: 11,        // Index 11 is the 'tor' flag
        LATITUDE: 7,    // Index 7 is latitude
        LONGITUDE: 8    // Index 8 is longitude
    };
    
    // Visualization constants
    const TOR_CLOUD_BASE_RADIUS = 120;
    const TOR_CLOUD_MAX_RADIUS = 180;
    const GLOBE_ROTATION_SPEED = 0.002;
    const TOR_CLOUD_ROTATION_SPEED_Y = -0.001;
    const TOR_CLOUD_ROTATION_SPEED_X = 0.0005;
    const TOR_CLOUD_PULSE_SPEED = 0.001;
    const TOR_CLOUD_PULSE_AMPLITUDE = 0.05;
    
    // Scene setup
    let scene, camera, renderer, globe, torCloud;
    let animationFrameId;
    let originalClearnet = [];
    let originalTor = [];
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
        camera.position.z = 350;
        
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
            
            // Extract and separate nodes
            const nodes = data.nodes || {};
            const clearnetNodes = [];
            const torNodes = [];
            
            Object.entries(nodes).forEach(([address, nodeData]) => {
                const lat = nodeData[BITNODES_INDEX.LATITUDE];
                const lng = nodeData[BITNODES_INDEX.LONGITUDE];
                const isTor = nodeData[BITNODES_INDEX.TOR];
                
                if (lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                    const node = {
                        lat: lat,
                        lng: lng,
                        address: address,
                        country: nodeData[4] || 'Unknown',
                        version: nodeData[10] || 'Unknown'
                    };
                    
                    if (isTor) {
                        torNodes.push(node);
                    } else {
                        clearnetNodes.push(node);
                    }
                }
            });
            
            console.log(`Loaded ${clearnetNodes.length} clearnet nodes and ${torNodes.length} Tor nodes`);
            
            originalClearnet = [...clearnetNodes];
            originalTor = [...torNodes];
            totalCount = Object.keys(nodes).length;
            
            // Update stats
            updateStats(clearnetNodes.length, torNodes.length, totalCount);
            
            return { clearnetNodes, torNodes };
            
        } catch (error) {
            console.error('Error loading data:', error);
            loadingDiv.innerHTML = '<p style="color: #ff6b00;">Error loading data. Using demo mode.</p>';
            
            // Return demo data for testing
            const demo = generateDemoData();
            originalClearnet = [...demo.clearnetNodes];
            originalTor = [...demo.torNodes];
            totalCount = originalClearnet.length + originalTor.length;
            updateStats(originalClearnet.length, originalTor.length, totalCount);
            return demo;
        }
    }

    /**
     * Generate demo data for testing
     */
    function generateDemoData() {
        const clearnetNodes = [];
        const torNodes = [];
        
        const regions = [
            { lat: 40.7128, lng: -74.0060, count: 100 },  // New York
            { lat: 51.5074, lng: -0.1278, count: 150 },   // London
            { lat: 35.6762, lng: 139.6503, count: 80 },   // Tokyo
            { lat: 37.7749, lng: -122.4194, count: 90 },  // San Francisco
            { lat: 52.5200, lng: 13.4050, count: 70 },    // Berlin
            { lat: -33.8688, lng: 151.2093, count: 50 },  // Sydney
        ];
        
        regions.forEach(region => {
            for (let i = 0; i < region.count; i++) {
                clearnetNodes.push({
                    lat: region.lat + (Math.random() - 0.5) * 10,
                    lng: region.lng + (Math.random() - 0.5) * 10,
                    address: `clearnet-${i}`,
                    country: 'Demo Country',
                    version: '1.0.0'
                });
            }
        });
        
        // Generate random Tor nodes
        for (let i = 0; i < 200; i++) {
            torNodes.push({
                lat: (Math.random() - 0.5) * 180,
                lng: (Math.random() - 0.5) * 360,
                address: `tor-${i}`,
                country: 'Demo Country',
                version: '1.0.0'
            });
        }
        
        return { clearnetNodes, torNodes };
    }

    /**
     * Update statistics display
     */
    function updateStats(clearnetCount, torCount, totalCount) {
        statsDiv.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Clearnet Nodes:</span>
                <span class="stat-value">${clearnetCount.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Tor Nodes:</span>
                <span class="stat-value tor">${torCount.toLocaleString()}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Nodes:</span>
                <span class="stat-value">${totalCount.toLocaleString()}</span>
            </div>
        `;
    }

    /**
     * Get submarine cable coordinates (sample data)
     */
    function getSubmarineCables() {
        return [
            {
                // Transatlantic: New York to London
                startLat: 40.7128, startLng: -74.0060,
                endLat: 51.5074, endLng: -0.1278
            },
            {
                // Pacific: San Francisco to Tokyo
                startLat: 37.7749, startLng: -122.4194,
                endLat: 35.6762, endLng: 139.6503
            },
            {
                // Europe-Asia: London to Singapore
                startLat: 51.5074, startLng: -0.1278,
                endLat: 1.3521, endLng: 103.8198
            },
            {
                // Trans-Pacific: Tokyo to Sydney
                startLat: 35.6762, startLng: 139.6503,
                endLat: -33.8688, endLng: 151.2093
            }
        ];
    }

    /**
     * Initialize the globe with clearnet nodes
     */
    function initGlobe(clearnetNodes) {
        globe = new ThreeGlobe()
            .globeImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-dark.jpg')
            .bumpImageUrl('https://cdn.jsdelivr.net/npm/three-globe@2.31.0/example/img/earth-topology.png')
            // Add clearnet nodes as glowing points
            .pointsData(clearnetNodes)
            .pointLat('lat')
            .pointLng('lng')
            .pointColor(() => '#ff6b00')
            .pointAltitude(0.01)
            .pointRadius(0.15)
            // Add submarine cables as arcs
            .arcsData(getSubmarineCables())
            .arcStartLat('startLat')
            .arcStartLng('startLng')
            .arcEndLat('endLat')
            .arcEndLng('endLng')
            .arcColor(() => 'rgba(100, 200, 255, 0.3)')
            .arcDashLength(0.4)
            .arcDashGap(0.2)
            .arcDashAnimateTime(3000)
            .arcStroke(0.5)
            .enablePointerInteraction(true)
            .onPointClick(point => showPointDetails(point))
            .onPointHover(point => {
                const tooltip = document.getElementById('tooltip');
                if (point) {
                    tooltip.innerHTML = point.address;
                    tooltip.style.left = mouseX + 10 + 'px';
                    tooltip.style.top = mouseY + 10 + 'px';
                    tooltip.classList.remove('hidden');
                } else {
                    tooltip.classList.add('hidden');
                }
            });
        
        scene.add(globe);
    }

    /**
     * Create abstract Tor node point cloud
     */
    function createTorCloud(torNodes) {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        torNodes.forEach(node => {
            // Random position in 3D space around the globe
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = TOR_CLOUD_BASE_RADIUS + Math.random() * (TOR_CLOUD_MAX_RADIUS - TOR_CLOUD_BASE_RADIUS);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            positions.push(x, y, z);
            
            // Ethereal cyan/purple color with some variation
            const colorChoice = Math.random();
            if (colorChoice < 0.5) {
                // Cyan
                colors.push(0, 1, 1);
            } else {
                // Purple
                colors.push(0.8, 0.2, 1);
            }
        });
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        // Create material with vertex colors
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        torCloud = new THREE.Points(geometry, material);
        scene.add(torCloud);
    }

    /**
     * Show details for clicked point
     */
    function showPointDetails(point) {
        const detailsDiv = document.getElementById('details');
        detailsDiv.classList.remove('hidden');
        detailsDiv.innerHTML = `
            <div class="details-item">
                <span class="details-label">Node Address:</span>
                <span class="details-value">${point.address}</span>
            </div>
            <div class="details-item">
                <span class="details-label">Country:</span>
                <span class="details-value">${point.country}</span>
            </div>
            <div class="details-item">
                <span class="details-label">Version:</span>
                <span class="details-value">${point.version}</span>
            </div>
            <div class="details-item">
                <span class="details-label">Latitude:</span>
                <span class="details-value">${point.lat.toFixed(2)}°</span>
            </div>
            <div class="details-item">
                <span class="details-label">Longitude:</span>
                <span class="details-value">${point.lng.toFixed(2)}°</span>
            </div>
        `;
    }

    /**
     * Animation loop
     */
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        
        // Auto-rotate globe
        if (globe) {
            globe.rotation.y += GLOBE_ROTATION_SPEED;
        }
        
        // Gentle rotation and pulsing of Tor cloud
        if (torCloud) {
            torCloud.rotation.y += TOR_CLOUD_ROTATION_SPEED_Y;
            torCloud.rotation.x += TOR_CLOUD_ROTATION_SPEED_X;
            
            // Pulsing effect
            const scale = 1 + Math.sin(Date.now() * TOR_CLOUD_PULSE_SPEED) * TOR_CLOUD_PULSE_AMPLITUDE;
            torCloud.scale.set(scale, scale, scale);
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
        
        if (torCloud) {
            torCloud.geometry.dispose();
            torCloud.material.dispose();
            scene.remove(torCloud);
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
        const { clearnetNodes, torNodes } = await loadData();
        initGlobe(clearnetNodes);
        createTorCloud(torNodes);
        animate();
        
        loadingDiv.classList.add('hidden');
        
        mouseMoveListener = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
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
            const filteredClearnet = originalClearnet.filter(node => node.address.toLowerCase().includes(query));
            globe.pointsData(filteredClearnet);
            updateStats(filteredClearnet.length, originalTor.length, totalCount);
        }
    };
};
