'use strict';

const {remote} = require('electron');

/**
 * Notifies the parent window about night shift.
 *
 * @param {boolean} [status=false]
 */
function notifyWindowAboutNightShift(status = false) {
    const browserWindow = remote.getCurrentWindow();

    if (browserWindow) {
        console.log(`Notifying browserWindow about night shift: ${status}`);
        browserWindow.webContents.send('night-shift', status);
    }
}

/**
 * Attempts to detect night shift support.
 *
 * @param {number} [i=0]
 */
function observeNightShift(i = 0) {
    const darkStyle = document.querySelector('link#dark-styles');

    if (darkStyle) {
        console.log(`Night shift available, observing.`);

        notifyWindowAboutNightShift(!darkStyle.disabled);

        const observer = new MutationObserver(() => notifyWindowAboutNightShift(!darkStyle.disabled));
        observer.observe(darkStyle, {attributes: true});
    } else if (i < 100) {
        // We'll give the app five seconds to load some night-shift
        // stuff. If it doesn't, we'll assume that there's no support
        setTimeout(() => observeNightShift(i + 1), 250 + (i * 20));
    } else {
        console.log(`Night shift not available, not observing.`);
    }
}

/**
 * Init
 */
document.addEventListener('DOMContentLoaded', () => {
    observeNightShift();
}, false);
