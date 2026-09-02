const waveSettings = {
    segments: 500,
    curve: 18,
    targetCurve: -20,
    targetOffset: 12,
    waves: [
        { amplitude: -8.8, wavelength: 1786, period: 63.6, phase: -3.557003657045668 },
        { amplitude: -13.4, wavelength: 347, period: 12, phase: -38.27714918337676 },
        { amplitude: -1.1, wavelength: 241, period: 6.8, phase: -67.54791032359734 },
        { amplitude: 1.5, wavelength: 93, period: -2, phase: -17.012066303722314 }
    ].map(wave => ({
        ...wave,
        frequency: Math.PI * 2 / wave.wavelength,
        speed: Math.PI * 2 / (wave.period * 1000)
    }))
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const interpolate = (start, end, progress) => start + (end - start) * progress;
const svgNamespace = 'http://www.w3.org/2000/svg';

const dividers = Array.from(document.querySelectorAll('.wave-divider'), container => {
    const svg = document.createElementNS(svgNamespace, 'svg');
    const path = document.createElementNS(svgNamespace, 'path');
    path.setAttribute('fill', 'var(--color-yellow)');
    svg.appendChild(path);
    container.replaceChildren(svg);
    return { container, svg, path };
});

const drawWave = ({ container, svg, path }) => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const scale = clamp(width / 1440, 0.55, 1.2);
    const progress = clamp(-container.getBoundingClientRect().top / height, 0, 1);
    const curve = interpolate(waveSettings.curve, waveSettings.targetCurve, progress) * height / 100 * scale;
    const offset = interpolate(0, waveSettings.targetOffset, progress) * height / 100;
    const waveRange = waveSettings.waves.reduce(
        (total, wave) => total + Math.abs(wave.amplitude * scale),
        0
    );
    const baseline = height - waveRange - waveSettings.curve * height / 100 * scale - offset;
    let data = '';

    for (let index = 0; index <= waveSettings.segments; index += 1) {
        const position = index / waveSettings.segments;
        const x = position * width;
        let y = baseline + curve * Math.sin(Math.PI * position);

        waveSettings.waves.forEach(wave => {
            y += Math.sin(x * wave.frequency / scale + wave.phase) * wave.amplitude * scale;
        });

        data += `${index ? ' L' : 'M'}${x},${clamp(y, 0, height)}`;
    }

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    path.setAttribute('d', `${data} L${width},${height} L0,${height} Z`);
};

const drawWaves = () => dividers.forEach(drawWave);
const reduceWaveMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let animationFrame;
let previousTime;

const animateWaves = time => {
    const elapsed = previousTime == null ? 16.67 : time - previousTime;
    previousTime = time;
    waveSettings.waves.forEach(wave => {
        wave.phase -= wave.speed * elapsed;
    });
    drawWaves();
    animationFrame = requestAnimationFrame(animateWaves);
};

const updateWaveMotion = () => {
    cancelAnimationFrame(animationFrame);
    previousTime = undefined;
    drawWaves();
    if (!reduceWaveMotion.matches) {
        animationFrame = requestAnimationFrame(animateWaves);
    }
};

new ResizeObserver(drawWaves).observe(document.documentElement);
reduceWaveMotion.addEventListener('change', updateWaveMotion);
updateWaveMotion();
