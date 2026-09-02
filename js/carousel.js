document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel__track');
    const previousButton = carousel.querySelector('.carousel__button--previous');
    const nextButton = carousel.querySelector('.carousel__button--next');
    const slides = Array.from(track?.querySelectorAll('.carousel__slide') ?? []);

    if (!track || !previousButton || !nextButton || slides.length < 2) return;

    track.prepend(slides.at(-1).cloneNode(true));
    track.append(slides[0].cloneNode(true));

    const renderedSlides = Array.from(track.children);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const autoplayDelay = Number(carousel.dataset.autoplay) || 6000;
    let index = 1;
    let intervalId;
    let transitioning = false;
    let queuedDirection = 0;

    const setPosition = (animate = true) => {
        track.style.transition = animate ? '' : 'none';
        track.style.transform = `translateX(-${index * 100}%)`;

        renderedSlides.forEach((slide, slideIndex) => {
            const active = slideIndex === index;
            slide.toggleAttribute('inert', !active);
            slide.setAttribute('aria-hidden', String(!active));
        });

        if (!animate) {
            track.getBoundingClientRect();
            track.style.transition = '';
        }
    };

    const move = direction => {
        if (transitioning) {
            queuedDirection = direction;
            return;
        }

        index += direction;
        transitioning = true;
        setPosition();
    };

    const stopAutoplay = () => {
        clearInterval(intervalId);
        intervalId = undefined;
    };

    const startAutoplay = () => {
        const paused = document.hidden
            || reduceMotion.matches
            || carousel.matches(':hover, :focus-within');

        if (!paused && !intervalId) {
            intervalId = setInterval(() => move(1), autoplayDelay);
        }
    };

    const resetAutoplay = () => {
        stopAutoplay();
        startAutoplay();
    };

    previousButton.addEventListener('click', () => {
        resetAutoplay();
        move(-1);
    });

    nextButton.addEventListener('click', () => {
        resetAutoplay();
        move(1);
    });

    track.addEventListener('transitionend', event => {
        if (event.target !== track || event.propertyName !== 'transform') return;

        transitioning = false;
        if (index === 0) {
            index = slides.length;
            setPosition(false);
        } else if (index === slides.length + 1) {
            index = 1;
            setPosition(false);
        }

        if (queuedDirection) {
            const direction = queuedDirection;
            queuedDirection = 0;
            move(direction);
        }
    });

    ['pointerenter', 'focusin'].forEach(eventName => {
        carousel.addEventListener(eventName, stopAutoplay);
    });

    ['pointerleave', 'focusout'].forEach(eventName => {
        carousel.addEventListener(eventName, () => setTimeout(startAutoplay));
    });

    document.addEventListener('visibilitychange', resetAutoplay);
    reduceMotion.addEventListener('change', resetAutoplay);

    setPosition(false);
    startAutoplay();
});
