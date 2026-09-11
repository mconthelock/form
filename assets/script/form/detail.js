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
