import Helper from '@ember/component/helper';

export function switchShortcut([ index ] = [ 0 ]) {
    const cmdOrCtrl = (process.platform && process.platform === 'darwin') ? '⌘' : 'Ctrl';

    // If bigger than 9, don't return anything
    return (index + 1 > 9) ? '' : `${cmdOrCtrl} ${index + 1}`;
}

export default Helper.helper(switchShortcut);
