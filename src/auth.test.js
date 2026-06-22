const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { registerUser, login, clearUsersForTest } = require('./auth');

beforeEach(() => {
    clearUsersForTest();
});

test('registerUser는 유효한 사용자를 등록한다', () => {
    const result = registerUser('alice@example.com', 'password123');
    assert.equal(result.success, true);
});

test('registerUser는 유효하지 않은 이메일을 거부한다', () => {
    const result = registerUser('invalid-email', 'password123');
    assert.equal(result.success, false);
    assert.match(result.error, /이메일/);
});

test('registerUser는 짧은 비밀번호를 거부한다', () => {
    const result = registerUser('alice@example.com', 'short');
    assert.equal(result.success, false);
    assert.match(result.error, /비밀번호/);
});

test('login은 등록된 사용자로 로그인에 성공한다', () => {
    registerUser('alice@example.com', 'password123');
    const result = login('alice@example.com', 'password123');

    assert.equal(result.success, true);
    assert.equal(typeof result.token, 'string');
    assert.equal(result.token.length, 64);
});

test('login은 잘못된 비밀번호를 거부한다', () => {
    registerUser('alice@example.com', 'password123');
    const result = login('alice@example.com', 'wrong-password');

    assert.equal(result.success, false);
    assert.equal(result.error, '유효하지 않은 이메일 또는 비밀번호입니다.');
});

test('login은 존재하지 않는 사용자를 거부한다', () => {
    const result = login('nobody@example.com', 'password123');

    assert.equal(result.success, false);
    assert.equal(result.error, '유효하지 않은 이메일 또는 비밀번호입니다.');
});
