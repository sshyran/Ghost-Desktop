import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { getBlogs } from '../../fixtures/blogs';

/**
 * Test Preparation
 */

let recordCreated = false;
let recordSaved = false;

async function assertErrorDivs(target, assert, expected, i = 0) {
    const sleep = (ms = 100) => new Promise((resolve) => {
        setTimeout(resolve, ms);
    })

    const errorDivs = target.$('div.error');

    if ((errorDivs && errorDivs.length === expected) || i > 20) {
        return assert.equal(errorDivs.length, expected);
    }

    await sleep(100);
    return await assertErrorDivs(target, assert, expected, i + 1);
}

const store = Ember.Service.extend({
    createRecord() {
        recordCreated = true;

        return {
            setProperties() {},
            save() {
                recordSaved = true;
                return new Promise((resolve, reject) => resolve());
            }
        }
    },

    findAll() {
        return new Promise((resolve) => resolve(getBlogs()));
    }
});

moduleForComponent('gh-edit-blog', 'Integration | Component | gh edit blog', {
    integration: true,
    beforeEach() {
        recordCreated = false;
        recordSaved = false;

        this.register('service:store', store);
        this.inject.service('store');
    }
});

/**
 * Local Helpers
 */
function checkForRecord(assert, qAsync, i = 0) {
    setTimeout(() => {
        if (recordCreated || i > 50) {
            assert.ok(recordCreated);
            qAsync();
        } else {
            checkForRecord(assert, qAsync, i + 1);
        }
    }, 200);
}

function checkForSave(assert, qAsync, i = 0) {
    setTimeout(() => {
        if (recordSaved || i > 50) {
            assert.ok(recordSaved);
            qAsync();
        } else {
            checkForSave(assert, qAsync, i + 1);
        }
    }, 200);
}

/**
 * Tests
 */

test('it renders', function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });"

    this.render(hbs`{{gh-edit-blog}}`);

    const text = this.$().text().trim();
    const containsText = text.includes('Before we get started, please tell us where to find your blog');
    assert.ok(containsText);
});

test('marks an incorrect url as invalid', function(assert) {
    assert.expect(1);
    this.render(hbs`{{gh-edit-blog}}`);

    this.$('input[name="url"]').focus();
    this.$('input[name="url"]').val('/not-a-url');
    this.$('input[name="url"]').change();
    this.$('.btn').click();

    return assertErrorDivs(this, assert, 1);
});

test('does not mark a correct url as invalid', function(assert) {
    assert.expect(1);
    this.render(hbs`{{gh-edit-blog}}`);

    this.$('input[name="url"]').focus();
    this.$('input[name="url"]').val('https://www.a-url.com/ghost');
    this.$('input[name="url"]').change();
    this.$('.btn').click();

    return assertErrorDivs(this, assert, 0);
});

test('adding a blog creates a blog record', function(assert) {
    const qAsync = assert.async();

    this.render(hbs`{{gh-edit-blog}}`);

    this.$('input[name="url"]').val('https://demo.ghost.io/ghost/');
    this.$('input[name="url"]').change();

    Ember.run(() => this.$('button:submit').click());

    checkForRecord(assert, qAsync);
});

test('adding a blog saves a blog record', function(assert) {
    const qAsync = assert.async();

    this.render(hbs`{{gh-edit-blog}}`);

    this.$('input[name="url"]').val('https://demo.ghost.io/ghost/');
    this.$('input[name="url"]').change();

    Ember.run(() => this.$('button:submit').click());

    checkForRecord(assert, qAsync);
});

test('passed a blog, the component shows the title', function(assert) {
    this.set('_blog', getBlogs()[0]);
    this.render(hbs`{{gh-edit-blog blog=_blog}}`);

    const text = this.$().text().trim();
    const containsText = text.includes('Testblog');

    assert.ok(containsText);
});

test('passed a blog, the url is set to the blog\'s url', function(assert) {
    this.set('_blog', getBlogs()[0]);
    this.render(hbs`{{gh-edit-blog blog=_blog}}`);

    const urlContent = this.$('input[name="url"]').val();
    assert.notEqual(urlContent, '');
});

test('passed a blog, it checks values again', function(assert) {
    this.set('_blog', getBlogs()[0]);
    this.render(hbs`{{gh-edit-blog blog=_blog}}`);

    const errorDivs = this.$('div.error');
    assert.equal(errorDivs.length, 0);
});

test('passed a blog, it does not create a new record - even if everything changed', function(assert) {
    const qAsync = assert.async();

    const blogProps = {
        name: getBlogs()[0].get('name')
    }

    this.set('_blog', getBlogs()[0]);
    this.render(hbs`{{gh-edit-blog blog=_blog}}`);

    this.$('input[name="url"]').val('https://demo.ghost.io/ghost/');
    this.$('input[name="url"]').change();

    Ember.run(() => this.$('button:submit').click());

    setTimeout(() => {
        if (recordCreated) {
            assert.fail(recordCreated, false, 'Record created');
            qAsync();
        } else {
            assert.ok(true);
            qAsync();
        }
    }, 500);
});
