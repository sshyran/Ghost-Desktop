'use strict';

/**
 * Simple timeout function checking for
 * a) failed login
 * b) successful loaded
 */
function checkStatus() {
    const err = document.querySelector('p.main-error');
    const errChildren = err.childElementCount && err.childElementCount > 0;
    const errText = err.textContent && err.textContent.length > 0;
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
        setTimeout(() => console.log('loaded'), 200);
    } else if (errors) {
        // Noooo, login errors!
        console.log('login-error');
    } else {
        setTimeout(checkStatus, 100);
    }
}

/**
 * Automatically login.
 *
 * @param {string} username
 * @param {string} password
 */
function login(username = '', password = '', i = 0) {
    $ = $ || document.querySelectorAll;

    const usernameField = $('input[name="identification"]');
    const passwordField = $('input[name="password"]');
    const loginButton = $('button.login');
    const results = usernameField.length  && passwordField.length  && loginButton.length;

    if (results) {
        usernameField.val(username);
        usernameField.change();
        passwordField.val(password);
        passwordField.change();
        loginButton.click();

        setTimeout(checkStatus, 100);
    } else {
        if (i < 15) {
            console.log('Login: Could not find fields, trying again in 150ms.');
            setTimeout(() => login(username, password, i + 1), 150);
        } else {
            console.warn('Login: Could not find correct fields, giving up');
        }
    }
}

/**
 * Init
 */
window.desktop.login = login;
setTimeout(() => init(), 100);
