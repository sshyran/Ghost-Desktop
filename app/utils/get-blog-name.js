/**
 * Get's the blog name for a given blog url
 * @param  {string} url - Url for the blog
 * @return {Promise<string>}
 */
export default function getBlogName(url) {
    if (!url) {
        return Promise.reject('Tried to getBlogName without providing url');
    }

    if (url.slice(-7) === '/ghost/') {
        url = `${url.slice(0, url.length - 7)}/`;
    }

    return fetch(url)
        .then((response) => response.text())
        .then((response) => {
            const he = requireNode('he');
            const titleResult = response.match('<title>(.*)</title>');
            const title = (titleResult && titleResult.length > 1) ? titleResult[1] : url;

            return he.decode(title);
        });
}
