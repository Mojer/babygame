// Frame sink for ?render mode (the page itself is served by Vite).
// POST /frame/N (PNG body) → out/frames/NNNN.png, /snap/NAME → out/snaps/NAME.png
// (review stills), POST /done logs the time.
import { createServer } from 'node:http';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const FRAMES = process.env.FRAMES_DIR ?? join(HERE, 'out', 'frames');
const port = +(process.argv[2] ?? 5214);
const SNAPS = join(HERE, 'out', 'snaps');
await mkdir(FRAMES, { recursive: true });
await mkdir(SNAPS, { recursive: true });
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': '*' };

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return res.writeHead(204, CORS).end();
  if (req.method !== 'POST') return res.writeHead(200, { ...CORS, 'Content-Type': 'text/plain' }).end('frame sink');
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  const path = req.url.split('?')[0];
  if (path.startsWith('/frame/')) await writeFile(join(FRAMES, `${path.split('/').pop().padStart(4, '0')}.png`), body);
  if (path.startsWith('/snap/')) await writeFile(join(SNAPS, `${path.split("/").pop()}.jpg`), body);
  if (path === '/done') console.log('render done in', body.toString(), 'ms');
  res.writeHead(204, CORS).end();
}).listen(port, '127.0.0.1', () => console.log(`frame sink on http://127.0.0.1:${port}  → ${FRAMES}`));
