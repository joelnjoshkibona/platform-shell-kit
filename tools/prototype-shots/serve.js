/* Serves the prototype to a Playwright context with everything it loads from the internet answered from node_modules
   (Vue, lucide, Highcharts, Geist) and a locally compiled Tailwind file, so shots are offline and deterministic.
   Used by shoot.js (screenshots) and tools/help (the user guide's marked screenshots, P98).
   http://proto/__root/<path> serves <repo>/<path> (the help screenshots the prototype's Help pages show). */
const fs = require('fs');
const path = require('path');
const L = require('./layout');

const FONT_DIRS = ['geist', 'geist-mono'].map(n => path.dirname(require.resolve(`@fontsource/${n}/package.json`)));
const FONTS_CSS = FONT_DIRS.flatMap(dir => ['400', '500', '600', '700'].map(w => path.join(dir, w + '.css')))
  .filter(f => fs.existsSync(f))
  .map(f => fs.readFileSync(f, 'utf8').replace(/url\(\.\/files\/([^)]+)\)/g, (m, file) => `url(http://fonts.local/${path.basename(path.dirname(f))}/${file})`))
  .join('\n');
let HTML = null, CSS = null;

async function routeProto(ctx, initRoute) {
  HTML = HTML || fs.readFileSync(L.HTML, 'utf8');
  CSS = CSS || fs.readFileSync(path.resolve(__dirname, '.tw.css'), 'utf8');
  await ctx.route('**/*', r => {
    const u = r.request().url();
    if (u.includes('cdn.tailwindcss.com')) return r.fulfill({ body: 'window.tailwind={};', contentType: 'text/javascript' });
    if (u.includes('vue.global')) return r.fulfill({ path: require.resolve('vue/dist/vue.global.prod.js') });
    if (u.includes('lucide')) return r.fulfill({ path: require.resolve('lucide/dist/umd/lucide.min.js') });
    if (u.includes('/npm/highcharts@')) return r.fulfill({ path: path.join(path.dirname(require.resolve('highcharts/package.json')), u.split(/highcharts@[^/]+\//)[1]), contentType: 'text/javascript' });   // P96: charts load on report pages only
    if (u.includes('fonts.googleapis.com')) return r.fulfill({ body: FONTS_CSS, contentType: 'text/css' });
    if (u.startsWith('http://fonts.local/')) {
      const [pkg, file] = u.slice('http://fonts.local/'.length).split('/');
      const dir = FONT_DIRS.find(d => path.basename(d) === pkg);
      return dir ? r.fulfill({ path: path.join(dir, 'files', file) }) : r.abort();
    }
    if (u.startsWith('http://proto/__root/')) {
      const f = path.resolve(L.ROOT, decodeURIComponent(u.slice('http://proto/__root/'.length).split(/[?#]/)[0]));
      return f.startsWith(L.ROOT + path.sep) && fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404, body: '' });
    }
    if (u.startsWith('http://proto/')) return r.fulfill({ contentType: 'text/html', body: '<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>' + CSS + '</style></head><body><script>window.__INIT_ROUTE=' + JSON.stringify(initRoute) + ';window.__HELP_BASE="/__root/"</script>' + HTML + '</body></html>' });
    return r.abort();
  });
}
module.exports = { routeProto, FONTS_CSS, FONT_DIRS };
