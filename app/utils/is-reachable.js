export function isReachable(url) {
    return new Promise((resolve) => {
        const request = requireNode('request')

        request({
            url: url,
            method: 'HEAD'
        }, (err, res) => {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}
