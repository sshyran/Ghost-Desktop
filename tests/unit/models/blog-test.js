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
