import DS from 'ember-data';
import getIconColor from '../utils/color-picker';
import getBlogName from '../utils/get-blog-name';

const { Model, attr } = DS;
const log = requireNode('electron-log');

export default Model.extend({
    index: attr('number', {
        defaultValue: 0
    }),
    name: attr('string'),
    url: attr('string'),
    isSelected: attr('boolean'),
    iconColor: attr('string', {
        defaultValue: () => getIconColor(null)
    }),
    basicUsername: attr('string'),
    basicPassword: attr('string'),
    isResetRequested: attr('boolean'),

    /**
     * Convenience method, marking the blog as selected (and saving)
     */
    select() {
        if (this.isDestroying || this.isDestroyed || this.get('isDeleted')) {
            return;
        }

        log.verbose(`Blog model: Selected ${this.url}`);
        this.set('isSelected', true);
        this.save();
    },

    /**
     * Convenience method, marking the blog as unselected (and saving)
     */
    unselect() {
        if (this.isDestroying || this.isDestroyed || this.get('isDeleted')) {
            return;
        }

        log.verbose(`Blog model: Unselecting ${this.url}`);
        this.set('isSelected', false);
        this.save();
    },

    /**
     * Convenience method, generates a nice icon color for this blog.
     */
    randomIconColor(excluding = null) {
        const newColor = getIconColor(excluding);

        log.verbose(`Blog model: Creating new color ${this.url}`);

        if (newColor === this.get('iconColor')) {
            return this.randomIconColor(excluding);
        } else {
            this.set('iconColor', newColor);
        }
    },

    /**
     * Updates this blog's name by attempting to fetch the blog homepage
     * and extracting the name
     */
    updateName() {
        const url = this.get('url');

        log.verbose(`Blog model: Updating name ${this.url}`);

        if (url) {
            return getBlogName(url)
                .then((name) => {
                    log.verbose(`Blog model: Name found ${this.url}`);
                    this.set('name', name);
                })
                .catch((e) => {
                    log.info(`Blog model: Tried to update blog name, but failed: ${e}`);
                });
        }
    },

    /**
     * Whenever a blog is updated, we also inform the main thread
     * - just to ensure that the thread there knows about blogs
     * too.
     */
    save() {
        const { ipcRenderer } = requireNode('electron');
        const serializedData = this.toJSON({ includeId: true });

        log.verbose(`Blog model: Saving record`);

        ipcRenderer.send('blog-serialized', serializedData);
        return this._super(...arguments);
    }
});
