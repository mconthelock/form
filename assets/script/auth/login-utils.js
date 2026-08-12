export function splashScreen() {
    const startTime = Date.now();
    const MIN_DISPLAY_TIME = 2000;
    //   console.log("Page content is fully loaded.");
    const timeElapsed = Date.now() - startTime;
    if (timeElapsed >= MIN_DISPLAY_TIME) {
        hideSplashScreen();
    } else {
        const timeToWait = MIN_DISPLAY_TIME - timeElapsed;
        // console.log(`Content loaded fast. Waiting ${timeToWait}ms more.`);
        setTimeout(hideSplashScreen, timeToWait);
    }
}

export function hideSplashScreen() {
    //   console.log("Hiding splash screen.");
    const splashScreen = document.querySelector('.splash-screen');
    if (splashScreen) {
        splashScreen.classList.add('hidden');
    }
    document.body.style.overflow = 'auto';
}
