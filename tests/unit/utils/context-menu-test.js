import {setup} from 'ghost-desktop/utils/context-menu';
import {module, test} from 'qunit';

module('Unit | Utility | context menu');

test('binds to the "contextmenu" event', function(assert) {
    // Monkeypatch
    let addEventListenerCalled = false;
    const oldAddEvent = window.addEventListener;
    window.addEventListener = function (e, cb) {
        if (e === 'contextmenu' && cb) {
            addEventListenerCalled = true;
        }

        return oldAddEvent(...arguments);
    };

    setup();
    assert.ok(addEventListenerCalled);
});

test('right click opens context menu', function(assert) {
    assert.expect(2);

    const element = document.querySelector('input#qunit-filter-input');
    const event = document.createEvent('MouseEvents');
    const x = 10;
    const y = 10;

    const oldRequire = window.requireNode;
    const mockRemote = {BrowserWindow: {}, Menu: {}, getCurrentWindow() {
        return true;
    }};

    mockRemote.BrowserWindow = window.requireNode('electron').remote.BrowserWindow;
    mockRemote.Menu.buildFromTemplate = function() {
        return {
            popup() {
                assert.ok(true);
            }
        };
    };
    window.requireNode = function (module) {
        if (module === 'electron') {
            return {remote: mockRemote};
        } else {
            oldrequireNode(...arguments);
        }
    };

    setup();

    event.initMouseEvent('contextmenu', true, true, element.ownerDocument.defaultView, 1, x, y, x, y, false, false, false, false, 2, null);
    element.dispatchEvent(event);

    assert.ok(window.CONTEXTMENU_OPENED);
    window.requireNode = oldRequire;
});

test('does not error on non-input', function(assert) {
    setup();

    const element = document.querySelector('div#qunit');
    const event = document.createEvent('MouseEvents');

    const x = 10;
    const y = 10;

    event.initMouseEvent('contextmenu', true, true, element.ownerDocument.defaultView, 1, x, y, x, y, false, false, false, false, 2, null);
    element.dispatchEvent(event);

    assert.ok(window.CONTEXTMENU_OPENED);
});
