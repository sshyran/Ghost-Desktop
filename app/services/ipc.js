import {Evented} from '@ember/object'
import Service from '@ember/service';

export default Service.extend(Evented, {
    init() {
        this.ipcRenderer = requireNode('electron').ipcRenderer;

        // Setup all the handlers

        // Create a new draft
        this.ipcRenderer.on('create-draft', (sender, ...args) => {
            this.restoreWindow();
            this.trigger('create-draft', ...args);
        });

        // Open the blog
        this.ipcRenderer.on('open-blog', (sender, ...args) => {
            this.restoreWindow();
            this.trigger('open-blog', ...args);
        });

        // Toggle night shift mode
        this.ipcRenderer.on('night-shift', (sender, ...args) => {
            this.restoreWindow();
            this.trigger('night-shift', ...args);
        });
    },

    /**
     * Notifies the main thread that we're ready to receive
     * instructions
     */
    notifyReady() {
        this.ipcRenderer.send('main-window-ready', true);
    },

    /**
     * If the window is somehow borked or hidden, we'll get it back
     */
    restoreWindow() {
        this.window = this.window || requireNode('electron').remote.getCurrentWindow();

        if (this.window && !this.window.isVisible()) {
            this.window.show();
        }

        if (this.window && this.window.isMinimized()) {
            this.window.restore();
        }
    }
});
