import setUserTasks from 'ghost-desktop/utils/set-user-tasks';
import {module, test} from 'qunit';

module('Unit | Utility | set user tasks');

test('it attempts to set the user tasks, given a list of blogs', function(assert) {
    const oldRequire = window.requireNode;
    const mockRemote = {
        app: {
            setUserTasks(tasks) {
                const expected = [{
                    program: process.execPath,
                    arguments: 'http://hello.hi/i-like-you/',
                    title: 'Test'
                }, {
                    program: process.execPath,
                    arguments: 'http://hello.hi/how-are-you/',
                    title: 'Test 2'
                }];

                assert.deepEqual(tasks, expected);
            }
        }
    };

    const mockBlogs = [{
        name: 'Test',
        url: 'http://hello.hi/i-like-you/'
    }, {
        name: 'Test 2',
        url: 'http://hello.hi/how-are-you/'
    }];

    window.requireNode = function(module) {
        if (module === 'electron') {
            return {
                remote: mockRemote
            };
        } else {
            oldrequireNode(...arguments);
        }
    };

    setUserTasks(mockBlogs);

    window.requireNode = oldRequire;
});

test('still works with one borked blog', function(assert) {
    const oldRequire = window.requireNode;
    const mockRemote = {
        app: {
            setUserTasks(tasks) {
                const expected = [{
                    program: process.execPath,
                    arguments: 'http://hello.hi/i-like-you/',
                    title: 'Test'
                }];

                assert.deepEqual(tasks, expected);
            }
        }
    };

    const mockBlogs = [{
        name: 'Test',
        url: 'http://hello.hi/i-like-you/'
    }, {
        name: 'Test 2',
        url: undefined
    }];

    window.requireNode = function(module) {
        if (module === 'electron') {
            return {
                remote: mockRemote
            };
        } else {
            oldrequireNode(...arguments);
        }
    };

    setUserTasks(mockBlogs);

    window.requireNode = oldRequire;
});

test('does not attempt to set anything if passed no blogs', function(assert) {
    assert.expect(0);

    const oldRequire = window.requireNode;
    const mockRemote = {
        app: {
            setUserTasks() {
                assert.ok(false);
            }
        }
    };

    window.requireNode = function(module) {
        if (module === 'electron') {
            return {
                remote: mockRemote
            };
        } else {
            oldrequireNode(...arguments);
        }
    };

    setUserTasks();

    window.requireNode = oldRequire;
});