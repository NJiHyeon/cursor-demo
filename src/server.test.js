const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { createServer } = require('./server');
const { clearUsersForTest, registerUser } = require('./auth');

/**
 * HTTP 요청을 보낸다.
 * @param {import('http').Server} server - 테스트 서버
 * @param {string} path - 요청 경로
 * @param {object} body - JSON 본문
 * @returns {Promise<{ statusCode: number, body: object }>}
 */
function request(server, path, body) {
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(body);
        const req = http.request(
            {
                hostname: '127.0.0.1',
                port,
                path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                },
            },
            (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode ?? 0,
                        body: JSON.parse(data),
                    });
                });
            }
        );

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

/** @type {import('http').Server | null} */
let server = null;

beforeEach(async () => {
    clearUsersForTest();
    server = createServer();
    await new Promise((resolve) => server.listen(0, resolve));
});

afterEach(async () => {
    if (server) {
        await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
        server = null;
    }
});

test('POST /api/login은 유효한 자격 증명으로 토큰을 반환한다', async () => {
    registerUser('alice@example.com', 'password123');

    const response = await request(server, '/api/login', {
        email: 'alice@example.com',
        password: 'password123',
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(typeof response.body.token, 'string');
});

test('POST /api/login은 잘못된 비밀번호에 401을 반환한다', async () => {
    registerUser('alice@example.com', 'password123');

    const response = await request(server, '/api/login', {
        email: 'alice@example.com',
        password: 'wrong-password',
    });

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.success, false);
});

test('POST /api/register는 새 사용자를 등록한다', async () => {
    const response = await request(server, '/api/register', {
        email: 'bob@example.com',
        password: 'password123',
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.success, true);
});

test('알 수 없는 경로는 404를 반환한다', async () => {
    const response = await request(server, '/api/unknown', {});

    assert.equal(response.statusCode, 404);
    assert.equal(response.body.success, false);
});
