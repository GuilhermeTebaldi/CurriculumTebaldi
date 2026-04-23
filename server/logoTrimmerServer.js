import http from 'node:http';
import { request as httpRequest } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import net from 'node:net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3005);
const API_HOST = process.env.API_HOST || '127.0.0.1';
const API_PORT = Number(process.env.API_PORT || 3001);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

async function main() {
  await ensureApiServer();

  const server = http.createServer((req, res) => {
    if (!req.url) {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname.startsWith('/api')) {
      proxyToApi(req, res);
      return;
    }

    serveStatic(url.pathname, res);
  });

  server.on('error', (error) => {
    console.error('LogoTrimmer server error:', error);
  });

  server.listen(PORT, HOST, () => {
    console.log(`LogoTrimmer server listening on http://${HOST}:${PORT}`);
  });
}

function serveStatic(pathname, res) {
  if (!existsSync(DIST_DIR)) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Missing dist/ folder. Run "npm run build" once to generate the production files.');
    return;
  }

  let safePath = decodeURIComponent(pathname);
  if (safePath === '/') safePath = '/index.html';

  const resolved = resolvePath(DIST_DIR, safePath);
  let targetPath = resolved;

  if (!resolved || !existsSync(resolved) || !statSync(resolved).isFile()) {
    targetPath = path.join(DIST_DIR, 'index.html');
  }

  if (!existsSync(targetPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  createReadStream(targetPath).pipe(res);
}

function resolvePath(root, requestPath) {
  const normalized = path.normalize(requestPath).replace(/^\.+/, '');
  const fullPath = path.join(root, normalized);
  if (!fullPath.startsWith(root)) return null;
  return fullPath;
}

function proxyToApi(req, res) {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    method: req.method,
    path: req.url,
    headers: {
      ...req.headers,
      host: `${API_HOST}:${API_PORT}`,
    },
  };

  const proxyReq = httpRequest(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API server unavailable' }));
  });

  req.pipe(proxyReq);
}

async function ensureApiServer() {
  const isUp = await isPortOpen(API_PORT, API_HOST);
  if (isUp) return;

  const serverPath = path.join(__dirname, 'index.js');
  const child = spawn('node', [serverPath], {
    cwd: PROJECT_ROOT,
    stdio: 'ignore',
    detached: true,
  });

  child.unref();
}

function isPortOpen(port, host) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host }, () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => resolve(false));
  });
}

main().catch((error) => {
  console.error('Failed to start LogoTrimmer server:', error);
  process.exit(1);
});
