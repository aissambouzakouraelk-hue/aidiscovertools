/**
 * Builds a production-ready, indexable bundle in _production WITHOUT deploying it.
 * Run after build-pages-preview.js and build-reviewed-pages.js have populated _site.
 * This is deliberately separate from the noindex GitHub Pages preview.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const preview = path.join(root, '_site');
const output = path.join(root, '_production');
const domain = 'https://aidiscovertools.com';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'tools.json'), 'utf8').replace(/^\uFEFF/, ''));
const slug = value => String(value).toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const verifyMarker = /\[VERIFY\]/i;
const indexable = html => !/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
const write = (name, value) => fs.writeFileSync(path.join(output, name), value, 'utf8');
if (!fs.existsSync(path.join(preview, 'tools'))) {
  throw new Error('Missing staged tool pages. First run the preview and reviewed-page generators.');
}
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
const assetExtensions = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml']);
const urls = [];
let copiedPages = 0;
for (const item of fs.readdirSync(root, { withFileTypes: true })) {
  if (!item.isFile() || !assetExtensions.has(path.extname(item.name).toLowerCase())) continue;
  if (item.name === 'sitemap.xml' || item.name === 'robots.txt') continue;
  let content = fs.readFileSync(path.join(root, item.name));
  if (item.name.endsWith('.html')) {
    let html = content.toString('utf8');
    const fullUrl = item.name === 'index.html' ? domain + '/' : domain + '/' + item.name;
    const canonicalTag = '<link rel="canonical" href="' + fullUrl + '" />';
    const canonicalPattern = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i;
    html = canonicalPattern.test(html) ? html.replace(canonicalPattern, canonicalTag)
      : html.replace(/<\/head>/i, '  ' + canonicalTag + '\n</head>');
    // JS-driven search and generic tool templates aren't useful sitemap entries.
    if (!['search.html', 'tool.html'].includes(item.name) && indexable(html)) urls.push(fullUrl);
    content = Buffer.from(html, 'utf8');
    copiedPages++;
  }
  fs.writeFileSync(path.join(output, item.name), content);
}
let reviewed = 0, indexedReviews = 0, legacyFallbacks = 0;
const needsVerification = [];
for (const tool of catalog) {
  const key = slug(tool.slug || tool.name);
  const staged = path.join(preview, 'tools', key, 'index.html');
  if (!key || !fs.existsSync(staged)) throw new Error('Missing staged route: ' + key);
  const folder = path.join(output, 'tools', key);
  fs.mkdirSync(folder, { recursive: true });
  let html = fs.readFileSync(staged, 'utf8');
  if (tool.review?.whatItIs) {
    reviewed++;
    const contentNeedsVerification = Object.values(tool.review).some(value => verifyMarker.test(String(value)));
    if (contentNeedsVerification) {
      needsVerification.push(tool.name);
      // Keep page browseable but do not invite Google to index unverified details.
      html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,follow">');
    } else {
      html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index,follow">');
      urls.push(domain + '/tools/' + key + '/');
      indexedReviews++;
    }
  } else {
    legacyFallbacks++;
    // Existing redirect placeholders remain noindex. They are compatibility routes, not content.
    html = html.replace(/<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="noindex,follow">');
  }
  fs.writeFileSync(path.join(folder, 'index.html'), html);
}
const unique = [...new Set(urls)];
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  unique.map(url => '  <url><loc>' + url.replace(/&/g, '&amp;') + '</loc></url>').join('\n') +
  '\n</urlset>\n';
write('sitemap.xml', xml);
write('robots.txt', 'User-agent: *\nAllow: /\n\nSitemap: ' + domain + '/sitemap.xml\n');
write('.nojekyll', '');
const report = { rootPages: copiedPages, tools: catalog.length, detailedReviews: reviewed,
  indexableReviews: indexedReviews, legacyFallbacks, indexableSitemapUrls: unique.length,
  reviewsWithVerificationMarkers: needsVerification,
  note: 'Build output only. DNS and custom domain are unchanged; no files have been deployed.' };
fs.writeFileSync(path.join(root, 'production-build-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log('Production bundle prepared (NOT deployed): ' + JSON.stringify(report));
