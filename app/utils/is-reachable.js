const log = requireNode('electron-log');
const request = requireNode('request');

export function isReachable(url) {
    return new Promise((resolve) => {
        log.info(`Trying to reach ${url}`);

        request({ url, method: 'HEAD' }, (err) => {
            if (err) {
                log.info(`Tried to reach ${url}, but failed`);
                log.info(JSON.stringify(err, null, 2));
                resolve(false);
            } else {
                log.info(`Reached ${url}`);
                resolve(true);
            }
        });
    });
}
