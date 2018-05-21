import getIsGhost from 'ghost-desktop/utils/get-is-ghost';
import {module, test} from 'qunit';

module('Unit | Utility | get is ghost host');

test('correctly marks a Ghost app as Ghost', function (assert) {
    return getIsGhost('https://demo.ghost.io/ghost/signin/').then((result) => assert.ok(result));
});

test('correctly marks a non-Ghost site as Ghost', function (assert) {
    return getIsGhost('https//bing.com').then((result) => assert.ok(!result));
});

test('rejects the promise if called without a parameter', function (assert) {
    return getIsGhost().catch((err) => assert.ok(err));
});
