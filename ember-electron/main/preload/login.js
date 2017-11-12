'use strict';

/**
 * Simple timeout function checking for
 * a) failed login
 * b) successful loaded
 */
function checkStatus(i = 0) {
    const $ = window.$ || document.querySelectorAll;
    const err = document.querySelector('p.main-error');
    const errChildren = err && err.childElementCount && err.childElementCount > 0;
    const errText = err && err.textContent && err.textContent.length > 0;
    const errors = err && (errChildren || errText);

    const loadChecks = [
        // No longer active in Ghost 1.0, but found in old versions
        () => !!document.querySelector('a[title="New Post"]'),
        // Link to main editor
        () => !!document.querySelector('a.gh-nav-main-editor'),
        // Alternative check
        () => !!($("a:contains('New story')").length)
    ];

    // Try the load checks first
    const loaded = loadChecks.find((check) => check());

    if (loaded) {
        // Yay, successfully loaded - let's give the renderer 200 more ms
        // for rendering
        window.GHOST_LOADED = true;
        console.log(`We're positively loaded`);
        setTimeout(() => console.log('loaded'), 200);
    } else if (errors) {
        // Noooo, login errors!
        console.log('login-error');
    } else {
        if (i > 150) return;

        console.log(`Not loaded, trying again in 100ms`);
        setTimeout(() => checkStatus(i + 1), 150);
    }
}

/**
 * Automatically login.
 *
 * @param {string} username
 * @param {string} password
 */
function login(username = '', password = '', i = 0) {
    if (window.GHOST_LOADED) return;

    const $ = window.$ || document.querySelectorAll;
    const usernameField = $('input[name="identification"]');
    const passwordField = $('input[name="password"]');
    const loginButton = $('button.login');
    const results = usernameField.length  && passwordField.length  && loginButton.length;

    if (i === 0) checkStatus();

    if (results) {
        usernameField.val(username);
        usernameField.change();
        passwordField.val(password);
        passwordField.change();
        loginButton.click();
    } else {
        // We'll try for 5s
        if (i < 20) {
            console.log('Login: Could not find fields, trying again in 250ms.');
            setTimeout(() => login(username, password, i + 1), 250);
        } else {
            console.warn('Login: Could not find correct fields, giving up (or loaded!)');
            setTimeout(() => console.log('loaded'), 200);
        }
    }
}

/**
 * Init
 */
window.GhostDesktop.login = login;
