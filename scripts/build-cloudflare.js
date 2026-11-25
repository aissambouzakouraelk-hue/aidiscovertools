/**
 * Build a Cloudflare Pages-ready production site with Google's existing IDs,
 * SEO canonicals, ads.txt and consent. Never deploys or changes the domain.
 *
 * Cloudflare Pages:
 *   Build command: node scripts/build-cloudflare.js
 *   Output directory: _production
 *   Production branch: main
 *   Node.js: 22
 */
'use strict';
const { spawnSync } = require('node:child_process');
const node = process.execPath;
const cmds = [
 'scripts/check-site.js',
 'scripts/build-pages-preview.js',
 'scripts/build-reviewed-pages.js',
 'scripts/build-production.js',
 'scripts/check-production.js'
];
const env={...process.env,PAGES_HOSTING:'cloudflare'};
for(const cmd of cmds){
 const result=spawnSync(node,[cmd],{env,stdio:'inherit'});
 if(result.status!==0){
  console.error('Cloudflare build aborted: '+cmd+' failed with exit '+result.status);
  process.exit(result.status||1);
 }
}
console.log('Cloudflare Pages bundle is ready in _production (no deployment requested).');
