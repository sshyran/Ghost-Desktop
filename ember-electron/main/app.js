// Before we do anything else, handle Squirrel Events
if (require('electron-squirrel-startup')) return;

const { app, BrowserWindow } = require('electron');
const { ensureSingleInstance } = require('./single-instance');
const { fetchWindowState } = require('./window-state');
const { parseArguments } = require('./parse-arguments');
const { state } = require('./state-manager');
const { secureApp } = require('./security');

const log = require('electron-log');

const emberAppLocation = `file://${__dirname}/../../ember/index.html`;

// Logger configuration
log.transports.console.level = process.env.GHOST_DESKTOP_LOG_LEVEL || 'info';
log.transports.file.level = process.env.GHOST_DESKTOP_LOG_LEVEL || 'info';
log.transports.file.appName = 'ghost';

let mainWindow = null;

function setupListeners(window) {
    secureApp(window);

    // If a loading operation goes wrong, we'll send Electron back to
    // Ember App entry point
    window.webContents.on('did-fail-load', () => window.loadURL(emberAppLocation));
    window.webContents.on('did-finish-load', () => window.show());

    // Chromium drag and drop events tend to navigate the app away, making the
    // app impossible to use without restarting. These events should be prevented.
    window.webContents.on('will-navigate', (event) => event.preventDefault());

    // Emitted when the window is closed.
    window.on('closed', () => {
        window.removeAllListeners();
        window = null;
    });

    // Once the last window is closed, we'll exit
    app.on('window-all-closed', () => {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    // Close stuff a bit harder than usual
    app.on('before-quit', () => {
        if (window && !window.isDestroyed() && window.isVisible()) {
            window.removeAllListeners();
            window.close();

            setTimeout(() => app.exit(), 2000);
        }
    });
}

function createMainWindow() {
    const titleBarStyle = (process.platform === 'darwin') ? 'hidden' : 'default';
    const frame = !(process.platform === 'win32');
    const defaultOptions = { show: true, titleBarStyle, frame };
    let windowState, usableState, windowStateKeeper, window;

    // Instantiate the window with the existing size and position.
    try {
        windowState = fetchWindowState();
        usableState = windowState.usableState;
        windowStateKeeper = windowState.stateKeeper;

        window = new BrowserWindow(Object.assign({}, defaultOptions, usableState));
    } catch (error) {
        // Window state keeper failed, let's still open a window
        log.error(`Window state keeper failed: ${error}`);
        window = new BrowserWindow(defaultOptions);
    }

    setupListeners(window);
    window.loadURL(emberAppLocation);

    delete window.module;

    // Letting the state keeper listen to window resizing and window moving
    // event, and save them accordingly.
    windowStateKeeper.manage(window);

    return window;
}

function reloadMainWindow() {
    let oldMainWindow;

    if (mainWindow) {
        oldMainWindow = mainWindow;
        oldMainWindow.hide();
        oldMainWindow.removeAllListeners();
    }

    mainWindow = createMainWindow();

    if (oldMainWindow) {
        // Burn, burn, buuuuurn
        oldMainWindow.destroy();
    }
}

app.on('ready', function onReady() {
    ensureSingleInstance();
    parseArguments();

    mainWindow = createMainWindow();

    // Greetings
    if (process.platform === 'win32') {
        log.info(`\n Welcome to Ghost ${app.getVersion()} \n`);
    } else {
        log.info(`\n ⚡️  Welcome to Ghost ${app.getVersion()}  👻\n`);
    }

    log.info(`Logging to: ${log.transports.file.file}`);

    // If you want to open up dev tools programmatically, call
    // mainWindow.openDevTools();

    state.mainWindowId = mainWindow.id;

    require('./ipc');
    require('./basic-auth');
});

module.exports = { mainWindow, reloadMainWindow };
