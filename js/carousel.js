document.querySelectorAll('.carousel').forEach((carousel) => {
    const track = carousel.querySelector('.carousel__track');
    const previousButton = carousel.querySelector('.carousel__button--previous');
    const nextButton = carousel.querySelector('.carousel__button--next');
    const slides = Array.from(track?.querySelectorAll('.carousel__slide') ?? []);

    if (!track || !previousButton || !nextButton || slides.length < 2) {
        return;
    }

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides.at(-1).cloneNode(true);

    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');

    firstClone.querySelectorAll('a, button').forEach((element) => {
        element.tabIndex = -1;
    });

    lastClone.querySelectorAll('a, button').forEach((element) => {
        element.tabIndex = -1;
    });

    track.prepend(lastClone);
    track.append(firstClone);

    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    );

    const autoplayDelay = Number(carousel.dataset.autoplay) || 6000;

    let index = 1;
    let intervalId;
    let isPaused = false;
    let isTransitioning = false;
    let queuedDirection = 0;

    const setPosition = (animate = true) => {
        track.style.transition = animate ? '' : 'none';
        track.style.transform = `translateX(-${index * 100}%)`;

        if (!animate) {
            // Force the browser to apply the non-animated position
            // before restoring the transition.
            track.getBoundingClientRect();
            track.style.transition = '';
        }
    };

    const move = (direction) => {
        // One transition at a time. Rapid clicks are queued.
        if (isTransitioning) {
            queuedDirection = direction;
            return;
        }

        index += direction;
        isTransitioning = true;
        setPosition();
    };

    const processQueue = () => {
        if (!queuedDirection) {
            return;
        }

        const direction = queuedDirection;
        queuedDirection = 0;
        move(direction);
    };

    const stopAutoplay = () => {
        window.clearInterval(intervalId);
        intervalId = undefined;
    };

    const startAutoplay = () => {
        if (isPaused || reduceMotion.matches || intervalId) {
            return;
        }

        intervalId = window.setInterval(() => move(1), autoplayDelay);
    };

    previousButton.addEventListener('click', () => {
        stopAutoplay();
        move(-1);
        startAutoplay();
    });

    nextButton.addEventListener('click', () => {
        stopAutoplay();
        move(1);
        startAutoplay();
    });

    track.addEventListener('transitionend', (event) => {
        if (event.target !== track || event.propertyName !== 'transform') {
            return;
        }

        isTransitioning = false;

        if (index === 0) {
            index = slides.length;
            setPosition(false);
        } else if (index === slides.length + 1) {
            index = 1;
            setPosition(false);
        }

        processQueue();
    });

    carousel.addEventListener('pointerenter', () => {
        isPaused = true;
        stopAutoplay();
    });

    carousel.addEventListener('pointerleave', () => {
        isPaused = false;
        startAutoplay();
    });

    carousel.addEventListener('focusin', () => {
        isPaused = true;
        stopAutoplay();
    });

    carousel.addEventListener('focusout', () => {
        window.setTimeout(() => {
            if (!carousel.matches(':focus-within')) {
                isPaused = false;
                startAutoplay();
            }
        });
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    reduceMotion.addEventListener('change', () => {
        stopAutoplay();
        startAutoplay();
    });

    setPosition(false);
    startAutoplay();
});
