import Ember from 'ember';

const {String, Helper} = Ember;

export function backgroundColor([color]) {
    return String.htmlSafe(`background-color: ${color};`);
}

export default Helper.helper(backgroundColor);
