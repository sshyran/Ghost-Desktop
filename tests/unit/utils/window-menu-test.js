import {setup, reload, toggleGhostDevTools, openReportIssues, openRepository} from 'ghost-desktop/utils/window-menu';
import {module, test} from 'qunit';

module('Unit | Utility | window menu');

test('creates a menu (6 elements)', function(assert) {
    const result = setup();
    const expected = 6;

    assert.equal(result.length, expected);
});

test('reloads a given BrowserWindow', function(assert) {
    reload({}, {
        reload() {
            assert.ok(true, 'reload called');
        }
    });
});

test('does not do anything if there\'s no webview', function(assert) {
    assert.expect(0);

    // Monkeypatch
    const _$ = window.Ember.$;

    window.Ember.$ = function (selector) {
        if (selector && selector === 'div.instance-host.selected') {
            return undefined;
        } else {
            return _$(...arguments);
        }
    };

    toggleGhostDevTools();

    window.Ember.$ = _$;
});

test('opens the repo on GitHub', function(assert) {
    const _requireNode = window.requireNode;
    let openExternalCalled = false;

    window.requireNode = function (target) {
        if (target === 'electron') {
            return {
                shell: {
                    openExternal() {
                        openExternalCalled = true;
                    }
                }
            };
        } else {
            return _requireNode(...arguments);
        }
    };

    openRepository();
    assert.ok(openExternalCalled);
    window.requireNode = _requireNode;
});

test('opens the issues on GitHub', function(assert) {
    const _requireNode = window.requireNode;
    let openExternalCalled = false;

    window.requireNode = function (target) {
        if (target === 'electron') {
            return {
                shell: {
                    openExternal() {
                        openExternalCalled = true;
                    }
                }
            };
        } else {
            return _requireNode(...arguments);
        }
    };

    openReportIssues();
    assert.ok(openExternalCalled);
    window.requireNode = _requireNode;
});
