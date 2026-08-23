import * as dayjs from 'dayjs';
import { setCookie } from '@amec/webasset/jsCookie';
import { encryptText } from '@amec/webasset/crypto';
import { showLoader } from '@amec/webasset/preloader';
import { showErrorMessage } from '@amec/webasset/utils';
import { createCarousel } from '@amec/webasset/api/gpreport';
import { directlogin } from '@amec/webasset/api/auth';
import { stampApp } from '../utils';
import {
    createLinks,
    setRecentApps,
    setAmecwebLinks,
    formCounter,
} from './data';

$(document).ready(async function (e) {
    showLoader();
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
        await rendorFormCount();
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
            location: $(this).attr('href'),
            updateDate: new Date().toISOString(),
        };
        await stampApp(curent);
        await setRecentApps();
        await setCookie(
            curent.location,
            encryptText(`${curent.id}-${curent.user}`, curent.location),
        );
        if (curent.type != '2') await directlogin(curent.user, curent.id);
        if (curent.target === '_blank') {
            window.open(curent.url);
        } else {
            window.location.href = curent.url;
        }
    } catch (error) {
        console.log(error);
        showErrorMessage(error);
        return;
    } finally {
        await showLoader({ show: false });
    }
});

async function rendorFormCount() {
    const data = await formCounter($('#user-login').attr('empno'));
    $('#stat-wait').text(data.WAITFORAPPROVE || 0);
    $('#stat-prepare').text(data.DRAFT || 0);
    $('#stat-mine').text(data.MINE || 0);
    $('#stat-comming').text(data.COMMING || 0);

    const today = dayjs().format('MMM D, YYYY');
    $('#statdate-wait').text(
        data.WAITFORAPPROVE_DATE
            ? `${dayjs(data.WAITFORAPPROVE_DATE).format('MMM D, YYYY')} - ${today}`
            : ``,
    );
    $('#statdate-prepare').text(
        data.DRAFT_DATE
            ? `${dayjs(data.DRAFT_DATE).format('MMM D, YYYY')} - ${today}`
            : ``,
    );
    $('#statdate-mine').text(
        data.MINE_DATE
            ? `${dayjs(data.MINE_DATE).format('MMM D, YYYY')} - ${today}`
            : ``,
    );
    $('#statdate-comming').text(
        data.COMMING_DATE
            ? `${dayjs(data.COMMING_DATE).format('MMM D, YYYY')} - ${today}`
            : ``,
    );
}
