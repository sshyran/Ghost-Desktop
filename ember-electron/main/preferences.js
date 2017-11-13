const {app} = require('electron');
const fs = require('fs-extra');
const log = require('electron-log');
const path = require('path');

/**
 * From the window, we'll save preferences to disk (to a file called ghost.json).
 * The data isn't guarunteed to be accurate, but it's a solid source when the
 * main process needs to know about user config.
 *
 * @returns {Object} preferences
 */
function getPreferences() {
    const userData = app.getPath('userData');
    const configPath = path.join(userData, 'ghost.json');

    if (fs.existsSync(configPath)) {
        try {
            const data = fs.readJSONSync(configPath);

            log.verbose(`Read configuration data`, data);
            return data;
        } catch (error) {
            log.error(`Failed to read configuration data, assuming default`, error);
        }
    }

    // This is supposed to the be the same as in
    // ../../app/storages/preferences.js
    return {
        isNotificationsEnabled: true,
        spellcheckLanguage: 'en',
        isQuickSwitcherMinimized: false,
        isVibrancyEnabled: false
    };
}

module.exports = {getPreferences};
