/** Prevent staging/production mix-ups before connecting Netlify to GitHub. */
'use strict';
const fs = require('node:fs');
const text = fs.readFileSync('netlify.toml','utf8');
const fail = message => { throw new Error('Netlify configuration: ' + message); };
const has = (section, key, value) => {
  const pattern = new RegExp('\\[' + section.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + '\\]([\\s\\S]*?)(?=\\n\\s*\\[|$)');
  const match = text.match(pattern);
  if (!match || !match[1].includes(key + ' = "' + value + '"')) fail('Missing ' + key + ' = ' + value + ' under [' + section + ']');
};
has('build', 'publish', '_production');
has('context.deploy-preview', 'publish', '_site');
has('context.branch-deploy', 'publish', '_site');
const required = ['scripts/check-site.js','scripts/build-pages-preview.js','scripts/build-reviewed-pages.js','scripts/build-production.js','scripts/check-production.js'];
for (const file of required) if (!text.includes(file)) fail('Missing build step ' + file);
if (/from\s*=\s*["']\/tools\/\*/.test(text)) fail('Catch-all /tools/* redirect would endanger canonical editorial pages');
if (!fs.existsSync('ads.txt')) fail('ads.txt is missing in source');
console.log('Netlify configuration OK: production -> _production, PR/branch previews -> _site.');
