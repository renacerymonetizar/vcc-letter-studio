import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync('cover-source.html', 'utf8');
const match = source.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
if (!match) throw new Error('Approved Visual Letter Studio image not found in cover source');

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/assets', { recursive: true });

fs.writeFileSync(
  'dist/assets/visual-letter-studio.png',
  Buffer.from(match[1], 'base64')
);

fs.copyFileSync('index.html', 'dist/index.html');
console.log('Built Visual Letter Studio with approved full-quality artwork');
