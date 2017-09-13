import Ember from 'ember';
import {moduleFor, test} from 'ember-qunit';
import {autoUpdateMock} from '../../fixtures/auto-update';

const {run} = Ember;

moduleFor('route:application', 'Unit | Route | application', {
    // Specify the other units that are required for this test.
    needs: ['model:blog', 'service:window-menu', 'service:preferences'],
    beforeEach() {
        this.register('service:auto-update', autoUpdateMock);
        this.inject.service('auto-update', {as: 'autoUpdate'});
    }
});

test('it exists', function(assert) {
    const route = this.subject();
    assert.ok(route);
});

test('it returns blogs as a model', function(assert) {
    const route = this.subject();

    // stub store on the route
    route.store = {
        findAll(args) {
            assert.equal(args, 'blog');
            return new Promise((resolve) => resolve([{name: 'hi'}, {name: 'ho'}]));
        }
    };

    return route.model().then((result) => assert.equal(result.length, 2));
});

// test('before the model loads, we setup window and context menu', function(assert) {
//     assert.expect(3);

//     const oldAddEventListener = window.addEventListener;
//     const oldRequire = window.requireNode;
//     const oldDebounce = run.debounce;

//     run.debounce = (target, func) => func.call(target);
//     window.addEventListener = () => assert.ok(true);
//     window.requireNode = function(target) {
//         if (target === 'electron') {
//             return {
//                 remote: {
//                     Menu: {
//                         setApplicationMenu() {
//                             assert.ok(true);
//                         },
//                         buildFromTemplate() {
//                             assert.ok(true);
//                         }
//                     },
//                     getCurrentWindow() {
//                         return {};
//                     }
//                 }
//             };
//         } else {
//             return oldRequire(...arguments);
//         }
//     };

//     const route = this.subject();
//     route.beforeModel();

//     window.addEventListener = oldAddEventListener;
//     window.requireNode = oldRequire;
//     run.debounce = oldDebounce;
// });

test('after the model loads, we tell the main thread about the blogs', function(assert) {
    assert.expect(2);
    const oldRequire = window.require;

    window.requireNode = function(target) {
        if (target === 'electron') {
            return {
                ipcRenderer: {
                    send(channel, data) {
                        assert.deepEqual(data, {isTest: true});
                        assert.equal(channel, 'blog-data');
                    }
                }
            };
        } else {
            return oldRequire(...arguments);
        }
    };

    const route = this.subject();
    route.afterModel([{
        toJSON() {
            return {isTest: true};
        }
    }]);

    window.requireNode = oldRequire;
});