/* Where the prototype lives: the kit keeps it at prototype/; a product repo keeps it at docs/design/prototype/
   (platform-prototype skill), with screenshots next to it. Every tool here resolves paths through this file. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const PROTO = ['prototype', 'docs/design/prototype'].map(d => path.join(ROOT, d)).find(d => fs.existsSync(path.join(d, 'index.html')));
if (!PROTO) throw new Error('No prototype/index.html or docs/design/prototype/index.html under ' + ROOT);
const SHOTS = fs.existsSync(path.join(ROOT, 'docs/design')) && PROTO.includes('docs/design') ? path.join(ROOT, 'docs/design/screenshots') : path.join(ROOT, 'screenshots');
module.exports = { ROOT, PROTO, SHOTS, HTML: path.join(PROTO, 'index.html'), SRC: path.join(PROTO, 'src') };
