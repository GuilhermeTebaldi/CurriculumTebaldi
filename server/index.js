import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { GoogleGenAI } from '@google/genai';

const DEFAULT_PORT = 3001;
const DEFAULT_HOST = process.env.HOST || '127.0.0.1';
const MAX_BODY_SIZE = 1_000_000; // 1MB

const corsOrigin = process.env.CORS_ORIGIN || '*';
const apiKey = resolveApiKey();

let aiClient = null;

export async function startServer({ port, host } = {}) {
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error('Unhandled server error:', error);
      sendJson(res, 500, { error: 'Internal server error' });
    });
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port ?? DEFAULT_PORT, host ?? DEFAULT_HOST, () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address ? address.port : port ?? DEFAULT_PORT;
      const actualHost = host ?? DEFAULT_HOST;
      console.log(`Gemini server listening on http://${actualHost}:${actualPort}`);
      resolve({ server, port: actualPort, host: actualHost });
    });
  });
}

async function handleRequest(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (!apiKey) {
    sendJson(res, 500, { error: 'Missing GEMINI_API_KEY on server' });
    return;
  }

  const body = await readJson(req);
  if (!body) {
    sendJson(res, 400, { error: 'Invalid JSON body' });
    return;
  }

  if (url.pathname === '/api/optimize') {
    await handleOptimize(body, res);
    return;
  }

  if (url.pathname === '/api/translate') {
    await handleTranslate(body, res);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

async function handleOptimize(body, res) {
  const text = typeof body.text === 'string' ? body.text : '';
  const context = typeof body.context === 'string' ? body.context : '';

  if (!text.trim()) {
    sendJson(res, 400, { error: 'Missing "text" field' });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    sendJson(res, 500, { error: 'Gemini client not initialized' });
    return;
  }

  const prompt = `Agisci come un esperto HR italiano. Ottimizza il seguente testo per un Curriculum Vitae professionale in Italia.\nContesto: ${context}.\nTesto originale: "${text}".\nRispondi solo con il testo ottimizzato in italiano formale.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const output = response?.text || text;
    sendJson(res, 200, { text: output });
  } catch (error) {
    console.error('Gemini API Error (optimize):', error);
    sendJson(res, 500, { error: 'Gemini request failed' });
  }
}

async function handleTranslate(body, res) {
  const text = typeof body.text === 'string' ? body.text : '';

  if (!text.trim()) {
    sendJson(res, 400, { error: 'Missing "text" field' });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    sendJson(res, 500, { error: 'Gemini client not initialized' });
    return;
  }

  const prompt = `Traduci professionalmente in italiano per un CV: "${text}". Rispondi solo con la traduzione.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const output = response?.text || text;
    sendJson(res, 200, { text: output });
  } catch (error) {
    console.error('Gemini API Error (translate):', error);
    sendJson(res, 500, { error: 'Gemini request failed' });
  }
}

function getAiClient() {
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readJson(req) {
  let received = 0;
  const chunks = [];

  for await (const chunk of req) {
    received += chunk.length;
    if (received > MAX_BODY_SIZE) {
      throw new Error('Payload too large');
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return null;

  const raw = Buffer.concat(chunks).toString('utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function resolveApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.API_KEY) return process.env.API_KEY;

  const envPath = findEnvFile();
  if (!envPath) return null;

  const raw = readFileSync(envPath, 'utf8');
  const env = parseEnv(raw);
  return env.GEMINI_API_KEY || env.API_KEY || null;
}

function findEnvFile() {
  const candidates = ['.env.local', '.env'];
  for (const filename of candidates) {
    const fullPath = path.resolve(process.cwd(), filename);
    if (existsSync(fullPath)) return fullPath;
  }
  return null;
}

function parseEnv(raw) {
  const result = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const index = line.indexOf('=');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const currentFile = fileURLToPath(import.meta.url);
const isMain = process.argv[1] && path.resolve(process.argv[1]) === currentFile;

if (isMain) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
