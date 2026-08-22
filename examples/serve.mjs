#!/usr/bin/env node
// A dependency-free static server for the examples.
//
//     node examples/serve.mjs        →  http://localhost:8080
//
// ⚠ IT EXISTS FOR ONE REASON: THE CORRECT MIME TYPES. Opening the examples with
//   file:// does not work (ES modules are blocked by CORS), and a server that
//   sends knv2lw.wasm as application/octet-stream costs an afternoon. Any real
//   web server does this right; this is here so you do not need one to look.
//
// Not for production. It serves the repository directory and nothing else.

import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.jsx': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.md': 'text/plain; charset=utf-8',
};

createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, url);

  // Contain every request inside ROOT: `..` and absolute paths cannot escape.
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('forbidden');
    return;
  }

  try {
    if (statSync(file).isDirectory()) file = path.join(file, 'index.html');
  } catch {
    res.writeHead(404).end('not found: ' + url);
    return;
  }

  let size;
  try {
    size = statSync(file).size;
  } catch {
    res.writeHead(404).end('not found: ' + url);
    return;
  }

  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
    'Content-Length': size,
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log('\n  {{PACKAGE}} examples\n');
  console.log('    http://localhost:' + PORT + '/examples/vanilla/');
  console.log('    http://localhost:' + PORT + '/examples/react/');
  console.log('    http://localhost:' + PORT + '/examples/live-websocket/\n');
});
