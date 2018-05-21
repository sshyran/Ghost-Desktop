import Ember from 'ember';
import {moduleForModel, test} from 'ember-qunit';

const {run} = Ember;

/**
 * Test Preparation
 */

moduleForModel('blog', 'Unit | Model | blog', {
    needs: []
});

/**
 * Tests
 */

test('it exists', function(assert) {
    const blog = this.subject();
    assert.ok(!!blog);
});

test('it can be selected', function(assert) {
    assert.expect(2);
    const blog = this.subject({isSelected: false});

    // mock the save
    blog.save =  function () {
        assert.ok(true);
    };

    run(() => blog.select());
    assert.ok(blog.get('isSelected'));
});

test('it can be deselected', function(assert) {
    assert.expect(2);
    const blog = this.subject({isSelected: true});

    // mock the save
    blog.save =  function () {
        assert.ok(true);
    };

    run(() => blog.unselect());
    assert.ok(!blog.get('isSelected'));
});

test('it can store a password', function(assert) {
    // No asserts, we just don't want this test to crash
    assert.expect(0);

    const blog = this.subject({identification: 'test', url: 'testblog'});

    run(() => blog.setPassword('test'));
});

test('it can retrieve a password', async function(assert) {
    const blog = this.subject({identification: 'test', url: 'testblog'});

    await run(async () => {
        const password = await blog.getPassword();

        // On Travis, this test might fail - so we accept it right away.
        // This issue can be solved by using a Travis instance with
        // gnome-keytar, which we currently don't have.
        if (process && process.env && process.env.TRAVIS) {
            assert.ok(true);
        } else {
            assert.equal(password, 'test');
        }

    });
});

test('it can generate a new random icon color', function (assert) {
    const blog = this.subject();
    const oldColor = blog.get('iconColor');

    run(() => blog.randomIconColor(oldColor));
    assert.notEqual(oldColor, blog.get('iconColor'));
});

test('it updates the blog title', function (assert) {
    const blog = this.subject({url: 'http://bing.com'});

    return blog.updateName()
        .then(() => {
            assert.equal(blog.get('name'), 'Bing');
        });
});
