const { test } = require('node:test');
const assert = require('node:assert/strict');
const { extractEmails, isValidEmail, getValidEmails, uniqueValidEmails } = require('./email');

test('extractEmails는 사용자 배열에서 이메일만 반환한다', () => {
    const users = [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' },
    ];
    assert.deepEqual(extractEmails(users), ['alice@example.com', 'bob@example.com']);
});

test('extractEmails는 배열이 아니면 빈 배열을 반환한다', () => {
    assert.deepEqual(extractEmails(null), []);
    assert.deepEqual(extractEmails('invalid'), []);
});

test('isValidEmail은 유효한 이메일만 true를 반환한다', () => {
    assert.equal(isValidEmail('alice@example.com'), true);
    assert.equal(isValidEmail('user+tag@example.co.kr'), true);
    assert.equal(isValidEmail('invalid-email'), false);
    assert.equal(isValidEmail('no-at-sign'), false);
    assert.equal(isValidEmail(123), false);
});

test('isValidEmail은 RFC 5322에서 허용하는 형식을 인식한다', () => {
    assert.equal(isValidEmail('"john.doe"@example.com'), true);
    assert.equal(isValidEmail('user@[192.168.0.1]'), true);
    assert.equal(isValidEmail('user@[00.0.0.0]'), false);
});

test('isValidEmail은 RFC 5321 최대 길이(254자)를 초과하면 false를 반환한다', () => {
    const longLocal = 'a'.repeat(65);
    const longDomain = `${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(57)}.com`;
    const tooLong = `${longLocal}@${longDomain}`;
    assert.equal(tooLong.length, 255);
    assert.equal(isValidEmail(tooLong), false);
});

test('getValidEmails는 유효한 이메일만 반환한다', () => {
    const users = [
        { email: 'alice@example.com' },
        { email: 'not-an-email' },
        { email: 'bob@test.org' },
        { email: null },
    ];
    assert.deepEqual(getValidEmails(users), ['alice@example.com', 'bob@test.org']);
});

test('uniqueValidEmails는 유효한 이메일만 반환하고 중복을 제거한다', () => {
    const users = [
        { email: 'alice@example.com' },
        { email: 'alice@example.com' },
        { email: 'bob@test.org' },
        { email: 'invalid' },
    ];
    assert.deepEqual(uniqueValidEmails(users), ['alice@example.com', 'bob@test.org']);
});
