import StorageObject from 'ember-local-storage/local/object';

const Storage = StorageObject.extend();

Storage.reopenClass({
    initialState() {
        return {
            isNotificationsEnabled: true,
            spellcheckLanguage: 'en',
            isQuickSwitcherMinimized: false,
            isVibrancyEnabled: process.platform === 'darwin'
        };
    }
});

export default Storage;