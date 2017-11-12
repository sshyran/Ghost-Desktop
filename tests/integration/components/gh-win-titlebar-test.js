import { moduleForComponent, test } from 'ember-qunit'
import hbs from 'htmlbars-inline-precompile'
import Service from '@ember/service';

const browserWindow = requireNode('electron').remote.getCurrentWindow();

const windowMenuStub = Service.extend({
    popup() {
        return true;
    }
});

moduleForComponent('gh-win-titlebar', 'Integration | Component | gh win titlebar', {
    integration: true,
    beforeEach: function () {
        this.register('service:window-menu', windowMenuStub);
        this.inject.service('window-menu', { as: 'windowMenu' });
    },
    afterEach: function () {
        browserWindow.removeAllListeners(['enter-full-screen', 'unmaximize', 'maximize', 'leave-full-screen'])
    }
});

test('it renders', function (assert) {
    this.render(hbs`{{gh-win-titlebar}}`);

    assert.ok(this.$('button[title="Minimize"]'));
});

test('minimizes the window', function (assert) {
    // This will be poop on Linux, so, uhhh, ignore it
    if (process.platform === 'linux') return assert.ok(true);

    const done = assert.async();

    this.render(hbs`{{gh-win-titlebar}}`);

    this.$('button[title="Minimize"]').click();

    assert.ok(browserWindow.isMinimized());
    browserWindow.restore();

    setTimeout(done, 750);
});

test('maximizes the window', function (assert) {
    // This will be poop on Linux, so, uhhh, ignore it
    if (process.platform === 'linux') return assert.ok(true);

    this.render(hbs`{{gh-win-titlebar}}`);

    this.$('button[title="Maximize"]').click();

    assert.ok(browserWindow.isMaximized());
});

test('unmaxizimes the window', function (assert) {
    this.render(hbs`{{gh-win-titlebar}}`);
    this.set('isMaximized', true);

    this.$('button[title="Unmaximize"]').click();

    // This will be poop on macOS, so, uhhh, ignore it
    if (process.platform === 'darwin') return assert.ok(true);

    assert.equal(browserWindow.isMaximized(), false);
});
