// RFC 5322 기반 이메일 정규식
// 출처: https://emailregex.com/ (General Email Regex, RFC 5322 Official Standard)
// IP 주소 패턴 00 버그 수정 권장안: https://stackoverflow.com/questions/201323/
const RFC5322_EMAIL_REGEX = new RegExp(
    '^' +
    "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|" +
    '"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*")' +
    '@' +
    '(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|' +
    '\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}' +
    '(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|' +
    '[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])' +
    '$',
    'i'
);

// 사용자 배열에서 이메일만 추출하는 함수
function extractEmails(users) {
    if (!Array.isArray(users)) {
        return [];
    }
    return users.map(user => user.email);
}

function isValidEmail(email) {
    if (typeof email !== 'string') {
        return false;
    }
    return RFC5322_EMAIL_REGEX.test(email);
}

// 유효한 이메일만 추출하는 함수
function getValidEmails(users) {
    return extractEmails(users).filter(isValidEmail);
}

/**
 * 사용자 목록에서 유효한 이메일만 추출하고 중복을 제거한다.
 * @param {Array<{ email?: unknown }>} users - 사용자 객체 배열
 * @returns {string[]} 중복이 제거된 유효 이메일 배열
 */
function uniqueValidEmails(users) {
    return [...new Set(getValidEmails(users))];
}

module.exports = { extractEmails, isValidEmail, getValidEmails, uniqueValidEmails };
