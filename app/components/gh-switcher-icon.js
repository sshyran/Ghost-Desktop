import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';

export default Component.extend({
    showLetter: true,
    iconStyle: htmlSafe(''),

    iconColor: computed('blog', 'showLetter', {
        get() {
            const blog = this.get('blog');
            const showLetter = this.get('showLetter');

            return showLetter
                ? blog.get('iconColor')
                : '#fff';
        }
    }),

    didInsertElement() {
        this._super(...arguments);

        // Download favicon
        const blog = this.get('blog');
        const url = blog.get('url') || '';
        const icon = new Image();

        icon.src = url.replace(/\/ghost\/$/i, '/favicon.ico');
        icon.onload = () => {
            if (this.get('isDestroyed') || this.get('isDestroying')) {
                return;
            }

            this.set('showLetter', false);
            this.set('iconStyle', htmlSafe(`background-image: url(${icon.src}`));
        };
    },

    actions: {
        switchToBlog(...args) {
            this.sendAction('switchToBlog', ...args);
        }
    }
});
