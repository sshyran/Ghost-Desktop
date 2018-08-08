import { computed } from '@ember/object';
import { inject } from '@ember/service';
import Component from '@ember/component';

const log = requireNode('electron-log');

export default Component.extend({
    classNames: [ 'gh-preferences' ],
    preferences: inject(),
    autoUpdate: inject(),
    zoomFactor: computed.oneWay('preferences.preferences.zoomFactor'),

    // In Ghost 1.0, an english-only spellchecker was released for the editor
    // component. Desktop has currently no control over that spellchecker.
    // For more info, see https://github.com/TryGhost/Ghost-Desktop/issues/307
    hideSpellcheck: !process.env.GHOST_SHOW_SPELLCHECK_CONFIG,

    actions: {
        /**
         * Open a given url in the user's default browser
         *
         * @param url - url to open
         */
        openExternal(url) {
            if (url) {
                requireNode('electron').shell.openExternal(url);
            }
        },

        /**
         * Delete all settings and restart the app
         */
        deleteData() {
            log.info(`Preferences: User wants to all preferences, confirming.`);
            const { remote } = requireNode('electron');
            const { dialog } = remote;

            dialog.showMessageBox({
                type: 'warning',
                buttons: [ 'Cancel', 'Confirm' ],
                title: 'Delete All Settings?',
                defaultId: 0,
                message: 'Do you really want to delete all preferences? This action cannot be undone.'
            }, (response) => {
                if (response === 1) {
                    log.info(`Preferences: Deletion confirmed, deleting all data.`);
                    window.localStorage.clear();
                    window.location.reload();
                }
            });
        },

        /**
         * Install an update, if available
         */
        installUpdate() {
            log.info(`Preferences: "Install update"`);
            this.get('autoUpdate').update();
        },

        /**
         * Passes the zoom factor over to the preferences service,
         * where it will immediatly be used as the zoom factor for
         * the app
         */
        confirmZoom() {
            this.set('preferences.zoomFactor', this.get('zoomFactor'));
        },

        /**
         * Resets the zoom factor to 1.0
         */
        resetZoom() {
            log.verbose(`Preferences: Resetting zoom to 100`);
            this.set('preferences.zoomFactor', 100);
        },

        /**
         * Forces an update check
         */
        forceUpdateCheck() {
            log.verbose(`Preferences: Forcing update check`);
            this.get('autoUpdate').checkForUpdates(true);
        }
    }
});
