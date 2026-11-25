/** Read-only checks of the production bundle. Must not deploy or change DNS. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'_production');
const read=file=>fs.readFileSync(path.join(out,file),'utf8');
const report=JSON.parse(fs.readFileSync(path.join(root,'production-build-report.json'),'utf8'));
const catalog=JSON.parse(fs.readFileSync(path.join(root,'tools.json'),'utf8').replace(/^\uFEFF/,''));
const { ADS_ID, ga4Id, BEGIN } = require('./google-tag.js');
const slug=value=>String(value).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const sitemap=read('sitemap.xml');
const publisher='pub-7512084984607252';
const adsCode='pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-'+publisher;
assert(read('ads.txt').split(/\r?\n/).some(line=>line.trim()==='google.com, '+publisher+', DIRECT, f08c47fec0942fa0'), 'Missing or incorrect AdSense ads.txt seller record');
assert(read('index.html').includes(adsCode),'Home page is missing AdSense publisher tag');
const assertTag = (html, name) => {
  const googleUrl = 'https://www.googletagmanager.com/gtag/js?id=' + ADS_ID;
  assert(html.includes(BEGIN), 'Missing Google tag in ' + name);
  assert(html.includes(googleUrl), 'Google tag loader missing in ' + name);
  assert(html.includes("gtag('config', '" + ADS_ID + "')"), 'Google Ads configuration missing in ' + name);
  assert(html.indexOf("gtag('consent', 'default'") < html.indexOf("gtag('config',"), 'Consent defaults must precede tag config in ' + name);
  if (ga4Id) {
    assert(html.includes("gtag('config', '" + ga4Id + "', { send_page_view: false })"), 'GA4 config must suppress automatic pageviews in ' + name);
    assert(html.includes('src="/analytics-consent.js"'), 'Missing analytics consent handler in ' + name);
  }
  assert((html.match(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/g) || []).length === 1, 'Duplicate Google loaders in ' + name);
};
assertTag(read('index.html'), 'index.html');
assert(fs.existsSync(path.join(out, 'analytics-consent.js')), 'Missing bundled analytics consent script');
assert(read('analytics-consent.js').includes("data-aidt-choice="), 'Missing explicit Analytics opt-in controls');
assert(read('analytics-consent.js').includes('CONSENT_MODE_DATA_READY'), 'Missing Google CMP consent integration');

assert(read('404.html').includes('name="robots" content="noindex,follow"'), 'Custom missing-link page must be noindex');
assert(read('404.html').includes('/ai-tool-finder.html'), 'Custom missing-link page must offer the tool finder');
assert(read('tool-page.js').includes('window.location.replace("/ai-tool-finder.html")'), 'Bare Google tool URLs must redirect to finder');
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
  assertTag(html, rel);
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
for(const tool of catalog){
  const key=slug(tool.slug||tool.name), rel='tools/'+key+'/index.html';
  if(!tool.review?.whatItIs) assert(!read(rel).includes(BEGIN), 'Tag must be absent from redirect fallback '+key);
}
assert(report.indexableReviews===reviews,'Report/indexed review mismatch');
assert(report.legacyFallbacks===fallback,'Report/fallback mismatch');
console.log('Production checks OK: '+urls.length+' indexable URLs, '+reviews+' editorial profiles, '+excluded+' held for verification, '+fallback+' legacy redirects. Not deployed.');
