const waveConfig = {
    segments: 500,   // divisions across the width, higher = smoother curve

    color: 'var(--color-yellow)',
    flipped: false,  // flip the wave upside down

    tilt: 0,         // positive lifts right / negative lifts left
    curve: 18,       // positive bows toward the bottom, negative toward the top
    offset: 0,       // moves the whole wave up/down

    scroll: {
        enabled: true,
        reanchor: false, // recompute the vertical anchor as you scroll, instead of using the base values
        towards: {
            tilt: 0,
            curve: -20,
            offset: 12
        }
    },

    // wavelength: px per full ripple (bigger = broader, gentler ripple)
    // period: seconds per full cycle (bigger = slower motion)
    waves: [
        {
            amplitude: -8.8,
            wavelength: 1786,
            period: 63.6,
            phase: -3.557003657045668
        },
        {
            amplitude: -13.4,
            wavelength: 345,
            period: 12,
            phase: -38.27714918337676
        },
        {
            amplitude: -1.1,
            wavelength: 245,
            period: 6.8,
            phase: -67.54791032359734
        },
        {
            amplitude: 0,
            wavelength: 19,
            period: 27,
            phase: -17.012066303722314
        },
        {
            amplitude: 0,
            wavelength: 52,
            period: 4.1,
            phase: -112.0306805367092
        }
    ]
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const TWO_PI = Math.PI * 2;
const SVG_NS = 'http://www.w3.org/2000/svg';

const ATTR_HANDLERS = {
    'data-segments': (c, v) => c.segments = parseInt(v, 10),
    'data-tilt': (c, v) => c.tilt = parseFloat(v),
    'data-curve': (c, v) => c.curve = parseFloat(v),
    'data-offset': (c, v) => c.offset = parseFloat(v),
    'data-scroll': (c, v) => c.scroll.enabled = v !== 'false',
    'data-scroll-reanchor': (c, v) => c.scroll.reanchor = v !== 'false',
    'data-scroll-towards-tilt': (c, v) => c.scroll.towards.tilt = parseFloat(v),
    'data-scroll-towards-curve': (c, v) => c.scroll.towards.curve = parseFloat(v),
    'data-scroll-towards-offset': (c, v) => c.scroll.towards.offset = parseFloat(v),
    'data-flipped': (c, v) => c.flipped = v !== 'false',
    'data-color': (c, v) => c.color = v
};

if (!document.getElementById('wave-divider-styles')) {
    const style = document.createElement('style');
    style.id = 'wave-divider-styles';
    style.textContent = `
        .wave-divider {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            width: 100%;
            display: block;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        }

        .wave-divider svg {
            display: block;
        }
    `;
    document.head.appendChild(style);
}

function getDividerConfig(element) {
    const config = structuredClone(waveConfig);

    for (const [attr, apply] of Object.entries(ATTR_HANDLERS)) {
        if (element.hasAttribute(attr)) {
            apply(config, element.getAttribute(attr));
        }
    }

    config.segments = Number.isFinite(config.segments)
        ? clamp(config.segments, 2, 2000)
        : waveConfig.segments;

    for (const key of ['tilt', 'curve', 'offset']) {
        if (!Number.isFinite(config[key])) {
            config[key] = waveConfig[key];
        }

        if (!Number.isFinite(config.scroll.towards[key])) {
            config.scroll.towards[key] = config[key];
        }
    }

    config.waves = config.waves.map(wave => ({
        ...wave,
        phase: wave.phase ?? 0,
        angularFrequency: TWO_PI / wave.wavelength,
        angularSpeed: TWO_PI / (wave.period * 1000)
    }));

    return config;
}

const dividerState = new WeakMap();

function initWaveDividers() {
    document.querySelectorAll('.wave-divider').forEach(container => {
        container.querySelector('svg')?.remove();

        const config = getDividerConfig(container);
        const svg = document.createElementNS(SVG_NS, 'svg');
        const path = document.createElementNS(SVG_NS, 'path');

        path.setAttribute('class', 'wave-path');
        path.setAttribute('fill', config.color);

        svg.appendChild(path);
        container.appendChild(svg);

        dividerState.set(container, { config, path, svg });
    });
}

function getScrollProgress(container) {
    const rect = container.getBoundingClientRect();
    return clamp(-rect.top / Math.max(1, rect.height), 0, 1);
}

const interpolate = (start, end, progress) =>
    start + (end - start) * progress;

function getAnimatedValues(config, scrollProgress) {
    const base = {
        tilt: config.tilt,
        curve: config.curve,
        offset: config.offset
    };

    if (!config.scroll?.enabled) {
        return base;
    }

    const { towards } = config.scroll;

    return {
        tilt: interpolate(base.tilt, towards.tilt, scrollProgress),
        curve: interpolate(base.curve, towards.curve, scrollProgress),
        offset: interpolate(base.offset, towards.offset, scrollProgress)
    };
}

function getWavePoints(config, values, width, height) {
    const unit = height / 100;
    const tilt = values.tilt * unit;
    const curve = values.curve * unit;

    const leftY = Math.min(tilt, 0);
    const rightY = -Math.max(tilt, 0);
    const points = [];

    for (let i = 0; i <= config.segments; i++) {
        const t = i / config.segments;
        const x = t * width;

        let y = leftY + (rightY - leftY) * t;
        y += curve * Math.sin(Math.PI * t);

        for (const wave of config.waves) {
            y += Math.sin(
                x * wave.angularFrequency + wave.phase
            ) * wave.amplitude;
        }

        points.push({ x, y });
    }

    return points;
}

function getWaveTranslation(config, values, width, height) {
    const unit = height / 100;
    const anchor = config.scroll?.reanchor ? values : config;

    const anchorTilt = anchor.tilt * unit;
    const anchorCurve = anchor.curve * unit;
    const anchorOffset = anchor.offset * unit;

    const anchorLeftY = Math.min(anchorTilt, 0);
    const anchorRightY = -Math.max(anchorTilt, 0);
    const highestBaseline = Math.max(anchorLeftY, anchorRightY);
    const waveRange = config.waves.reduce(
        (total, wave) => total + Math.abs(wave.amplitude),
        0
    );
    const curveDown = Math.max(0, anchorCurve);

    return (
        height -
        (highestBaseline + waveRange + curveDown) -
        anchorOffset
    );
}

function orientWavePoints(points, height, flipped) {
    if (!flipped) {
        return points;
    }

    return points.map(({ x, y }) => ({
        x,
        y: height - y
    }));
}

function buildWavePath(points, width, height, flipped) {
    const d = points.reduce(
        (str, point, index) =>
            str + `${index === 0 ? 'M' : ' L'}${point.x},${point.y}`,
        ''
    );

    return d + (
        flipped
            ? ` L${width},0 L0,0 Z`
            : ` L${width},${height} L0,${height} Z`
    );
}

function generateWavePath() {
    document.querySelectorAll('.wave-divider').forEach(container => {
        const state = dividerState.get(container);
        if (!state) return;

        const { config, path, svg } = state;
        const width = Math.max(1, container.clientWidth);
        const height = Math.max(1, container.clientHeight);

        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const scrollProgress = config.scroll?.enabled
            ? getScrollProgress(container)
            : 0;

        container.style.setProperty(
            '--wave-scroll-progress',
            scrollProgress.toFixed(3)
        );

        const animated = getAnimatedValues(config, scrollProgress);
        const points = getWavePoints(config, animated, width, height);
        const translation = getWaveTranslation(
            config,
            animated,
            width,
            height
        );

        for (const point of points) {
            point.y += translation;
        }

        const orientedPoints = orientWavePoints(
            points,
            height,
            config.flipped
        );

        for (const point of orientedPoints) {
            point.y = clamp(point.y, 0, height);
        }

        path.setAttribute(
            'd',
            buildWavePath(
                orientedPoints,
                width,
                height,
                config.flipped
            )
        );
    });
}

let lastTimestamp = null;

function animateWaves(timestamp) {
    const deltaMs = lastTimestamp == null
        ? 16.67
        : timestamp - lastTimestamp;

    lastTimestamp = timestamp;

    document.querySelectorAll('.wave-divider').forEach(container => {
        const state = dividerState.get(container);
        if (!state) return;

        for (const wave of state.config.waves) {
            wave.phase -= wave.angularSpeed * deltaMs;
        }
    });

    generateWavePath();
    requestAnimationFrame(animateWaves);
}

function start() {
    initWaveDividers();
    generateWavePath();
    requestAnimationFrame(animateWaves);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
} else {
    start();
}