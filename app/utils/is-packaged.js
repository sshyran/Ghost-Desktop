const path = requireNode('path');

/**
 * Is the app packaged?
 *
 * @export
 * @returns {boolean}
 */
export function isPackaged() {
    const execFile = path.basename(process.execPath).toLowerCase();

    if (process.platform === 'win32') {
        return execFile !== 'electron.exe';
    }

    return execFile !== 'electron';
}
