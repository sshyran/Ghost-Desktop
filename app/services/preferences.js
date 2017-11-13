import { computed } from '@ember/object';
import { debounce } from '@ember/runloop';
import { storageFor } from 'ember-local-storage';
import Evented from '@ember/object/evented';
import Service from '@ember/service';

import { getIsYosemiteOrHigher } from '../utils/versions';

const { remote } = requireNode('electron');
const fs = requireNode('fs-extra');
const log = requireNode('electron-log');
const path = requireNode('path');

export default Service.extend(Evented, {
    preferences: storageFor('preferences'),

    isQuickSwitcherMinimized: computed.alias('preferences.isQuickSwitcherMinimized'),
    isNotificationsEnabled: computed.alias('preferences.isNotificationsEnabled'),
    contributors: computed.alias('preferences.contributors'),
    spellcheckLanguage: computed.alias('preferences.spellcheckLanguage'),

    isVibrancyEnabled: computed({
        get() {
            if (!getIsYosemiteOrHigher()) return false;
            return !!this.get('preferences.isVibrancyEnabled');
        },
        set(k, v) {
            const value = !!v;
            this.set('preferences.isVibrancyEnabled', value);

            const currentWindow = remote.getCurrentWindow();
            if (value) {
                currentWindow.setVibrancy('dark');
            } else {
                currentWindow.setVibrancy(null);
            }

            return value;
        }
    }),

    zoomFactor: computed({
        get() {
            return this.get('preferences.zoomFactor');
        },
        set(k, v) {
            const frame = requireNode('electron').webFrame;
            const setting = (v >= 50 && v <= 300) ? v : 100;

            frame.setZoomFactor(setting / 100);
            this.set('preferences.zoomFactor', setting);
            return setting;
        }
    }),

    getContent() {
        const { content } = this.get('preferences');
        const {
            isNotificationsEnabled,
            isQuickSwitcherMinimized,
            isVibrancyEnabled,
            spellcheckLanguage,
            zoomFactor
        } = content;

        // We'll need to reconstruct the data here so that
        // we don't include any private rifaf
        return {
            isNotificationsEnabled,
            isQuickSwitcherMinimized,
            isVibrancyEnabled,
            spellcheckLanguage,
            zoomFactor
        };
    },

    async saveToDisk() {
        try {
            const userData = remote.app.getPath('userData');
            const configPath = path.join(userData, 'ghost.json');

            log.info(`Saving configuration to ${configPath}`);
            await fs.writeJson(configPath, this.getContent());
        } catch (error) {
            log.info(`Failed to write configuration to disk`, error);
        }
    },

    init() {
        this.setupContributors();
    },

    setupContributors() {
        try {
            const contributors = requireNode('../ember-electron/main/contributors.json');
            if (contributors) {
                this.set('preferences.contributors', contributors);
            }
        } catch (error) {
            if (!window.QUnit) {
                log.info('Failed catching contributors');
            }
        }
    },

    setupZoom() {
        this.set('zoomFactor', this.get('zoomFactor'));
    },

    set(...args) {
        this._super(...args);
        debounce(this, 'saveToDisk', 500);
    }
});
