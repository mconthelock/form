import { showMessage } from '@amec/webasset/utils';
import { initApp } from '../utils';
import { setPerformance } from './data';

const ALLOWED_ORIGINS = [
    window.location.origin,
    'https://webflow.mitsubishielevatorasia.co.th',
    'http://webflow.mitsubishielevatorasia.co.th',
];

const REDIRECT_TARGET_MAP = {
    draft: '0',
    waitapprove: '1',
    comming: '2',
    mine: '3',
    approved: '4',
    represent: '5',
    finish: '6',
};

const MIN_IFRAME_HEIGHT = 500;
const STABILIZE_DELAY = 0;
const MAX_WAIT = 15000;

function isSameOriginUrl(url) {
    try {
        return new URL(url, window.location.origin).origin === window.location.origin;
    } catch {
        return false;
    }
}

function bindPostMessageListener() {
    window.addEventListener('message', (event) => {
        if (!ALLOWED_ORIGINS.includes(event.origin)) return;

        const data = event.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'WEBFLOW_REDIRECT') {
            const targetKey = String(data.target || 'waitapprove').toLowerCase();
            if (
                Object.prototype.hasOwnProperty.call(
                    REDIRECT_TARGET_MAP,
                    targetKey,
                )
            ) {
                window.location.href = `${process.env.APP_ENV}/webform/form/index/${REDIRECT_TARGET_MAP[targetKey]}`;
                return;
            }

            if (data.url) {
                try {
                    const parsed = new URL(data.url, window.location.origin);
                    if (
                        ['http:', 'https:'].includes(parsed.protocol) &&
                        ALLOWED_ORIGINS.includes(parsed.origin)
                    ) {
                        window.location.href = parsed.href;
                    }
                } catch {
                    // Ignore invalid URL
                }
            }
            return;
        }

        if (data.type === 'WEBFLOW_RESIZE' && Number(data.height) > 0) {
            const iframe = document.getElementById('my-iframe');
            const nextHeight = Math.max(Number(data.height), MIN_IFRAME_HEIGHT);
            if (iframe) {
                iframe.style.height = `${nextHeight}px`;
                $('#frame-container').css('height', `${nextHeight}px`);
            }
        }
    });
}

function bindBackButton() {
    $(document).on('click', '#btn-detail-back', function (e) {
        e.preventDefault();
        const fallback =
            $(this).data('fallback') ||
            `${process.env.APP_ENV}/webform/form/create`;

        try {
            if (document.referrer) {
                const refUrl = new URL(document.referrer);
                if (
                    refUrl.origin === window.location.origin &&
                    window.history.length > 1
                ) {
                    window.history.back();
                    return;
                }
            }
        } catch {
            // Fallback to create page
        }

        window.location.href = fallback;
    });
}

bindPostMessageListener();
bindBackButton();

$(document).ready(async function () {
    const iframe = document.getElementById('my-iframe');
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!iframe) return;

    const startTime = performance.now();
    let loadStabilizeTimer;
    let maxWaitTimer;
    let resizeRaf = null;
    let resizeObserver = null;
    let lastAppliedHeight = 0;
    let hidden = false;

    const applyIframeHeight = (height) => {
        const nextHeight = Math.max(Math.ceil(Number(height) || 0), MIN_IFRAME_HEIGHT);
        if (Math.abs(nextHeight - lastAppliedHeight) <= 4) return;
        lastAppliedHeight = nextHeight;
        iframe.style.height = `${nextHeight}px`;
        $('#frame-container').css('height', `${nextHeight}px`);
    };

    // ปรับความสูง iframe ให้พอดีเนื้อหาจริง โดยตัด min-h-screen (100vh) feedback loop
    const resizeIframeToContent = () => {
        try {
            const doc =
                iframe.contentDocument || iframe.contentWindow?.document;
            const body = doc?.body;
            const html = doc?.documentElement;
            if (!body || !html) return;

            html.style.height = 'auto';
            html.style.minHeight = '0';
            body.style.height = 'auto';
            body.style.minHeight = '0';

            let maxBottom = 0;
            for (const child of Array.from(body.children)) {
                const style = doc.defaultView?.getComputedStyle(child);
                if (
                    !style ||
                    style.display === 'none' ||
                    style.position === 'fixed' ||
                    style.position === 'absolute'
                ) {
                    continue;
                }
                const rect = child.getBoundingClientRect();
                const marginBottom = parseFloat(style.marginBottom) || 0;
                const bottom = rect.bottom + marginBottom;
                if (bottom > maxBottom) {
                    maxBottom = bottom;
                }
            }

            const bodyHeight = body.getBoundingClientRect().height || 0;
            const measured = Math.max(maxBottom, bodyHeight);
            if (measured > 0) {
                applyIframeHeight(measured + 24);
            }
        } catch (error) {
            console.warn(
                'ไม่สามารถปรับความสูง iframe ได้ (อาจเป็น cross-origin)',
                error,
            );
        }
    };

    const scheduleResize = () => {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(resizeIframeToContent);
    };

    const hideLoading = () => {
        if (hidden) return;
        hidden = true;
        clearTimeout(maxWaitTimer);
        clearTimeout(loadStabilizeTimer);

        if (loadingIndicator) {
            loadingIndicator.classList.remove('opacity-100');
            loadingIndicator.classList.add('opacity-0', 'pointer-events-none');
        }
        iframe.classList.remove('opacity-0');
        iframe.classList.add('opacity-100');

        const endTime = performance.now();
        const actualLoadTimeMs = Math.max(
            0,
            endTime - startTime - STABILIZE_DELAY,
        );
        console.log(
            `⏱️ พร้อมใช้งาน! ใช้เวลาโหลดจริง: ${(actualLoadTimeMs / 1000).toFixed(2)} วินาที`,
        );

        const userName =
            $('#user-login').attr('empname') ||
            $('#user-login').attr('name') ||
            '';
        const userEmpno = $('#user-login').attr('empno') || '';
        setPerformance({
            loadTime: actualLoadTimeMs,
            user: `${userName} ${userEmpno}`.trim(),
            url: iframe.src,
        }).catch((err) => {
            console.warn('Failed to log form performance', err);
        });
    };

    // ผูก load listener และกำหนด src ก่อน await initApp() เพื่อกัน race condition
    iframe.addEventListener('load', function () {
        console.log('iframe load event fired', iframe.src);

        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }

        if (isSameOriginUrl(iframe.src)) {
            lastAppliedHeight = 0;
            scheduleResize();
            try {
                const doc =
                    iframe.contentDocument || iframe.contentWindow?.document;
                if (doc?.body && 'ResizeObserver' in window) {
                    resizeObserver = new ResizeObserver(scheduleResize);
                    resizeObserver.observe(doc.body);
                }
            } catch {
                // Cross-origin redirect after initial load
            }
        }

        clearTimeout(loadStabilizeTimer);
        loadStabilizeTimer = setTimeout(hideLoading, STABILIZE_DELAY);
    });

    maxWaitTimer = setTimeout(hideLoading, MAX_WAIT);

    const targetSrc = iframe.dataset.src;
    if (targetSrc) {
        iframe.src = targetSrc;
    }

    try {
        await initApp();
    } catch (error) {
        console.error(error);
        await showMessage(error.responseJSON?.message || 'Error fetching data');
    }
});
