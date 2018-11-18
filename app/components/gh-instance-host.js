import { computed, observer } from '@ember/object';
import { inject } from '@ember/service';
import { later } from '@ember/runloop';
import Component from '@ember/component';

import ENV from 'ghost-desktop/config/environment';
import { injectCss } from '../utils/inject-css';
import Phrases from '../utils/phrases';
import { escapeString } from '../utils/escape-string';

const path = requireNode('path');
const log = requireNode('electron-log');

/**
 * The instance host component contains a webview, displaying a Ghost blog
 * inside an isolated container without Node integration.
 */
export default Component.extend({
    classNames: [ 'instance-host' ],
    classNameBindings: [ 'blog.isSelected:selected' ],
    preferences: inject(),
    preload: `file://${path.join(__dirname, '../ember-electron/main/preload.js')}`,
    debugName: computed('blog', function () {
        const blog = this.get('blog');
        const name = blog ? blog.get('name') : null || '(unknown blog)';

        return `WebView ${name}`;
    }),
    prefix: computed('debugName', function () {
        return `gh-instance-host: ${this.get('debugName')}: `;
    }),

    /**
     * Observes the 'isResetRequested' property, resetting the instance if
     * it is set to true. This is our way of being able to refresh the blog
     * if properties changed that are not part of the cleartext model.
     */
    blogObserver: observer('blog.isResetRequested', function() {
        this.checkForReset();
    }),

    didReceiveAttrs() {
        this._super(...arguments);
        this.set('isInstanceLoaded', false);
    },

    didRender() {
        this._super(...arguments);

        log.info(`${this.get('prefix')}Rendered, now setting up listeners`);

        // Once the webview is created, we immediately attach handlers
        // to handle the successful load of the content - and a
        // "new window" request coming from the instance
        this.$('webview')
            .off('did-start-loading')
            .on('did-start-loading', () => this._handleStartLoading())
            .off('did-finish-load')
            .on('did-finish-load', () => this._handleLoaded())
            .off('did-fail-load')
            .on('did-fail-load', (e) => this._handleLoadFailure(e))
            .off('did-get-redirect-request')
            .on('did-get-redirect-request', (e) => this._handleRedirect(e))
            .off('will-navigate')
            .on('will-navigate', (e) => this._handleWillNavigate(e))
            .off('new-window')
            .on('new-window', (e) => this._handleNewWindow(e))
            .off('console-message')
            .on('console-message', (e) => this._handleConsole(e));
    },

    didInsertElement() {
        this.get('preferences')
            .on('selectedDictionaryChanged', () => this._setupSpellchecker());

        this.checkForReset();
    },

    checkForReset() {
        const blog = this.get('blog');

        if (blog && blog.get('isResetRequested')) {
            log.info(`gh-instance-host: ${blog.get('name')} requested reset`);
            blog.set('isResetRequested', false);
            blog.save();

            this.reload();
        }
    },

    /**
     * Makes the instance visible, overlaying the loading cat in the process
     */
    show() {
        if (this.get('isDestroyed') || this.get('isDestroyed')) {
            return;
        }

        // Fun fact: Chrome's loading apis will consider the website loaded as
        // soon as all assets are loaded. The app however still has to boot up.
        // To make things "feel" more snappy, we're hiding the loading from the
        // user.
        if (window.QUnit) {
            this.set('isInstanceLoaded', true);
        } else {
            later(() => this.set('isInstanceLoaded', true), 1000);
        }
    },

    /**
     * A crude attempt at trying things again.
     */
    reload() {
        log.info(`${this.get('prefix')}Reloading`);

        this.set('isInstanceLoaded', false);
        this.didRender();
    },

    /**
     * Injects CSS files into the webview, one for each OS
     *
     * CSS files can be found in /public/assets/inject/css/*
     */
    _insertCss($webview = this._getWebView()) {
        if ($webview) {
            $webview.addEventListener('dom-ready', () => {
                // Inject a CSS file for the specific platform (OS X; Windows)
                injectCss($webview, process.platform);
                // Inject a CSS file for all platforms (all.css)
                injectCss($webview, 'all');
            }, { once: true });

        }
    },

    /**
     * Handles will-navigate (mostly by just logging it)
     *
     * @param {JQuery.Event} e
     */
    _handleWillNavigate(e) {
        const { newURL, isMainFrame } = (e || {}).originalEvent || {};
        log.info(`${this.get('prefix')}Will navigate: ${newURL}. Main frame: ${isMainFrame}.`);
    },

    /**
     * Handles redirection (mostly by just logging it)
     *
     * @param {JQuery.Event} e
     */
    _handleRedirect(e) {
        const { oldURL, newURL, isMainFrame } = (e || {}).originalEvent || {};
        log.info(`${this.get('prefix')} was redirected: ${oldURL}, ${newURL}. Main frame: ${isMainFrame}.`);
    },

    /**
     * The webview started loading, meaning that it moved on from being a simple
     * HTMLElement to bloom into a beautiful webview (with all the methods we need)
     */
    _handleStartLoading() {
        log.verbose(`${this.get('debugName')} did-start-loading`);
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
        log.info(`${this.get('prefix')} did-finish-loading`);
        const $webview = this._getWebView();
        let title = '';

        try {
            title = $webview.getTitle();
        } catch (e) {
            log.warn(`${this.get('debugName')} Error while trying to to get web view title:`);
        }

        this.show();
    },

    /**
     * Handles "new window" requests from the Ghost blog, piping them
     * through to the operating system's default browser
     * @param {JQuery.Event} e
     */
    _handleNewWindow(e) {
        if (e && e.originalEvent && e.originalEvent.url) {
            log.verbose(`Opening external link ${e.originalEvent.url}`);
            requireNode('electron').shell.openExternal(e.originalEvent.url);
        }
    },

    /**
     * Handles failures while trying to load the Ghost Instance. Most common
     * cause: no internet. Information about error codes and descriptions
     * can be found in the Chrome source:
     * https://code.google.com/p/chromium/codesearch#chromium/src/net/base/net_error_list.h
     *
     * @param {JQuery.Event} e
     */
    _handleLoadFailure(e) {
        const { errorCode, errorDescription, validatedURL, isMainFrame } = (e || {}).originalEvent || {};
        const prefix = `${this.get('prefix')}`;
        log.info(`${prefix} encountered load error for ${validatedURL}: ${errorCode}`);

        // Let's not do this unless it's actually the root
        if (!isMainFrame) {
            return;
        }

        // Don't try this at home
        if (validatedURL.includes('file://')) {
            return;
        }

        const $webview = this._getWebView();
        const path = requireNode('path');
        let errorPage = path.join(__dirname, '../ember-electron/', 'main', 'load-error', 'error.html');

        if (ENV.environment === 'test') {
            errorPage = path.join(process.cwd(), 'main', 'load-error', 'error.html');
        }

        if ($webview) {
            $webview.loadURL(`file://${errorPage}?error=${errorDescription}`);
            this.show();
        }

        log.warn(`Ghost Instance failed to load.`);
        log.warn(`Error Code: ${errorCode}, Description: ${errorDescription}`);
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
        if (e && e.originalEvent && e.originalEvent.message) {
            log.silly(`WebView Console: ${e.originalEvent.message}`);
        }

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
        const language = this.get('preferences.spellcheckLanguage');
        log.verbose(`Setting up spellchecker: ${language}`);
        $webview.send('spellchecker', language);
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
            log.warn('Could not find webview containing Ghost blog.');
        } else {
            log.silly(`Found webview containing Ghost blog: ${$webview.id}`);
        }

        return $webview;
    }
});
