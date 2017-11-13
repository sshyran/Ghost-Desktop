import { computed } from '@ember/object';
import Evented from '@ember/object/evented';
import Service from '@ember/service';

import ENV from 'ghost-desktop/config/environment';
import { isReachable } from '../utils/is-reachable';

const log = requireNode('electron-log');

export default Service.extend(Evented, {
    autoUpdater: null,
    isCheckingForUpdate: null,
    isUpdateAvailable: null,
    isUpdateDownloaded: null,
    isLatestVersion: null,
    isLinux: process.platform === 'linux',

    isSupportedEnvironment: computed({
        get() {
            if (this.get('isLinux') || process.mas) {
                log.info(`Updater: Not supported, because Linux or MAS`);
                return false;
            }

            if (this.get('environment') !== 'production') {
                log.info(`Updater: Not supported, because environment not production`);
                return false;
            }

            return true;
        }
    }),

    /**
     * Returns the current environment (testing, development, production)
     */
    environment: computed({
        get() {
            return ENV.environment;
        }
    }),

    /**
     * Returns the current Ghost Desktop version, by querying the version
     * defined in package.json. If that fails, it'll check the version of
     * the current executable.
     */
    appVersion: computed({
        get() {
            const { remote } = requireNode('electron');
            const appVersion = remote.app.getVersion();

            log.info(`Updater: Running version ${appVersion}`);

            return appVersion;
        }
    }),

    /**
     * Returns the Update Feed URL for the current platform.
     */
    updateFeedUrl: computed({
        get() {
            const os = requireNode('os').platform();
            let updateFeed = (os === 'darwin')
                ? `http://desktop-updates.ghost.org/update/osx/${this.get('appVersion')}`
                : `http://desktop-updates.ghost.org/update/win32/${this.get('appVersion')}`;

            // Developer override?
            if (process.env.GHOST_UPDATER_URL) {
                updateFeed = process.env.GHOST_UPDATER_URL;
            }

            log.info(`Updater: Using ${updateFeed}`);

            return updateFeed;
        }
    }),

    /**
     * Checks Ghost Desktop's update server for updates.
     */
    checkForUpdates(force = false) {
        log.info(`Updater: Checking for update${force ? ' (forced)' : ''}`);

        this.isOnline(force).then((reachable) => {
            // Bail out if we're not able to reach the update server.
            if (!reachable) {
                log.info(`Updater: Update url not reachable, bailing.`);
                return;
            }

            // Makes sure the environment we're in is supported.
            if (!this.get('isSupportedEnvironment')) {
                log.info(`Updater: Environment not supported, bailing`);
                return;
            }

            // We're already in a update check state.
            if (this.get('isCheckingForUpdate')) {
                log.info(`Updater: Already checking for an update, bailing`);
                return;
            }

            // Let's disable further checks now
            if (force) {
                this.set('isCheckingForUpdate', true);
            }

            if (!this.get('autoUpdater')) {
                this._setup();
            }

            if (this.get('autoUpdater')) {
                log.info(`Updater: Executing check using Electron's autoupdater`);
                this.get('autoUpdater').checkForUpdates();
            }
        });
    },

    /**
     * Checks to see if we're online and able to reach the update server.
     */
    isOnline(force = false) {
        // Ignore this check if we're forcing an update check
        if (force) {
            return Promise.resolve(true);
        }

        return isReachable(this.get('updateFeedUrl'));
    },

    /**
     * Updates the app, if an update is available
     */
    update() {
        const autoUpdater = this.get('autoUpdater');

        if (autoUpdater && this.get('isUpdateDownloaded')) {
            autoUpdater.quitAndInstall();
        }
    },

    /**
     * Creates the autoUpdater, using Electorn's built-in auto-update module.
     */
    _setup() {
        const { remote } = requireNode('electron');
        const { autoUpdater } = remote;

        // If we're not running signed code, requiring auto updater will fail
        if (this.get('environment') !== 'production') {
            return;
        }

        const feedUrl = this.get('updateFeedUrl');
        log.info(`Updater: Feed url: ${feedUrl}`);

        autoUpdater.removeAllListeners();
        autoUpdater.setFeedURL(feedUrl);

        autoUpdater.on('checking-for-update', () => {
            log.info(`Updater: Electron emitted "checking-for-update"`);
            this.set('isCheckingForUpdate', true);
            this.trigger('checking-for-update');
        });

        autoUpdater.on('update-available', () => {
            log.info(`Updater: Electron emitted "update-available'"`);
            this.set('isCheckingForUpdate', false);
            this.set('isUpdateAvailable', true);
            this.trigger('update-available');
        });

        autoUpdater.on('update-downloaded', () => {
            log.info(`Updater: Electron emitted "update-downloaded'`);
            this.set('isCheckingForUpdate', false);
            this.set('isUpdateAvailable', true);
            this.set('isUpdateDownloaded', true);
            this.trigger('update-downloaded');
        });

        autoUpdater.on('update-not-available', () => {
            log.info(`Updater: Electron emitted "update-not-available"`);
            this.set('isCheckingForUpdate', false);
            this.set('isUpdateAvailable', false);
            this.set('isLatestVersion', true);
            this.trigger('update-not-available');
        });

        autoUpdater.on('error', (...args) => {
            log.info(`Updater: Electron emitted "error"`);
            log.info(JSON.stringify(args));
            this.set('isCheckingForUpdate', false);
            this.set('isUpdateAvailable', null);
            this.set('isLatestVersion', null);
            this.trigger('error');
        });

        this.set('autoUpdater', autoUpdater);
    }
});
