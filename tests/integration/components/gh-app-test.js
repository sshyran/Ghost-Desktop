import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {getBlogs} from '../../fixtures/blogs';

module('Integration | Component | gh app', function (hooks) {
    setupRenderingTest(hooks);

    test('should show the "add blog" ui without existing blogs', async function (assert) {
        assert.expect(1);

        await render(hbs`{{gh-app}}`);

        const text = this.$().text().trim();
        const containsText = text.includes('Before we get started, please tell us where to find your blog');
        assert.ok(containsText);
    });

    test('renders all existing blogs in a webview', async function (assert) {
        assert.expect(1);

        const blogs = getBlogs();
        this.set('_blogs', blogs);

        await render(hbs`{{gh-app blogs=_blogs}}`);

        const webviews = this.$('webview');
        assert.equal(webviews.length, blogs.length);
    });

    test('displays the first blog if it has blogs (none selected)', async function(assert) {
        assert.expect(1);

        const blogs = getBlogs();
        this.set('_blogs', blogs);

        await render(hbs`{{gh-app blogs=_blogs}}`);

        const instanceHost = this.$('.instance-host')[0];
        assert.ok(this.$(instanceHost).hasClass('selected'));
    });

    test('displays the selected blog if it has blogs (one selected)', async function (assert) {
        assert.expect(1);

        const blogs = getBlogs();
        blogs[1].select();
        this.set('_blogs', blogs);
        await render(hbs`{{gh-app blogs=_blogs}}`);

        const instanceHost = this.$('.instance-host')[1];
        assert.ok(this.$(instanceHost).hasClass('selected'));

    });
});
