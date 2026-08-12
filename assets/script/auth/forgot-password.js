import { createCarousel } from '@amec/webasset/api/gpreport';
import { splashScreen } from './login-utils';

$(document).ready(async function () {
    await splashScreen();
    await createCarousel('login');
});
