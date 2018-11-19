
export async function isReachable(url) {
    const log = requireNode('electron-log');

    try {
        await fetch(url, { method: 'HEAD' })
        log.info(`Reached ${url}`);

        return true;
    } catch (error) {
        log.info(`Tried to reach ${url}, but failed`);
        log.info(JSON.stringify(error, null, 2));

        return false;
    }
}
