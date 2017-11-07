const {ipcMain, BrowserWindow} = require('electron');
const {state} = require('./state-manager');
const {reloadMainWindow} = require('./app');
const debug = require('debug')('ghost-desktop:main:ipc');

ipcMain.on('blog-data', (event, data) => {
    state.blogs = state.blogs || [];

    if (state.blogs.length === 0) {
        state.blogs.push(data);
    } else {
        const foundBlogIndex = state.blogs.findIndex((item) => (item.id === data.id));

        if (foundBlogIndex > -1) {
            state.blogs[foundBlogIndex] = data;
        } else {
            state.blogs.push(data);
        }
    }

    debug(`Blog ${data.id} (${data.url}) updated. Blogs known to main thread: ${state.blogs.length}`);
});

ipcMain.on('main-window-ready', (event, data) => {
    state['main-window-ready'] = true;

    debug(`Main window ready: ${data}`);
});

ipcMain.on('shutdown-requested', (event) => {
    if (event.sender) {
        const win = BrowserWindow.fromWebContents(event.sender);

        debug(`Shutdown requested`);

        setTimeout(() => {
            if (win && !win.isDestroyed()) win.destroy();
        }, 1000);
    }
});

ipcMain.on('soft-restart-requested', () => {
    debug('Soft restart requested, closing main window and creating a new one');

    reloadMainWindow();
});

ipcMain.on('console-message', (sender, args) => {
    if (args[0] && args[0].includes && args[0].includes('%c')) {
        console.log(`  ${args[0].replace(/%c/g, '')}`);
    } else {
        console.log(...args);
    }
});
