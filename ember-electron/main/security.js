const { app } = require('electron');
const { URL } = require('url');

/**
 * Attempts to secure the app by disallowing things we do
 * not need.
 */
function secureApp(mainWindow) {
  app.on('web-contents-created', (_event, webContents) => {
    // Disallow new-window
    webContents.on('new-window', (event, url) => {
      console.warn(`Prevented new-window for ${url}`);
      event.preventDefault();
    });
  });

  // Disallow navigation
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);

    const isFile = parsedUrl.protocol === 'file';

    if (!isFile) {
      console.warn(`Prevented navigation to ${url}`);
      console.log(`Hostname: ${parsedUrl.hostname}`);
      event.preventDefault();
    }
  });
}

module.exports = {
  secureApp
}
