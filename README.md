# cursor-demo

사용자 배열에서 이메일을 추출·검증하는 Node.js 데모 프로젝트입니다.  
외부 npm 패키지 없이 RFC 5322 기반 이메일 검증을 직접 구현합니다.

## 요구 사항

- Node.js 18 이상 (내장 `node:test` 사용)

## 설치 및 실행

```bash
npm install
node src/index.js
```

## 테스트

```bash
npm test
```

## 프로젝트 구조

```
cursor-demo/
├── src/
│   ├── index.js        # 엔트리 포인트 (email 모듈 re-export)
│   ├── email.js        # 이메일 추출·검증·필터링
│   └── email.test.js   # 테스트
└── package.json
```

## API 요약

### `extractEmails(users)`

사용자 배열에서 `email` 필드만 추출합니다.

```js
const { extractEmails } = require('./src/email');

const users = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
];
extractEmails(users); // ['alice@example.com', 'bob@example.com']
```

### `isValidEmail(email)`

RFC 5322 형식으로 이메일 유효성을 검사합니다.

```js
const { isValidEmail } = require('./src/email');

isValidEmail('alice@example.com');        // true
isValidEmail('"john.doe"@example.com');   // true
isValidEmail('user@[192.168.0.1]');      // true
isValidEmail('invalid-email');            // false
```

### `getValidEmails(users)`

유효한 이메일만 필터링해 반환합니다.

```js
const { getValidEmails } = require('./src/email');

const users = [
  { email: 'alice@example.com' },
  { email: 'not-an-email' },
  { email: 'bob@test.org' },
];
getValidEmails(users); // ['alice@example.com', 'bob@test.org']
```

### `uniqueValidEmails(users)`

유효한 이메일만 추출하고 중복을 제거합니다.

```js
const { uniqueValidEmails } = require('./src/email');

const users = [
  { email: 'alice@example.com' },
  { email: 'alice@example.com' },
  { email: 'bob@test.org' },
  { email: 'invalid' },
];
uniqueValidEmails(users); // ['alice@example.com', 'bob@test.org']
```

## 릴리스 노트

### v1.0.0

**RFC 5322 기반 이메일 추출·검증 유틸리티를 제공하는 첫 정식 릴리스입니다.**

#### ✨ 기능

- **`email.js` 모듈 분리** — `extractEmails`, `isValidEmail`을 `src/index.js`에서 독립 모듈로 분리
- **`isValidEmail`** — [emailregex.com](https://emailregex.com/) RFC 5322 정규식 적용, IP 옥텟 `00` 버그 수정 반영
- **`getValidEmails`** — 이메일 추출 후 유효성 검사로 필터링
- **`uniqueValidEmails`** — 유효 이메일 추출 및 중복 제거
- **테스트** — Node.js 내장 `node:test`로 6개 테스트 추가 (`npm test`)

#### 🐛 버그 수정

- 해당 없음

#### 🧹 기타

- `package.json`에 `npm test` 스크립트 추가
- 외부 npm 의존성 없음 (Node.js 18+)

## 라이선스

ISC
