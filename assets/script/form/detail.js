import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { initApp, tableOption } from '../utils';
import { setPerformance } from './data';
$(document).ready(async function () {
    try {
        await initApp();
        const iframe = document.getElementById('my-iframe');
        const loadingIndicator = document.getElementById('loading-indicator');
        const startTime = performance.now();
        let loadStabilizeTimer;
        let hidden = false;
        const STABILIZE_DELAY = 0;
        const MAX_WAIT = 15000;

        // ปรับความสูง iframe ให้เท่ากับ/มากกว่าเนื้อหาภายใน เพื่อไม่ให้เกิด scrollbar (ใช้ได้เฉพาะ same-origin)
        const resizeIframeToContent = () => {
            try {
                const doc =
                    iframe.contentDocument || iframe.contentWindow?.document;
                if (!doc) return;
                const body = doc.body;
                const html = doc.documentElement;
                const height = Math.max(
                    body?.scrollHeight || 0,
                    body?.offsetHeight || 0,
                    html?.clientHeight || 0,
                    html?.scrollHeight || 0,
                    html?.offsetHeight || 0,
                );

                if (height > 0) {
                    iframe.style.height = `${height}px`;
                    $('#frame-container').css('height', `${height}px`);
                }
            } catch (error) {
                console.warn(
                    'ไม่สามารถปรับความสูง iframe ได้ (อาจเป็น cross-origin)',
                    error,
                );
            }
        };

        const hideLoading = async () => {
            if (hidden) return;
            hidden = true;

            const endTime = performance.now();
            const actualLoadTimeMs = endTime - startTime - STABILIZE_DELAY;
            console.log(
                `⏱️ พร้อมใช้งาน! ใช้เวลาโหลดจริง: ${(actualLoadTimeMs / 1000).toFixed(2)} วินาที`,
            );
            await setPerformance({
                loadTime: actualLoadTimeMs,
                user: `${$('#user-login').attr('name')} ${$('#user-login').attr('empno')}`,
                url: iframe.src,
            });

            loadingIndicator.classList.remove('opacity-100');
            loadingIndicator.classList.add('opacity-0');
            loadingIndicator.classList.add('pointer-events-none');
            iframe.classList.remove('opacity-0');
            iframe.classList.add('opacity-100');
        };

        iframe.addEventListener('load', function () {
            console.log('iframe load event fired', iframe.src);
            resizeIframeToContent();

            try {
                const doc =
                    iframe.contentDocument || iframe.contentWindow?.document;
                if (doc?.body && 'ResizeObserver' in window) {
                    new ResizeObserver(resizeIframeToContent).observe(doc.body);
                }
            } catch (error) {
                console.warn(
                    'ไม่สามารถ observe การเปลี่ยนแปลงขนาดเนื้อหา iframe ได้',
                    error,
                );
            }

            clearTimeout(loadStabilizeTimer);
            loadStabilizeTimer = setTimeout(hideLoading, STABILIZE_DELAY);
        });

        setTimeout(hideLoading, MAX_WAIT);
    } catch (error) {
        console.error(error);
        await showMessage(error.responseJSON?.message || 'Error fetching data');
    } finally {
        console.log('Finally block executed');
    }
});
