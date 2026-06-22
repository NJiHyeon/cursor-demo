// RFC 5322 이메일 정규식
//
// 출처:
// 1. General Email Regex (RFC 5322 Official Standard)
//    https://emailregex.com/
// 2. IP 리터럴 옥텟 버그 수정 (00 등 불법 옥텟 거부)
//    https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
// 3. RFC 5322 공식 문법 설명 (RFC 1035 preferred syntax)
//    https://www.regular-expressions.info/email.html
// 4. SMTP 최대 길이 254자 (RFC 5321)
//    https://www.regular-expressions.info/email.html

/** SMTP에서 허용하는 이메일 주소 최대 길이 */
const MAX_EMAIL_LENGTH = 254;

/**
 * dot-delimited IPv4 옥텟 (0–255, 선행 00 불허)
 * emailregex.com 기본 패턴의 (25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?) 대체
 */
const IP_OCTET = '(?:2(?:5[0-5]|[0-4][0-9])|1[0-9]{2}|[1-9]?[0-9])';

/** @type {string} RFC 5322 로컬 파트 (quoted / dot-atom) */
const RFC5322_LOCAL_PART =
    "(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|" +
    '"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*")';

/** @type {string} RFC 5322 도메인 (dot-delimited) */
const RFC5322_DOMAIN =
    '(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?';

/** @type {string} RFC 5322 IP 리터럴 ([IPv4] 또는 [IPv6-like]) */
const RFC5322_IP_LITERAL =
    `\\[(?:(?:${IP_OCTET}\\.){3}${IP_OCTET}|` +
    `[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\]`;

const RFC5322_EMAIL_REGEX = new RegExp(
    `^${RFC5322_LOCAL_PART}@(?:${RFC5322_DOMAIN}|${RFC5322_IP_LITERAL})$`,
    'i'
);

/**
 * 사용자 배열에서 이메일만 추출한다.
 * @param {unknown} users - 사용자 객체 배열
 * @returns {unknown[]} 이메일 값 배열
 */
function extractEmails(users) {
    if (!Array.isArray(users)) {
        return [];
    }
    return users.map((user) => user.email);
}

/**
 * 이메일 문자열이 RFC 5322 형식인지 검사한다.
 * @param {unknown} email - 검사할 이메일
 * @returns {boolean} 유효하면 true
 */
function isValidEmail(email) {
    if (typeof email !== 'string') {
        return false;
    }
    if (email.length > MAX_EMAIL_LENGTH) {
        return false;
    }
    return RFC5322_EMAIL_REGEX.test(email);
}

/**
 * 사용자 배열에서 유효한 이메일만 반환한다.
 * @param {Array<{ email?: unknown }>} users - 사용자 객체 배열
 * @returns {string[]} 유효한 이메일 배열
 */
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
