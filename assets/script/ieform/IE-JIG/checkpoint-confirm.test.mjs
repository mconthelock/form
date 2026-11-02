import assert from 'node:assert/strict';
import {
    buildConfirmPayload,
    evaluateConfirmation,
} from './checkpoint.js';

assert.equal(evaluateConfirmation(1, 3, 2), 'OK');
assert.equal(evaluateConfirmation(1, 3, 4), 'NG');
assert.equal(evaluateConfirmation(-1, 1, 0), 'OK');
assert.equal(evaluateConfirmation(1, 3, ''), '');

const details = [
    { CHECK_SEQ: 1, RESULT: 'OK', CONFIRM_VALUE: null },
    { CHECK_SEQ: 2, RESULT: 'NG', CONFIRM_VALUE: 0 },
    { CHECK_SEQ: 3, RESULT: 'NG', CONFIRM_VALUE: 4 },
];
assert.deepEqual(buildConfirmPayload(details), [
    { CHECK_SEQ: 2, CONFIRM_VALUE: 0 },
    { CHECK_SEQ: 3, CONFIRM_VALUE: 4 },
]);
assert.throws(
    () => buildConfirmPayload([{ CHECK_SEQ: 1, RESULT: 'NG', CONFIRM_VALUE: null }]),
    /Confirm Measured/,
);

console.log('checkpoint confirmation tests passed');
