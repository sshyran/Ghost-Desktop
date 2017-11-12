import {moduleForComponent, test} from 'ember-qunit';
import {autoUpdateMock} from '../../fixtures/mock-auto-update';
import {osMock} from '../../fixtures/mock-os';

moduleForComponent('gh-preferences', 'Unit | Component | gh preferences', {
    unit: true,
    needs: ['service:preferences'],
    beforeEach() {
        this.register('service:auto-update', autoUpdateMock);
        this.inject.service('auto-update', {as: 'autoUpdate'});
    }
});

/**
 * Tests
 */

test('openExternal tries to open the url in an external browser', function(assert) {
    const component = this.subject();
    const oldRequire = window.requireNode;
    const url = 'http://test.com';
    const mockElectron = {
        shell: {
            openExternal: (_url) => assert.equal(url, _url)
        }
    };

    window.requireNode = (module) => {
        if (module === 'electron') return mockElectron;
        if (module === 'os') return osMock;
    }

    this.render();
    component.actions.openExternal(url);

    window.requireNode = oldRequire;
});

test('deleteData tries to show a dialog', function(assert) {
    const component = this.subject();
    const oldRequire = window.requireNode;
    const mockDialog = {
        showMessageBox: (options) => {
            assert.ok(options);
            assert.ok(options.type);
            assert.equal(options.type, 'warning');
        }
    };
    const mockElectron = {
        remote: {
            dialog: mockDialog
        }
    };

    // Prep
    assert.expect(3);
    window.requireNode = (module) => {
        if (module === 'electron') return mockElectron;
        if (module === 'os') return osMock;
    }

    // Test
    this.render();
    component.actions.deleteData();

    // Reset
    window.requireNode = oldRequire;
});

test('deleteData does not attempt to delete if response is 0', function(assert) {
    const component = this.subject();
    const oldRequire = window.requireNode;
    const mockDialog = {
        showMessageBox: (options, cb) => {
            assert.ok(true);
            cb(0);
        }
    };
    const mockElectron = {
        remote: {
            dialog: mockDialog
        }
    };
    // Prep
    assert.expect(2);
    window.localStorage.setItem('storage-ok', true);
    window.requireNode = (module) => {
        if (module === 'electron') return mockElectron;
        if (module === 'os') return osMock;
    }

    // Test
    this.render();
    component.actions.deleteData();
    assert.ok(window.localStorage.getItem('storage-ok'));

    // Reset
    window.requireNode = oldRequire;
});