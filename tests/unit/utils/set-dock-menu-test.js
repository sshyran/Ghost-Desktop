import setDockMenu from 'ghost-desktop/utils/set-dock-menu';
import {module, test} from 'qunit';

module('Unit | Utility | set dock menu');

test('it setups a dock menu', function(assert) {
    const oldRequire = window.requireNode;
    const mockRemote = {app: {dock: {}}};
    mockRemote.Menu = requireNode('electron').remote.Menu;
    mockRemote.MenuItem = requireNode('electron').remote.MenuItem;

    mockRemote.app.dock.setMenu = function(menu) {
        assert.equal(menu.items.length, 3);
    };

    window.requireNode = function (module) {
        if (module === 'electron') {
            return {remote: mockRemote};
        } else {
            oldrequireNode(...arguments);
        }
    };

    setDockMenu([{
        name: 'Testblog A',
        callback() {}
    }, {
        name: 'Testblog B',
        callback() {}
    }, {
        name: 'Testblog C',
        callback() {}
    }]);

    window.requireNode = oldRequire;
});

test('ignores borked blog items', function(assert) {
    const oldRequire = window.requireNode;
    const mockRemote = {app: {dock: {}}};
    mockRemote.Menu = requireNode('electron').remote.Menu;
    mockRemote.MenuItem = requireNode('electron').remote.MenuItem;

    mockRemote.app.dock.setMenu = function(menu) {
        assert.equal(menu.items.length, 2);
    };

    window.requireNode = function (module) {
        if (module === 'electron') {
            return {remote: mockRemote};
        } else {
            oldrequireNode(...arguments);
        }
    };

    setDockMenu([{
        name: 'Testblog A',
        callback() {}
    }, {
        name: 'Testblog B',
        callback: undefined
    }, {
        name: 'Testblog C',
        callback() {}
    }]);

    window.requireNode = oldRequire;
});

test('does not do anything if called without items', function(assert) {
    assert.expect(0);

    const oldRequire = window.requireNode;
    const mockRemote = {app: {dock: {}}};
    mockRemote.Menu = requireNode('electron').remote.Menu;
    mockRemote.MenuItem = requireNode('electron').remote.MenuItem;

    mockRemote.app.dock.setMenu = function() {
        assert.ok(false);
    };

    window.requireNode = function (module) {
        if (module === 'electron') {
            return {remote: mockRemote};
        } else {
            oldrequireNode(...arguments);
        }
    };

    setDockMenu();

    window.requireNode = oldRequire;
});