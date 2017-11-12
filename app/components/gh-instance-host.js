import {computed, observer} from '@ember/object';
import {inject} from '@ember/service';
import {run} from '@ember/runloop';
import Component from '@ember/component';

import ENV from 'ghost-desktop/config/environment';
import {injectCss} from '../utils/inject-css';
import Phrases from '../utils/phrases';
import {escapeString} from '../utils/escape-string';

const path = requireNode('path');
const debug = requireNode('debug')('ghost-desktop:instance-host');

/**
 * The instance host component contains a webview, displaying a Ghost blog
 * inside an isolated container without Node integration.
 */
export default Component.extend({
    classNames: ['instance-host'],
    classNameBindings: ['blog.isSelected:selected'],
    preferences: inject.service(),
    preload: `file://${path.join(__dirname, '../ember-electron/main/preload.js')}`,
    debugName: computed('blog', function () {
        const blog = this.get('blog');
        const name = blog ? blog.get('name') : null || '(unknown blog)';

        return `WebView ${name}`;
    }),

    /**
     * Observes the 'isResetRequested' property, resetting the instance if
     * it is set to true. This is our way of being able to refresh the blog
     * if properties changed that are not part of the cleartext model (like
     * the password, for instance)
     */
    blogObserver: observer('blog.isResetRequested', function() {
        const blog = this.get('blog');

        if (blog && blog.get('isResetRequested')) {
            blog.set('isResetRequested', false);
            blog.save();

            if (this.get('isAttemptedSignin')) {
                this.reload();
            }
        }
    }),

    didReceiveAttrs() {
        this._super(...arguments);
        this.set('isInstanceLoaded', false);
    },

    didRender() {
        this._super(...arguments);

        // Once the webview is created, we immediatly attach handlers
        // to handle the successful load of the content - and a
        // "new window" request coming from the instance
        this.$('webview')
            .off('did-start-loading')
            .on('did-start-loading', () => this._handleStartLoading())
            .off('did-finish-load')
            .on('did-finish-load', () => this._handleLoaded())
            .off('did-fail-load')
            .on('did-fail-load', (e, c, s) => this._handleLoadFailure(e, c, s))
            .off('did-get-redirect-request')
            .on('did-get-redirect-request', (e, n) => this._handleWillNavigate(n))
            .off('will-navigate')
            .on('will-navigate', (e, o, n) => this._handleRedirect(o, n))
            .off('new-window')
            .on('new-window', (e) => this._handleNewWindow(e))
            .off('console-message')
            .on('console-message', (e) => this._handleConsole(e));
    },

    didInsertElement() {
        this.get('preferences').on('selectedDictionaryChanged', () => this._setupSpellchecker());

        if (this.get('blog.isResetRequested')) {
            this.set('blog.isResetRequested', false);
        }
    },

    /**
     * Makes the instance visible, overlaying the loading cat in the process
     */
    show() {
        // Fun fact: Chrome's loading apis will consider the website loaded as
        // soon as all assets are loaded. The app however still has to boot up.
        // To make things "feel" more snappy, we're hiding the loading from the
        // user.
        if (window.QUnit) {
            return run(() => this.set('isInstanceLoaded', true));
        }

        run.later(() => this.set('isInstanceLoaded', true), 1500);

    },

    /**
     * A crude attempt at trying things again.
     */
    reload() {
        this.set('isInstanceLoaded', false);
        this.set('isAttemptedSignin', false);
        this.didRender();

        run.later(() => this.signin());
    },

    /**
     * Programmatically attempt to login
     */
    async signin($webview = this._getWebView()) {
        const username = this.get('blog.identification');
        const password = await this.get('blog').getPassword();

        debug(`${this.get('debugName')} trying to sign in.`);

        // If we can't find username or password, bail out and let the
        // user deal with whatever happened
        //
        // TODO: Ask the user for credentials and add them back to the OS
        // keystore
        if (!username || !password || !$webview) {
            debug(`${this.get('debugName')} tried to sign in, but no username or password found.`);
            return this.show();
        }

        const escapedUsername = escapeString(username);
        const escapedPassword = escapeString(password);
        const commands = [
            `if (GhostDesktop && GhostDesktop.login) {`,
            `GhostDesktop.login('${escapedUsername}', '${escapedPassword}');`,
            `}`
        ];

        // Execute the commands. Once done, the load handler will
        // be called again, and the instance set to loaded.
        $webview.executeJavaScript(commands.join(''));
        this.set('isAttemptedSignin', true);
    },

    /**
     * Injects CSS files into the webview, one for each OS
     *
     * CSS files can be found in /public/assets/inject/css/*
     */
    _insertCss($webview = this._getWebView()) {
        if ($webview) {
            // Inject a CSS file for the specific platform (OS X; Windows)
            injectCss($webview, process.platform);
            // Inject a CSS file for all platforms (all.css)
            injectCss($webview, 'all');
        }
    },

    /**
     * Handles will-navigate (mostly by just logging it)
     *
     * @param {string} newUrl
     */
    _handleWillNavigate(newUrl = '') {
        debug(`${this.get('debugName')} will navigate: ${newUrl}`);
    },

    /**
     * Handles redirection (mostly by just logging it)
     *
     * @param {string} oldUrl
     * @param {string} newUrl
     */
    _handleRedirect(oldUrl = '', newUrl = '') {
        debug(`${this.get('debugName')} was redirected: ${oldUrl}, ${newUrl}`);
    },

    /**
     * The webview started loading, meaning that it moved on from being a simple
     * HTMLElement to bloom into a beautiful webview (with all the methods we need)
     */
    _handleStartLoading() {
        debug(`${this.get('debugName')} did-start-loading`);
        const $webview = this._getWebView();

        this._insertCss();
        this._updateName();
        this._setupSpellchecker($webview);
        this._setupWindowFocusListeners($webview);
    },

    /**
     * Handle's the 'did-finish-load' event on the webview hosting the Ghost blog
     */
    _handleLoaded() {
        debug(`${this.get('debugName')} did-finish-loading`);
        const $webview = this._getWebView();
        const isAttemptedSignin = this.get('isAttemptedSignin');
        let title = '';

        try {
            title = $webview.getTitle();
        } catch (e) {
            debug(`${this.get('debugName')} Error while trying to to get web view title:`);
            console.warn(e);
        }

        // Check if we're on the sign in page, and if so, attempt to
        // login automatically (without bothering the user)
        if ((title.includes('Sign In') || title === 'Ghost Admin') && !isAttemptedSignin) {
            this.signin();
        } else {
            debug(`${this.get('debugName')} Not trying to sign in.`, {title, isAttemptedSignin});
            this.show();
        }
    },

    /**
     * Handles "new window" requests from the Ghost blog, piping them
     * through to the operating system's default browser
     * @param  {Object} e - jQuery Event
     */
    _handleNewWindow(e) {
        if (e && e.originalEvent && e.originalEvent.url) {
            requireNode('electron').shell.openExternal(e.originalEvent.url);
        }
    },

    /**
     * Handles failures while trying to load the Ghost Instance. Most common
     * cause: no internet. Information about error codes and descriptions
     * can be found in the Chrome source:
     * https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
     *
     * @param e {Object} - event
     * @param errorCode {number}
     * @param errorDescription {string}
     */
    _handleLoadFailure(e, errorCode, errorDescription = '') {
        debug(`${this.get('debugName')} encountered load error: ${errorCode}`);

        const $webview = this._getWebView();
        const path = requireNode('path');
        let errorPage = path.join(__dirname, '..', 'main', 'load-error', 'error.html');
        const validatedURL = e.originalEvent.validatedURL || '';

        // Don't try this at home
        if (validatedURL.includes('file://')) {
            return;
        }

        if (ENV.environment === 'test') {
            errorPage = path.join(process.cwd(), 'main', 'load-error', 'error.html');
        }

        if ($webview) {
            $webview.loadURL(`file://${errorPage}?error=${errorDescription}`);
            this.show();
        }

        debug(`Ghost Instance failed to load. Error Code: ${errorCode}`, errorDescription);
        // TODO: Handle notification click
        /* eslint-disable no-unused-vars */
        if (this.get('preferences.isNotificationsEnabled')) {
            const errorNotify = new Notification('Ghost Desktop', {
                body: Phrases.noInternet
            });
        }
        /* eslint-enable no-unused-vars */
    },

    /**
     * Handles console messages logged in the webview
     * @param e {Object} - jQuery Event
     */
    _handleConsole(e) {
        if (e && e.originalEvent && e.originalEvent.message.includes('login-error')) {
            /* eslint-disable no-unused-vars */
            if (this.get('preferences.isNotificationsEnabled')) {
                const errorNotify = new Notification(Phrases.loginFailed);
            }
            /* eslint-enable no-unused-vars */

            return this.sendAction('showEditBlog', this.get('blog'), Phrases.loginFailed);
        }

        if (e.originalEvent.message.includes('loaded')) {
            this.show();
        }
    },

    /**
     * Updates the current blog's name
     */
    _updateName() {
        if (this.get('blog')) {
            this.get('blog').updateName();
        }
    },

    /**
     * Sends the current spellchecker language to the webview
     */
    _setupSpellchecker($webview = this._getWebView()) {
        $webview.send('spellchecker', this.get('preferences.spellcheckLanguage'));
    },

    /**
     * Ensures that Alt-Tab on Ghost Desktop windows doesn't mean that the user
     * looses focus in the Ghost Admin editor
     */
    _setupWindowFocusListeners($webview = this._getWebView()) {
        window.addEventListener('blur', () => $webview.blur());
        window.addEventListener('focus', () => $webview.focus());
    },

    /**
     * Looks for all webviews on the page, returning the first one
     * @returns
     */
    _getWebView() {
        const $webviews = this.$('webview');
        const $webview = ($webviews && $webviews[0]) ? $webviews[0] : undefined;

        if (!$webview) {
            debug('Could not find webview containing Ghost blog.');
        }

        return $webview;
    }
});
