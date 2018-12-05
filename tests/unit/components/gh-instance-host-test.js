import Ember from 'ember';
import {moduleForComponent, test} from 'ember-qunit';

const {run} = Ember;

/**
 * Test Preparation
 */

moduleForComponent('gh-instance-host', 'Unit | Component | gh instance host', {
    unit: true,
    needs: ['service:preferences', 'component:gh-basic-auth', 'storage:preferences']
});

const path = requireNode('path');
const blog501 = {
    blog: {
        url: path.join('http://0.0.0.0/404'),
        updateName() {
            return new Promise((resolve) => resolve());
        },
        get(property) {
            return this[property];
        }
    }
};
const blog404 = {
    blog: {
        url: path.join('http://0.0.0.0/404'),
        updateName() {
            return new Promise((resolve) => resolve());
        },
        get(property) {
            return this[property];
        }
    }
};
const blog200 = {
    blog: {
        url: path.join(__dirname, 'tests', 'fixtures', 'static-signin', 'signin.html'),
        updateName() {
            return new Promise((resolve) => resolve());
        },
        get(property) {
            return this[property];
        }
    }
};
const blogFile404 = {
    blog: {
        url: 'file://hi.com',
        updateName() {
            return new Promise((resolve) => resolve());
        },
        get(property) {
            return this[property];
        }
    }
};

/**
 * Tests
 */

test('show sets the instance to loaded', function(assert) {
    const component = this.subject(blog200);

    component.show();

    assert.ok(component.get('isInstanceLoaded'));
});

test('handleLoaded eventually shows the webview', function(assert) {
    const done = assert.async();
    const component = this.subject();

    this.render();
    run.later(() => component._handleLoaded(), 1000);
    run.later(() => {
        assert.ok(component.get('isInstanceLoaded'));
        done();
    }, 1500);
});

test('console message "loaded" eventually shows the webview', function(assert) {
    const component = this.subject();
    const e = {originalEvent: {}};

    e.originalEvent.message = 'loaded';
    component._handleConsole(e);
    assert.ok(component.get('isInstanceLoaded'));
});

test('handleLoadFailure redirects the webview to the error page', function(assert) {
    // This test crashes Electron on Windows (and I have no idea why)
    if (process.platform === 'win32') {
        return assert.ok(true);
    }

    const done = assert.async();
    const path = requireNode('path');
    const component = this.subject(blog404);
    const e = {
        originalEvent: {
            validatedURL: 'http://hi.com'
        }
    };

    this.render();
    run.later(() => component._handleLoadFailure(e), 1000);
    run.later(() => {
        const isErrorPage = this.$('webview').attr('src').includes('load-error');
        assert.ok(isErrorPage);
        done();
    }, 1500);
});

test('handleLoadFailure does not redirect for failed file:// loads', function(assert) {
    const done = assert.async();
    const path = requireNode('path');
    const component = this.subject(blogFile404);

    this.render();
    run.later(() => {
        assert.equal(this.$('webview').attr('src'), 'file://hi.com');
        done();
    }, 750);
});