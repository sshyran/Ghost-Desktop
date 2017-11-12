import Route from '@ember/routing/route';
import {inject} from '@ember/service';

import {setup as setupContextMenu} from '../utils/context-menu';

export default Route.extend({
    windowMenu: inject(),
    preferences: inject(),

    beforeModel() {
        this.get('preferences').setupZoom();
        this.get('windowMenu').setup();
        this.setupTeardown();
        setupContextMenu();
    },

    setupTeardown() {
        const browserWindow = requireNode('electron').remote.getCurrentWindow();

        window.onbeforeunload = function () {
            browserWindow.removeAllListeners();
        };
    },

    model() {
        return this.store.findAll('blog');
    },

    /**
     * Whenever we load all blogs, we also inform the main thread about the
     * blogs we're dealing with.
     *
     * @param {any} blogs
     */
    afterModel(blogs) {
        if (blogs) {
            const {ipcRenderer} = requireNode('electron');

            blogs.forEach((blog) => {
                const serializedData = blog.toJSON({includeId: true});
                ipcRenderer.send('blog-data', serializedData);
            });
        }
    }
});
