import { setAmecweb } from '@amec/webasset/indexDB';
import { setCookie } from '@amec/webasset/jsCookie';
import { encryptText } from '@amec/webasset/crypto';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { createCarousel } from '@amec/webasset/api/gpreport';
import { initApp, stampApp } from '../utils';
import { createLinks, setRecentApps, setAmecwebLinks } from './data';

$(document).ready(async function (e) {
    showLoader();
    const app = await initApp({ submenu: '.document' });
    if (!app) return;
    try {
        const news = await createCarousel();
        const links = await $.getJSON(
            `${process.env.APP_ENV}/assets/files/links.json`,
        );
        await createLinks(1, links, $('#amecweb_system'));
        await createLinks(2, links, $('#design_system'));
        await createLinks(3, links, $('#utility_system'));
        await createLinks(4, links, $('#other_system'));
        await setRecentApps();
        await setAmecwebLinks();
        // await waitforapprove({ empno: "02035" });
    } catch (error) {
        console.log(error);
        showErrorMessage();
        return;
    } finally {
        await showLoader({ show: false });
    }
});

$(document).on('click', '.links-stamp', async function (e) {
    e.preventDefault();
    try {
        await showLoader();
        const curent = {
            id: $(this).attr('data-id'),
            user: $('#user-login').attr('empno'),
            url: $(this).attr('href'),
            target: $(this).attr('target'),
            color: $(this).attr('data-color') || '#000000',
            label: $(this).attr('data-label') || '',
            name: $(this).attr('data-name') || '👍',
            type: $(this).attr('data-type') || '2',
            location: $(this).attr('data-location'),
            updateDate: new Date().toISOString(),
        };
        await stampApp(curent);
        await setRecentApps();
        console.log(curent);

        setCookie(
            curent.location,
            encryptText(`${curent.id}-${curent.user}`, curent.location),
        );
        window.location.href = curent.url;
    } catch (error) {
        console.log(error);
        showErrorMessage();
        return;
    } finally {
        await showLoader({ show: false });
    }
});
