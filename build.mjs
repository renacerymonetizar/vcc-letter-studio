import fs from 'node:fs';

const source = fs.readFileSync('cover-source.html', 'utf8');

const match = source.match(/data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)/);
if (!match) {
  throw new Error('Approved Visual Letter Studio artwork not found in cover source');
}

const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
const imageBytes = Buffer.from(match[2], 'base64');

fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/assets', { recursive: true });

fs.writeFileSync('dist/assets/visual-letter-studio.' + ext, imageBytes);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replaceAll(
  'assets/visual-letter-studio.png',
  'assets/visual-letter-studio.' + ext
);
html = html.replaceAll(
  'assets/visual-letter-studio.webp',
  'assets/visual-letter-studio.' + ext
);

fs.writeFileSync('dist/index.html', html);
fs.copyFileSync('styles.css', 'dist/styles.css');
fs.copyFileSync('app.js', 'dist/app.js');

console.log('Built Visual Letter Studio with approved artwork and split app files:', ext, imageBytes.length, 'bytes');
