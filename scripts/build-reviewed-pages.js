// Static editorial pages for GitHub Pages preview, generated from the verified review subset.
// Staging is intentionally noindex and ad-free; this is NOT a production publishing build.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'_site');
const items=JSON.parse(fs.readFileSync(path.join(root,'tools.json'),'utf8').replace(/^\uFEFF/,''));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=x=>String(x).toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const cats={writing:'ai-writing-tools.html',image:'ai-image-generators.html',video:'ai-video-tools.html',coding:'best-ai-tools-for-developers.html',marketing:'ai-tools-for-marketing.html',productivity:'ai-productivity-tools.html'};
const pars=x=>String(x||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(x=>'<p>'+esc(x).replace(/\n/g,'<br>')+'</p>').join('');
let total=0;
for(const t of items){
  const r=t.review;
  if(!r?.whatItIs)continue;
  const name=esc(t.name), key=slug(t.slug||t.name);
  const dest=path.join(out,'tools',key);
  const pageUrl='https://aidiscovertools.com/tools/'+key+'/';
  const fields=[['What it is',r.whatItIs],['Who it suits',r.whoItIsFor],['Uses',r.bestAt],['Limitations',r.limitations],['Pricing and plans',r.pricing],['Alternatives',r.alternatives],['Verdict',r.verdict]];
  const sections=fields.filter(x=>x[1]).map(x=>'<section class="tool-review-section"><h2>'+esc(x[0])+'</h2>'+pars(x[1])+'</section>').join('');
  const target=t.affiliate?.tryNow||t.affiliateTryUrl||t.affiliateUrl||t.website;
  const isAffiliate=Boolean(t.affiliate?.tryNow||t.affiliateTryUrl||t.affiliateUrl);
  const linkRel=isAffiliate?'noopener noreferrer sponsored nofollow':'noopener noreferrer';
  const siteUrl=/^https:\/\//.test(target||'')?esc(target):'https://aidiscovertools.com/';
  const doc='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>'+name+' overview and alternatives | AI Discover Tools</title><meta name="description" content="'+esc(t.description)+'"><link rel="canonical" href="'+pageUrl+'"><link rel="stylesheet" href="../../styles.css"><link rel="icon" href="../../favicon.svg" type="image/svg+xml"></head><body><header class="hero"><div class="container hero-wrap"><div><p class="title">'+name+'</p><p class="subtitle">Tool overview</p></div><a href="../../index.html" class="btn-secondary">Back to directory</a></div></header><main class="container content-main"><article class="content-shell"><h1>'+name+': uses, limits and plans</h1><p>'+esc(t.description)+'</p><p class="meta-text">Editorial overview based on available product information, not an independent hands-on test. Verify current pricing and features with the provider.</p><p class="meta-text">Some outgoing links may be affiliate links. If a tracked referral qualifies, the site may earn a commission; read our <a href="../../about.html">disclosure and editorial policy</a>.</p><p><a class="btn-secondary" href="'+siteUrl+'" target="_blank" rel="'+linkRel+'">Visit official website</a></p>'+sections+'<section class="tool-review-section"><h2>More options</h2><p>See <a href="../../'+(cats[t.category]||'best-ai-tools.html')+'">'+esc(t.category)+' tools</a> or <a href="../../index.html">browse the directory</a>.</p></section></article></main></body></html>';
  fs.mkdirSync(dest,{recursive:true});fs.writeFileSync(path.join(dest,'index.html'),doc);
  total++;
}
console.log('Generated '+total+' static editorial profiles for staging.');
