const waveConfig = {
    segments: 200, // number of segments to divide the wave into
    waveHeight: 300, // fixed pixel height of the wave
    positionOffset: -100, // raise/lower the wave baseline
    tilt: -100, // positive = lift right, negative = lift left
    flipped: false, // flip the wave upside down
    color: 'var(--color-navy)', // CSS color or variable
    waves: [ // Multiple stacked wave layers
        { amplitude: 35, frequency: 0.02, speed: 0.0019, phase: 0 },
        { amplitude: 16, frequency: 0.12, speed: 0.0044, phase: 0 }
    ]
};

// Inject styles
const style = document.createElement('style');
style.textContent = `
    .wave-divider {
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 100%;
        max-height: 100%;
        display: block;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    }
    
    .wave-divider.wave-divider--flipped {
        bottom: auto;
        top: -1px;
    }
    
    .wave-divider svg {
        display: block;
        width: 100%;
        height: 100%;
    }
`;
document.head.appendChild(style);

// Get configuration for a specific divider element
function getDividerConfig(element) {
    const config = { ...waveConfig };
    
    // Override with data attributes
    if (element.hasAttribute('data-segments')) {
        config.segments = parseInt(element.getAttribute('data-segments'));
    }
    if (element.hasAttribute('data-wave-height')) {
        config.waveHeight = parseFloat(element.getAttribute('data-wave-height'));
    }
    if (element.hasAttribute('data-position-offset')) {
        config.positionOffset = parseFloat(element.getAttribute('data-position-offset'));
    }
    if (element.hasAttribute('data-tilt')) {
        config.tilt = parseFloat(element.getAttribute('data-tilt'));
    }
    if (element.hasAttribute('data-flipped')) {
        config.flipped = element.getAttribute('data-flipped') !== 'false';
    }
    if (element.hasAttribute('data-color')) {
        config.color = element.getAttribute('data-color');
    }
    
    return config;
}

// Initialize wave dividers
function initWaveDividers() {
    const dividers = document.querySelectorAll('.wave-divider');
    
    dividers.forEach(container => {
        const existingSvg = container.querySelector('svg');
        if (existingSvg) {
            existingSvg.remove();
        }
        
        const dividerConfig = getDividerConfig(container);
        const waveHeight = dividerConfig.waveHeight;
        
        // Set fixed height, capped at container size
        container.style.height = waveHeight + 'px';
        
        // Add flipped class if needed
        if (dividerConfig.flipped) {
            container.classList.add('wave-divider--flipped');
        } else {
            container.classList.remove('wave-divider--flipped');
        }
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 1200 ${waveHeight}`);
        svg.setAttribute('preserveAspectRatio', 'none');
        
        // Create path for the wave
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', 'wave-path');
        path.setAttribute('fill', dividerConfig.color);
        path.setAttribute('data-wave-height', waveHeight);
        path.setAttribute('data-config', JSON.stringify(dividerConfig));
        
        svg.appendChild(path);
        container.appendChild(svg);
    });
}

function generateWavePath() {
    const wavePaths = document.querySelectorAll('.wave-path');
    
    wavePaths.forEach(wavePath => {
        const waveHeight = parseFloat(wavePath.getAttribute('data-wave-height')) || 300;
        const dividerConfig = JSON.parse(wavePath.getAttribute('data-config'));
        const segments = dividerConfig.segments;
        const tilt = dividerConfig.tilt;
        let positionOffset = dividerConfig.positionOffset;
        const isFlipped = dividerConfig.flipped;
        
        const midlineY = waveHeight / 2 - positionOffset;
        
        // Define the baseline heights at left and right edges
        let leftBaselineY = midlineY + Math.min(tilt, 0);
        let rightBaselineY = midlineY - Math.max(tilt, 0);
        
        // Flip the baseline if needed
        if (isFlipped) {
            [leftBaselineY, rightBaselineY] = [waveHeight - rightBaselineY, waveHeight - leftBaselineY];
        }
        
        let pathPoints = [];

        for (let i = 0; i <= segments; i++) {
            const x = (i / segments) * 1200;
            const t = i / segments;
            
            // Linearly interpolate baseline from left to right
            let y = leftBaselineY + (rightBaselineY - leftBaselineY) * t;

            // Stack multiple waves together
            for (let waveLayer of dividerConfig.waves) {
                let waveOffset = Math.sin((i * waveLayer.frequency) + waveLayer.phase) * waveLayer.amplitude;
                // Invert wave offset if flipped
                if (isFlipped) {
                    waveOffset = -waveOffset;
                }
                y += waveOffset;
            }

            pathPoints.push({ x, y });
        }

        // Build path string
        let path = `M${pathPoints[0].x},${pathPoints[0].y}`;
        for (let i = 1; i < pathPoints.length; i++) {
            path += ` L${pathPoints[i].x},${pathPoints[i].y}`;
        }

        // Close the shape
        if (isFlipped) {
            // For flipped, close from top
            path += ` L1200,0 L0,0 Z`;
        } else {
            // For normal, close from bottom
            path += ` L1200,${waveHeight} L0,${waveHeight} Z`;
        }
        
        wavePath.setAttribute('d', path);
    });
}

function animateWaves() {
    // Update phase for each wave layer in each divider
    const wavePaths = document.querySelectorAll('.wave-path');
    
    wavePaths.forEach(wavePath => {
        const dividerConfig = JSON.parse(wavePath.getAttribute('data-config'));
        
        // Update phase for each wave layer
        for (let waveLayer of dividerConfig.waves) {
            waveLayer.phase -= waveLayer.speed;
        }
        
        // Update the stored config
        wavePath.setAttribute('data-config', JSON.stringify(dividerConfig));
    });
    
    generateWavePath();
    requestAnimationFrame(animateWaves);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initWaveDividers();
        generateWavePath();
        animateWaves();
        
        window.addEventListener('resize', () => {
            initWaveDividers();
        });
    });
} else {
    initWaveDividers();
    generateWavePath();
    animateWaves();
    
    window.addEventListener('resize', () => {
        initWaveDividers();
    });
}