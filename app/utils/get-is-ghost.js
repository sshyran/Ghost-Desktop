import Ember from 'ember';

const { $ } = Ember;
const log = requireNode('electron-log');

/**
 * Ensures that a given url is actually a Ghost signin page
 * @param  {string} url - Url for the blog
 * @return {Promise}
 */
export default function getIsGhost(url, auth) {
    return new Promise((resolve, reject) => {
        if (!url) {
            return reject('Tried to getIsGhost without providing url');
        }

        log.info(`Checking if ${url} is Ghost`);
        const options = { url };

        if (auth && (auth.basicUsername || auth.basicPassword)) {
            options.username = auth.basicUsername;
            options.password = auth.basicPassword;
        }

        $.ajax(options)
            .then((response) => {
                const hasAppName = response.includes('name="application-name" content="Ghost"');
                const hasTitle = response.includes(`<title>Ghost Admin</title>`);
                const hasConfig = response.includes(`ghost-admin/config/environment`);

                log.info(`Check if ${url} is Ghost:`);
                log.info(`"application-name" test: ${hasAppName}`);
                log.info(`"title" test: ${hasTitle}`);
                log.info(`"config" test: ${hasConfig}`);
                resolve(!!(hasAppName || hasTitle || hasConfig));
            })
            .fail((error) => reject(error));
    });
}
