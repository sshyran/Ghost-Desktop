import Ember from 'ember';
import {storageFor} from 'ember-local-storage';

const {Service, Evented, computed} = Ember;
const debug = require('debug')('ghost-desktop:preferences');

export default Service.extend(Evented, {
    preferences: storageFor('preferences'),

    isQuickSwitcherMinimized: computed.alias('preferences.isQuickSwitcherMinimized'),
    isNotificationsEnabled: computed.alias('preferences.isNotificationsEnabled'),
    contributors: computed.alias('preferences.contributors'),
    spellcheckLanguage: computed.alias('preferences.spellcheckLanguage'),

    zoomFactor: computed({
        get() {
            return this.get('preferences.zoomFactor');
        },
        set(k, v) {
            const frame = require('electron').webFrame;
            const setting = (v >= 50 && v <= 300) ? v : 100;

            frame.setZoomFactor(setting / 100);
            this.set('preferences.zoomFactor', setting);
        }
    }),

    init() {
        this.setupContributors();
    },

    setupContributors() {
        try {
            const contributors = require('../ember-electron/main/contributors.json');
            if (contributors) {
                this.set('preferences.contributors', contributors);
            }
        } catch (error) {
            if (!window.QUnit) {
                debug('Failed catching contributors');
            }
        }
    },

    setupZoom() {
        this.set('zoomFactor', this.get('zoomFactor'));
    }
});
