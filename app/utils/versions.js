/**
 * Checks if the running system is macOS Yosemite or higher?
 *
 * @returns {boolean} Is the running system macOS Yosemite or higher?
 */
export function getIsYosemiteOrHigher() {
    const os = requireNode('os');

    const isDarwin = os.platform() === 'darwin';

    if (!isDarwin) {
        return false;
    }

    const release = os.release();
    if (release && release.length >= 6) {
        const major = release.slice(0, 2);

        return parseInt(major) >= 14;
    } else {
        return false;
    }
}