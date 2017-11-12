import {computed} from '@ember/object';
import Component from '@ember/component';

const {reads} = computed;

function K() {
    return this;
}

export default Component.extend({
    content: null,
    prompt: null,
    optionValuePath: 'id',
    optionLabelPath: 'title',
    selection: null,
    action: K, // action to fire on change

    // shadow the passed-in `selection` to avoid
    // leaking changes to it via a 2-way binding
    _selection: reads('selection'),

    actions: {
        change() {
            // jscs:disable requireArrayDestructuring
            const [selectEl] = this.$('select');
            // jscs:enable requireArrayDestructuring
            const {selectedIndex} = selectEl;

            // decrement index by 1 if we have a prompt
            const hasPrompt = !!this.get('prompt');
            const contentIndex = hasPrompt ? selectedIndex - 1 : selectedIndex;

            const selection = this.get('content').objectAt(contentIndex);

            // set the local, shadowed selection to avoid leaking
            // changes to `selection` out via 2-way binding
            this.set('_selection', selection);

            this.sendAction('action', selection);
        }
    }
});
