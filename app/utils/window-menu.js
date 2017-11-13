import Ember from 'ember';
import ENV from 'ghost-desktop/config/environment';

const { $ } = Ember;

/**
 * Functions
 */

/**
 * Reloads the currently focused window
 *
 * @export
 * @param item - The menu item calling
 * @param {Electron.BrowserWindow} focusedWindow - The currently focussed window
 */
export function reload(item, focusedWindow) {
    if (focusedWindow && (process.platform !== 'darwin' || ENV.environment === 'test')) {
        focusedWindow.reload();
    } else {
        const { ipcRenderer } = requireNode('electron');
        ipcRenderer.send('soft-restart-requested', true);
    }
}

/**
 * Attempts to toggle developer tools for the currently visible Ghost instance
 *
 * @export
 * @param item - The menu item calling
 * @param {Electron.BrowserWindow} focusedWindow - The currently focussed window
 */
export function toggleGhostDevTools(item, focusedWindow) {
    if (focusedWindow) {
        const host = $('div.instance-host.selected');
        const webviews = host ? $(host).find('webview') : null;

        if (!webviews || !webviews[0]) {
            return;
        }

        if (webviews[0].isDevToolsOpened()) {
            webviews[0].closeDevTools();
        } else {
            webviews[0].openDevTools();
        }
    }
}

/**
 * Opens the issues on GitHub in the OS default browser
 *
 * @export
 */
export function openReportIssues() {
    requireNode('electron').shell.openExternal('http://github.com/tryghost/ghost-desktop/issues');
}

/**
 * Opens the repository on GitHub in the OS default browser
 *
 * @export
 */
export function openRepository() {
    requireNode('electron').shell.openExternal('http://github.com/tryghost/ghost-desktop');
}

/**
 * Setups the window menu for the application
 *
 * @export
 * @returns {Electron.Menu} - Built Menu
 */
export function setup() {
    const { remote, ipcRenderer } = requireNode('electron');
    const browserWindow = remote.getCurrentWindow();

    const template = [
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    /**
                     * (description)
                     *
                     * @param item (description)
                     * @param focusedWindow (description)
                     */
                    click(item, focusedWindow) {
                        reload(item, focusedWindow);
                    }
                },
                {
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            label: 'Window',
            role: 'window',
            submenu: []
        },
        {
            label: 'Developer',
            submenu: [
                {
                    role: 'toggledevtools'
                },
                {
                    label: 'Toggle Developer Tools (Current Blog)',
                    accelerator: (process.platform === 'darwin') ? 'Alt+Command+Shift+I' : 'Ctrl+Alt+Shift+I',
                    click: toggleGhostDevTools
                },
                {
                    label: 'Open Repository in Browser',
                    click: openRepository
                }
            ]
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: openRepository
                },
                {
                    label: 'Report Issues',
                    click: openReportIssues
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Show logs',
                    click() {
                        ipcRenderer.send('open-log-location');
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        // Mac OS is a special snowflake.
        template.unshift({
            label: 'Ghost',
            submenu: [
                {
                    label: 'About Ghost',
                    role: 'about'
                },
                { type: 'separator' },
                {
                    // The click action gets injected from gh-switcher
                    label: 'Preferences',
                    accelerator: 'CmdOrCtrl+,'
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide', label: 'Hide Ghost' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click() {
                        ipcRenderer.send('shutdown-requested', true);
                        browserWindow.close();
                    }
                }
            ]
        });
    } else if (process.platform === 'linux') {
        template.find((i) => i.label === 'Window').submenu.splice(1, 0, {
            label: 'Maximize',
            click(item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.maximize();
                }
            }
        });

        template.unshift({
            label: 'File',
            submenu: [ {
                // The click action gets injected from gh-switcher.
                label: 'Preferences',
                accelerator: 'CmdOrCtrl+,'
            } ]
        });
    } else if (process.platform === 'win32') {
        template.unshift({
            label: 'File',
            submenu: [ {
                // The click action gets injected from gh-switcher.
                label: 'Preferences',
                accelerator: 'CmdOrCtrl+,'
            } ]
        });
    }

    return template;
}
