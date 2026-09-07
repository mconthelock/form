import '@flaticon/flaticon-uicons/css/all/all.css';
import { initAuthen } from '@amec/webasset/authen';

$(document).ready(async function () {
    try {
        await initAuthen({
            icon: `${process.env.APP_IMG}/brand_text_w.svg`,
            iconLogo: `${process.env.APP_IMG}/logo_w.png`,
            programName: 'Web Flow',
            showIcon: false,
            showProgramName: false,
            showLogo: true,
            sidebarClass: `size-xl text-gray-300 bg-primary`,
        });
    } catch (error) {
        console.log(error);
    }
    await new Promise((r) => setTimeout(r, 1000));
    return;
});

$(document).on('click', '.mainmenu', function () {
    const m = $('.mainmenu').length;
    $('.mainmenu').map((i, el) => {
        $(el).find('details').removeAttr('open');
    });
});

$(document).on('click', '#mastermenu-close', function () {
    $('#mastermenu').prop('checked', false);
});
