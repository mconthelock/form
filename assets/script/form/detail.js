import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { initApp, tableOption } from '../utils';
$(document).ready(async function () {
    try {
        const iframe = document.getElementById('my-iframe');
        const loadingIndicator = document.getElementById('loading-indicator');
        const startTime = performance.now();
        let loadStabilizeTimer;
        let hidden = false;
        const STABILIZE_DELAY = 1500;
        const MAX_WAIT = 15000; // กันเคส iframe ไม่ยิง load event เลย ไม่ให้ loading ค้างตลอดไป

        const hideLoading = () => {
            if (hidden) return;
            hidden = true;

            const endTime = performance.now();
            const actualLoadTimeMs = endTime - startTime - STABILIZE_DELAY;
            console.log(
                `⏱️ พร้อมใช้งาน! ใช้เวลาโหลดจริง: ${(actualLoadTimeMs / 1000).toFixed(2)} วินาที`,
            );

            // 1. เฟด Loading ออก (เปลี่ยน opacity เป็น 0)
            loadingIndicator.classList.remove('opacity-100');
            loadingIndicator.classList.add('opacity-0');

            // ปิดการรับคลิกที่ Loading เพื่อให้ User ทะลุไปคลิก Iframe ด้านล่างได้
            loadingIndicator.classList.add('pointer-events-none');

            // 2. เฟด Iframe เข้ามา (เปลี่ยน opacity เป็น 100)
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
