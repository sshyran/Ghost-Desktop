import {Helper} from '@ember/component';

export function isEqual([lhs, rhs]) {
    return lhs === rhs;
}

export default Helper.helper(function (params) {
    return isEqual(params);
});
