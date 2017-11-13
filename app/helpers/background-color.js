import Helper from '@ember/component/helper';
import { htmlSafe } from '@ember/string';

export function backgroundColor([ color ]) {
    return htmlSafe(`background-color: ${color};`);
}

export default Helper.helper(backgroundColor);
