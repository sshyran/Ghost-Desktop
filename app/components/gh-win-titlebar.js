import { inject } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
    classNameBindings: [ ':win-titlebar' ],
    title: 'Ghost',
    windowMenu: inject('window-menu'),
    isMaximized: requireNode('electron').remote.getCurrentWindow().isMaximized(),
    browserWindow: requireNode('electron').remote.getCurrentWindow(),

    didInsertElement() {
        this._super(...arguments);

        this.browserWindow.on('enter-full-screen', () => this.setMaximized(true));
        this.browserWindow.on('maximize', () => this.setMaximized(true));
        this.browserWindow.on('leave-full-screen', () => this.setMaximized(false));
        this.browserWindow.on('unmaximize', () => this.setMaximized(false));
    },

    setMaximized(isMaximized) {
        if (this.isDestroyed || this.isDestroying) return;

        this.set('isMaximized', isMaximized);

        if (isMaximized) {
            document.body.classList.add('maximized');
        } else {
            document.body.classList.remove('maximized');
        }
    },

    actions: {
        maximize() {
            this.browserWindow.maximize();
        },

        minimize() {
            this.browserWindow.minimize();
        },

        unmaximize() {
            this.browserWindow.unmaximize();
        },

        close() {
            this.browserWindow.close();
        },

        mousedown(e) {
            e.preventDefault();
        },

        popupMenu() {
            this.get('windowMenu').popup();
        }
    }
});
