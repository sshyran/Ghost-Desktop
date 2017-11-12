import {Helper} from '@ember/component';
import String from '@ember/string';

export function backgroundColor([color]) {
    return String.htmlSafe(`background-color: ${color};`);
}

export default Helper.helper(backgroundColor);
