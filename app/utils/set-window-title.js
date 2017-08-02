const he = requireNode('he');

/**
 * Sets the title on the currently focused Window (or the first found window)
 *
 * @export
 * @param {string} [title='Ghost'] - New title
 */
export default function setWindowTitle(title = 'Ghost') {
    const {remote} = requireNode('electron');
    const {BrowserWindow} = remote;
    const currentWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    const decodedTitle = he.decode(title);

    // We should always have only one Window
    if (currentWindow) {
        currentWindow.setTitle(decodedTitle);
    }
}
