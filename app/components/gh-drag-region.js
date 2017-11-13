import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';

export default Component.extend({
    classNameBindings: [ 'isDraggable:is-draggable:is-not-draggable', ':drag-region' ],
    attributeBindings: [ 'style' ],
    style: computed('isDraggable', function() {
        return htmlSafe(`width: ${this.get('width')}; height: ${this.get('height')};`);
    }),
    isDraggable: true
});
