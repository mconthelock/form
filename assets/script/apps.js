import '@flaticon/flaticon-uicons/css/all/all.css';
import { initApp } from './utils';

export const appReady = (window.appReady = initApp().catch((error) => {
    console.error(error);
    return false;
}));

$(document).on('click', '.mainmenu', function () {
    const m = $('.mainmenu').length;
    $('.mainmenu').map((i, el) => {
        $(el).find('details').removeAttr('open');
    });
});

$(document).on('click', '#mastermenu-close', function () {
    $('#mastermenu').prop('checked', false);
});

// Smooth Navigation UX: Top progress bar + sidebar collapse state sync
const startNavProgress = () => {
    const bar = document.getElementById('nav-progress-bar');
    if (!bar) return;
    bar.classList.remove('is-done');
    bar.classList.add('is-loading');
};

const resetNavProgress = () => {
    const bar = document.getElementById('nav-progress-bar');
    if (!bar) return;
    bar.classList.remove('is-loading', 'is-done');
};

window.addEventListener('pageshow', resetNavProgress);

$(document).on('click', 'a[href]', function (e) {
    if (
        e.isDefaultPrevented() ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.which === 2
    ) {
        return;
    }
    const href = $(this).attr('href');
    const target = $(this).attr('target');
    if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        (target && target !== '_self') ||
        $(this).is('[download]')
    ) {
        return;
    }
    try {
        const dest = new URL(href, window.location.href);
        if (
            dest.origin === window.location.origin &&
            dest.href !== window.location.href
        ) {
            startNavProgress();
        }
    } catch {
        // Ignore malformed URLs
    }
});

$(document).on('click', '#sidebarToggle', function () {
    setTimeout(() => {
        const isCollapsed = localStorage.getItem('pin') === 'false';
        document.documentElement.classList.toggle(
            'sidebar-collapsed',
            isCollapsed,
        );
    }, 0);
});
