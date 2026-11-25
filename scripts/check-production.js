/** Read-only checks of the production bundle. Must not deploy or change DNS. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'_production');
const read=file=>fs.readFileSync(path.join(out,file),'utf8');
const report=JSON.parse(fs.readFileSync(path.join(root,'production-build-report.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'tools.json'),'utf8').replace(/^\uFEFF/,''));
const slug=value=>String(value).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const sitemap=read('sitemap.xml');
const publisher='pub-7512084984607252';
const adsCode='pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-'+publisher;
assert(read('ads.txt').split(/\r?\n/).some(line=>line.trim()==='google.com, '+publisher+', DIRECT, f08c47fec0942fa0'), 'Missing or incorrect AdSense ads.txt seller record');
assert(read('index.html').includes(adsCode),'Home page is missing AdSense publisher tag');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1].replace(/&amp;/g,'&'));
assert(urls.length>20,'Production sitemap unexpectedly small');
assert(urls.length===new Set(urls).size,'Duplicate sitemap URL');
assert(!sitemap.includes('<lastmod>'),'Sitemap must not invent bulk modification dates');
assert(!sitemap.includes('tool.html?name='),'Do not sitemap parameterized tool templates');
assert(read('robots.txt').includes('Sitemap: https://aidiscovertools.com/sitemap.xml'), 'Wrong sitemap location');
assert(!/noindex/i.test(read('index.html').match(/<meta[^>]+name=["']robots["'][^>]+>/i)?.[0]||''),'Home accidentally noindexed');
for(const url of urls){
  assert(url.startsWith('https://aidiscovertools.com/'),'Unexpected sitemap domain: '+url);
  const pathname=new URL(url).pathname;
  const rel=pathname==='/'?'index.html':pathname.endsWith('/')?pathname.slice(1)+'index.html':pathname.slice(1);
  assert(fs.existsSync(path.join(out,rel)),'Missing sitemap target: '+rel);
  const html=read(rel);
  assert(!/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html),'Noindex page listed in sitemap: '+rel);
  assert(html.includes('<link rel="canonical" href="'+url+'"'),'Incorrect canonical: '+rel);
}
let reviews=0, excluded=0, fallback=0;
for(const tool of catalog){
  const key=slug(tool.slug||tool.name), rel='tools/'+key+'/index.html';
  assert(fs.existsSync(path.join(out,rel)),'Missing legacy tool route '+key);
  const indexed=urls.includes('https://aidiscovertools.com/tools/'+key+'/');
  const html=read(rel);
  if(indexed){reviews++;assert(/<h1\b/i.test(html),'Indexed review missing heading '+key);assert(html.includes(adsCode),'Indexed editorial page missing AdSense tag '+key);}
  else if(tool.review){excluded++;assert(/noindex/i.test(html),'Unverified review must be noindex '+key);}
  else{fallback++;assert(/noindex/i.test(html),'Thin redirect page must be noindex '+key);}
}
assert(report.indexableReviews===reviews,'Report/indexed review mismatch');
assert(report.legacyFallbacks===fallback,'Report/fallback mismatch');
console.log('Production checks OK: '+urls.length+' indexable URLs, '+reviews+' editorial profiles, '+excluded+' held for verification, '+fallback+' legacy redirects. Not deployed.');
