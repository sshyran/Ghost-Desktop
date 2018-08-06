import Helper from '@ember/component/helper';

export function firstLetter(params) {
    if (params && params.length > 0) {
        return params[0].slice(0, 1);
    } else {
        return 'G';
    }
}

export default Helper.helper(firstLetter);
