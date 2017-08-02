import {escapeString} from 'ghost-desktop/utils/escape-string';
import {module, test} from 'qunit';

module('Unit | Utility | escape string');

test('escapes a string with single quotes', function (assert) {
    const password = 'hi\'';
    const output = `$('input[name="password"]').val('${escapeString(password)}');`;
    const expected = '$(\'input[name="password"]\').val(\'hi\\\'\');';
    assert.equal(output, expected);
});

test('escapes a string with newlines', function (assert) {
    const password = '\n';
    const output = `$('input[name="password"]').val('${escapeString(password)}');`;
    const expected = '$(\'input[name="password"]\').val(\'\\n\');';
    assert.equal(output, expected);
});
