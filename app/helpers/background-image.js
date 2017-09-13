import Ember from 'ember';

const {String, Helper} = Ember;

export function backgroundImage([blog]) {
    const url = blog.get('url') || '';
    const icon = url.replace(/\/ghost\/$/i, '/favicon.ico');

    return String.htmlSafe(`background-image: url("${icon}")`);
}

export default Helper.helper(backgroundImage);
