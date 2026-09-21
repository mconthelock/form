import { createCarousel } from '@amec/webasset/api/gpreport';
import { splashScreen } from './login-utils';
import { showErrorMessage } from '@amec/webasset/utils';
import { displayEmpImage, displayEmpInfo } from '@amec/webasset/indexDB';

$(document).ready(async function () {
    try {
        // await splashScreen();
        await createCarousel('login');
    } catch (error) {
        console.error('Error creating carousel:', error);
        showErrorMessage(
            'An error occurred while loading the carousel. Please try again later.',
        );
    }
});

$(document).on('submit', '#passwordForgot', async function (e) {
    e.preventDefault();
    try {
        const user = await displayEmpInfo('99998');
        if (user == null) {
            showErrorMessage('Something went wrong.');
            return;
        }
    } catch (error) {
        console.error('Error processing password reset:', error);
        showErrorMessage(
            'An error occurred while processing your request. Please try again later.',
        );
    }
});
