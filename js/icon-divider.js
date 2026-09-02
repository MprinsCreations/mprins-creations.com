const dividerIcons = [
    'fa-solid fa-paintbrush',
    'fa-solid fa-palette',
    'fa-solid fa-pencil',
    'fa-solid fa-splotch'
];

const buildIconSet = repeats => {
    const set = document.createElement('div');
    set.className = 'icon-divider__set';

    for (let repeat = 0; repeat < repeats; repeat += 1) {
        dividerIcons.forEach(iconClass => {
            const item = document.createElement('span');
            item.className = 'icon-divider__item';
            item.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
            set.appendChild(item);
        });
    }

    return set;
};

const initIconDivider = divider => {
    const track = document.createElement('div');
    const sample = buildIconSet(1);
    track.className = 'icon-divider__track';
    track.appendChild(sample);
    divider.replaceChildren(track);

    const repeats = Math.ceil(divider.clientWidth / sample.scrollWidth) + 1;
    const set = buildIconSet(repeats);
    track.replaceChildren(set, set.cloneNode(true));
    divider.classList.toggle(
        'icon-divider--right',
        divider.dataset.flipped === 'true'
    );
};

document.querySelectorAll('.icon-divider').forEach(divider => {
    initIconDivider(divider);
    new ResizeObserver(() => initIconDivider(divider)).observe(divider);

    divider.addEventListener('pointerover', event => {
        event.target.closest('.icon-divider__item')?.classList.add('is-hopping');
    });

    divider.addEventListener('animationend', event => {
        event.target.closest('.icon-divider__item')?.classList.remove('is-hopping');
    });
});
