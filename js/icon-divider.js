(() => {
    const styleId = 'icon-divider-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .icon-divider { position: relative; width: 100%; overflow-x: clip; display: block; }
            .icon-divider__track {
                display: flex;
                opacity: 0.66;
                width: max-content;
                align-items: center;
                animation: icon-divider-scroll-left var(--icon-divider-duration, 40s) linear infinite;
                will-change: transform;
            }
            .icon-divider--right .icon-divider__track { animation-name: icon-divider-scroll-right; }
            .icon-divider__set {
                display: flex;
                align-items: center;
                gap: var(--icon-divider-gap, 32px);
                padding-right: var(--icon-divider-gap, 32px);
            }
            .icon-divider__item {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                font-size: var(--icon-divider-size, 24px);
                color: var(--color-accent);
                font-size: 2rem;
                line-height: 1;
                flex: 0 0 auto;
            }
            .icon-divider__item.is-hopping i { animation: icon-divider-scroll__item-hop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }

            @keyframes icon-divider-scroll-left { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            @keyframes icon-divider-scroll-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }

            @keyframes icon-divider-scroll__item-hop {
                0% { transform: translateY(0) scale(1) rotate(0deg); }
                15% { transform: translateY(5%) scale(1.15, 0.85) rotate(-4deg); }
                60% { transform: translateY(-45%) scale(0.9, 1.15) rotate(8deg); }
                85% { transform: translateY(10%) scale(1.05, 0.95) rotate(-2deg); }
                100% { transform: translateY(0) scale(1) rotate(0deg); }
            }
        `;
        document.head.appendChild(style);
    }

    const icons = {
        "paintbrush": "fa-solid fa-paintbrush",
        "palette": "fa-solid fa-palette",
        "pencil": "fa-solid fa-pencil",
        "splotch": "fa-solid fa-splotch",
    };

    const iconList = Object.values(icons);

    const attachHopHandlers = item => {
        const icon = item.querySelector('i');
        if (!icon) return;

        item.addEventListener('mouseenter', () => {
            if (item.classList.contains('is-hopping')) return;
            item.classList.add('is-hopping');
        });

        icon.addEventListener('animationend', () => {
            item.classList.remove('is-hopping');
        });
    };

    const buildIconSet = repeats => {
        const set = document.createElement('div');
        set.className = 'icon-divider__set';

        for (let r = 0; r < repeats; r += 1) {
            for (const iconClass of iconList) {
                const item = document.createElement('span');
                item.className = 'icon-divider__item';
                item.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
                attachHopHandlers(item);
                set.appendChild(item);
            }
        }

        return set;
    };

    const parseMove = value => {
        if (!value) {
            return { duration: '180s', direction: 'left' };
        }

        const trimmed = value.trim();
        const isNegative = trimmed.startsWith('-');
        const raw = trimmed.replace(/^[-+]/, '');
        const direction = isNegative ? 'right' : 'left';

        if (raw.endsWith('ms') || raw.endsWith('s')) {
            return { duration: raw, direction };
        }

        const parsed = parseFloat(raw);
        if (Number.isFinite(parsed)) {
            return { duration: `${parsed}s`, direction };
        }

        return { duration: '180s', direction: 'left' };
    };

    const initIconDividers = () => {
        document.querySelectorAll('.icon-divider').forEach(divider => {
            divider.textContent = '';

            const move = parseMove(divider.getAttribute('data-move'));
            const flipped = divider.getAttribute('data-flipped') === 'true';
            const direction = flipped ? (move.direction === 'left' ? 'right' : 'left') : move.direction;

            divider.classList.toggle('icon-divider--right', direction === 'right');
            divider.style.setProperty('--icon-divider-duration', move.duration);

            const track = document.createElement('div');
            track.className = 'icon-divider__track';
            divider.appendChild(track);

            const tempSet = buildIconSet(1);
            track.appendChild(tempSet);

            const containerWidth = divider.getBoundingClientRect().width || 0;
            const setWidth = tempSet.getBoundingClientRect().width || 1;
            const repeats = Math.max(1, Math.ceil(containerWidth / setWidth) + 1);

            track.textContent = '';
            track.appendChild(buildIconSet(repeats));
            track.appendChild(buildIconSet(repeats));
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initIconDividers();
            window.addEventListener('resize', initIconDividers);
        });
    } else {
        initIconDividers();
        window.addEventListener('resize', initIconDividers);
    }
})();