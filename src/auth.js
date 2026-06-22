const crypto = require('crypto');
const { isValidEmail } = require('./email');

/** @type {Map<string, { salt: Buffer, hash: Buffer }>} */
const users = new Map();

const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const MIN_PASSWORD_LENGTH = 8;
const INVALID_CREDENTIALS_MESSAGE = '유효하지 않은 이메일 또는 비밀번호입니다.';

/**
 * 비밀번호를 scrypt로 해시한다.
 * @param {string} password - 평문 비밀번호
 * @param {Buffer} salt - 솔트
 * @returns {Buffer} 해시
 */
function hashPassword(password, salt) {
    return crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH, SCRYPT_OPTIONS);
}

/**
 * 이메일을 저장 키로 정규화한다.
 * @param {string} email - 이메일
 * @returns {string} 소문자 이메일
 */
function normalizeEmail(email) {
    return email.toLowerCase();
}

/**
 * 새 사용자를 등록한다.
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {{ success: true } | { success: false, error: string }}
 */
function registerUser(email, password) {
    if (!isValidEmail(email)) {
        return { success: false, error: '유효하지 않은 이메일 형식입니다.' };
    }
    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        return { success: false, error: `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상이어야 합니다.` };
    }

    const key = normalizeEmail(email);
    if (users.has(key)) {
        return { success: false, error: '이미 등록된 이메일입니다.' };
    }

    const salt = crypto.randomBytes(16);
    const hash = hashPassword(password, salt);
    users.set(key, { salt, hash });
    return { success: true };
}

/**
 * 이메일과 비밀번호로 로그인한다.
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {{ success: true, token: string } | { success: false, error: string }}
 */
function login(email, password) {
    if (!isValidEmail(email) || typeof password !== 'string') {
        return { success: false, error: INVALID_CREDENTIALS_MESSAGE };
    }

    const user = users.get(normalizeEmail(email));
    if (!user) {
        return { success: false, error: INVALID_CREDENTIALS_MESSAGE };
    }

    const attempt = hashPassword(password, user.salt);
    if (!crypto.timingSafeEqual(attempt, user.hash)) {
        return { success: false, error: INVALID_CREDENTIALS_MESSAGE };
    }

    const token = crypto.randomBytes(32).toString('hex');
    return { success: true, token };
}

/**
 * 테스트용 사용자 저장소를 초기화한다.
 */
function clearUsersForTest() {
    users.clear();
}

module.exports = {
    registerUser,
    login,
    clearUsersForTest,
};
