/**
 * Injects a CSS file into a given webview, using a given css filename.
 *
 * @export
 * @param webview - Webview to inejct into
 * @param name - Filename to use
 */
export function injectCss(webview, name = '') {
    const fs = requireNode('fs');
    const log = requireNode('electron-log');

    const cssPath = `${__dirname}/${window.QUnit ? '..' : '.'}/assets/inject/css/${name}.css`;

    fs.readFile(cssPath, 'utf8', (err, data) => {
        if (err) {
            log.info(err);
        }

        if (data) {
            webview.insertCSS(data);
        }
    });
}
