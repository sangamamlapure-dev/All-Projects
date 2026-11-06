/**
 * AcadFlow Container Healthcheck Probe
 * Queries /api/health and exits 0 on HTTP 200, or 1 on failure.
 */
const http = require('http');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '127.0.0.1';

const options = {
  hostname: HOST === '0.0.0.0' ? '127.0.0.1' : HOST,
  port: PORT,
  path: '/api/health',
  method: 'GET',
  timeout: 4000,
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (parsed.status === 'healthy') {
          process.exit(0);
        }
      } catch {
        // Continue to exit 1
      }
      process.exit(0);
    });
  } else {
    process.exit(1);
  }
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.on('error', () => {
  process.exit(1);
});

req.end();
