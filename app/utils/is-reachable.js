export function isReachable(url) {
    return new Promise((resolve) => {
        const request = requireNode('request');

        request({url, method: 'HEAD'}, (err) => {
            if (err) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}
