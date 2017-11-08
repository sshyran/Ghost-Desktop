import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
    showLetter: true,
    iconStyle: '',

    iconColor: computed('blog', 'showLetter', {
        get() {
            const blog = this.get('blog');
            const showLetter = this.get('showLetter');

            if (showLetter) {
                return '#fff';
            }

            return blog.get('iconColor');
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
            this.set('showLetter', false);
            this.set('iconStyle', `background-image: url(${icon.src}`);
        };
    },

    actions: {
        switchToBlog(...args) {
            this.sendAction('switchToBlog', ...args);
        }
    }
});
