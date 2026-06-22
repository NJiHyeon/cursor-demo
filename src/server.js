const http = require('http');
const { login, registerUser } = require('./auth');

const DEFAULT_PORT = 3000;
const MAX_BODY_SIZE = 1024;

/**
 * 요청 본문을 JSON으로 파싱한다.
 * @param {import('http').IncomingMessage} req - HTTP 요청
 * @param {number} maxSize - 최대 본문 크기(바이트)
 * @returns {Promise<unknown>}
 */
function readJsonBody(req, maxSize = MAX_BODY_SIZE) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk;
            if (body.length > maxSize) {
                reject(new Error('REQUEST_ENTITY_TOO_LARGE'));
                req.destroy();
            }
        });

        req.on('end', () => {
            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch {
                reject(new Error('INVALID_JSON'));
            }
        });

        req.on('error', reject);
    });
}

/**
 * JSON 응답을 전송한다.
 * @param {import('http').ServerResponse} res - HTTP 응답
 * @param {number} statusCode - 상태 코드
 * @param {object} payload - 응답 본문
 */
function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
}

/**
 * HTTP 서버를 생성한다.
 * @returns {import('http').Server}
 */
function createServer() {
    const server = http.createServer(async (req, res) => {
        if (req.method === 'POST' && req.url === '/api/login') {
            try {
                const body = await readJsonBody(req);
                const result = login(body.email, body.password);

                if (!result.success) {
                    sendJson(res, 401, { success: false, error: result.error });
                    return;
                }

                sendJson(res, 200, { success: true, token: result.token });
            } catch (error) {
                if (error instanceof Error && error.message === 'REQUEST_ENTITY_TOO_LARGE') {
                    sendJson(res, 413, { success: false, error: '요청 본문이 너무 큽니다.' });
                    return;
                }
                sendJson(res, 400, { success: false, error: '잘못된 JSON 요청입니다.' });
            }
            return;
        }

        if (req.method === 'POST' && req.url === '/api/register') {
            try {
                const body = await readJsonBody(req);
                const result = registerUser(body.email, body.password);

                if (!result.success) {
                    sendJson(res, 400, { success: false, error: result.error });
                    return;
                }

                sendJson(res, 201, { success: true });
            } catch (error) {
                if (error instanceof Error && error.message === 'REQUEST_ENTITY_TOO_LARGE') {
                    sendJson(res, 413, { success: false, error: '요청 본문이 너무 큽니다.' });
                    return;
                }
                sendJson(res, 400, { success: false, error: '잘못된 JSON 요청입니다.' });
            }
            return;
        }

        sendJson(res, 404, { success: false, error: '요청한 경로를 찾을 수 없습니다.' });
    });

    return server;
}

/**
 * 서버를 지정 포트에서 시작한다.
 * @param {number} [port=DEFAULT_PORT] - 포트 번호
 * @returns {import('http').Server}
 */
function startServer(port = DEFAULT_PORT) {
    const server = createServer();
    server.listen(port);
    return server;
}

if (require.main === module) {
    const port = Number(process.env.PORT) || DEFAULT_PORT;
    startServer(port);
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}

module.exports = { createServer, startServer, readJsonBody, sendJson };
