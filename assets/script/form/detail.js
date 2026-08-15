import { showLoader } from '@amec/webasset/preloader';
import { showMessage } from '@amec/webasset/utils';
import { initApp, tableOption } from '../utils';
$(document).ready(async function () {
    showLoader();
    const app = await initApp({ submenu: '.document' });
    if (!app) return;

    try {
    } catch (error) {
        console.log(error);
        await showMessage(error.responseJSON?.message || 'Error fetching data');
    } finally {
        await showLoader({ show: false });
    }
});
