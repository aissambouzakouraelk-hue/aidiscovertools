'use strict';
// Browser-level regression audit for URLs found in Google and all current tool pages.
const { chromium } = require('playwright');
const fs = require('node:fs');
const base = 'https://aidiscovertools.com';
const catalog = JSON.parse(fs.readFileSync('tools.json','utf8').replace(/^\uFEFF/,''));
const gsc = JSON.parse(fs.readFileSync('data/google-search-urls.json','utf8'));
const slug = v => String(v||'').toLowerCase().trim().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
const names = new Map(catalog.map(t=>[slug(t.slug||t.name), t.name]));
const tasks = new Set(gsc.map(x=>new URL(x).pathname+new URL(x).search));
for(const tool of catalog){
  const key=slug(tool.slug||tool.name);
  tasks.add('/tools/'+key+'/');
  tasks.add('/tool?name='+key);
  tasks.add('/tool.html?name='+key);
}
for(const name of fs.readdirSync('.'))if(name.endsWith('.html'))tasks.add('/'+name);
for(const extra of ['/', '/tools/chatgpt.html', '/tool.html?name=descript.html']) tasks.add(extra);
const targets=[...tasks].sort();
const failures=[];
const observedLinks=new Set();
(async()=>{
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:780}});
 // Avoid remote ads/logos timing out; exercise the same-origin app code and catalog.
 await context.route('**/*',route=>{
   try{if(new URL(route.request().url()).hostname!=='aidiscovertools.com')return route.abort();}
   catch(_){}
   return route.continue();
 });
 let cursor=0,done=0;
 async function worker(){
   const page=await context.newPage();
   while(cursor<targets.length){
     const target=targets[cursor++];
     const errors=[];
     const handleError=e=>errors.push(e.message);
     page.on('pageerror',handleError);
     try{
       const response=await page.goto(base+target,{waitUntil:'domcontentloaded',timeout:20000});
       await page.waitForTimeout(600);
       const state=await page.evaluate(()=>({
         heading:(document.querySelector('main h1')||document.querySelector('h1'))?.textContent?.trim()||'',
         hasMain:!!document.querySelector('main'),
         missingTool:document.body.textContent?.includes('Tool not found')||false,
         anchors:[...document.querySelectorAll('a[href]')].map(a=>a.href)
       }));
       for(const link of state.anchors)try{const u=new URL(link);if(u.hostname==='aidiscovertools.com'){u.hash='';observedLinks.add(u.toString())}}catch(_){}
       let problem=!response?.ok()?'HTTP '+response?.status():'';
       if(!problem&&!state.hasMain)problem='Missing page body';
       if(!problem&&state.missingTool)problem='Tool not found displayed';
       if(!problem&&errors.length)problem='JavaScript error: '+errors.slice(0,2).join(' | ');
       const source=new URL(base+target);
       const query=source.searchParams.get('name');
       const nameFromQuery=query&&names.get(slug(query.replace(/\.html?$/i,'')));
       const staticSlug=/^\/tools\/([^/.]+)\/?$/.exec(source.pathname)?.[1];
       const nameFromPath=staticSlug&&names.get(staticSlug);
       const expectedName=nameFromQuery||nameFromPath;
       if(!problem&&expectedName&&!state.heading.toLowerCase().includes(expectedName.toLowerCase()))problem='Wrong tool shown: expected '+expectedName+', got '+state.heading;
       if(!problem&&(/^\/tool(?:\.html)?$/.test(source.pathname))&&!query&&!page.url().includes('/ai-tool-finder.html'))problem='Bare legacy tool URL did not open finder';
       if(problem)failures.push({url:target,final:page.url(),heading:state.heading,reason:problem});
     }catch(error){failures.push({url:target,reason:String(error.message||error)})}
     finally{
       page.off('pageerror',handleError);
       done++;
       if(done%60===0)console.log('Browser progress: '+done+'/'+targets.length+' pages.');
     }
   }
   await page.close();
 }
 await Promise.all(Array.from({length:8},worker));
 await browser.close();
 console.log('Browser pages: '+targets.length+' checked; '+failures.length+' failures.');
 console.log('Browser errors: '+JSON.stringify(failures.slice(0,85)));
 const linkRows=[...observedLinks];
 let i=0;
 const linkFailures=[];
 async function linkWorker(){
   while(i<linkRows.length){
     const url=linkRows[i++];
     try{
       const r=await fetch(url,{signal:AbortSignal.timeout(16000),headers:{'User-Agent':'AI-Discover-Tools-Internal-Link-Audit/1.0'}});
       if(!r.ok)linkFailures.push({url,reason:'HTTP '+r.status,final:r.url});
       else{
         const source=new URL(url),dest=new URL(r.url);
         if(source.searchParams.has('name')&&!dest.searchParams.has('name')&&
           !dest.pathname.startsWith('/tools/')) linkFailures.push({url,reason:'Tool name lost',final:r.url});
       }
     }catch(e){linkFailures.push({url,reason:String(e.message||e)})}
   }
 }
 await Promise.all(Array.from({length:12},linkWorker));
 const report={browserPages:targets.length,browserFailures:failures,uniqueInternalLinks:linkRows.length,linkFailures};
 fs.writeFileSync('browser-link-audit-report.json',JSON.stringify(report,null,2));
 console.log('Internal links discovered in browser: '+linkRows.length+' checked; '+linkFailures.length+' failures.');
 console.log('Link errors: '+JSON.stringify(linkFailures.slice(0,90)));
 if(process.env.GITHUB_STEP_SUMMARY){
   fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
   '# Browser and internal link audit\n\n' +
   '- Pages opened: '+targets.length+'\n' +
   '- Pages with errors: '+failures.length+'\n' +
   '- Internal links checked: '+linkRows.length+'\n' +
   '- Internal links with errors: '+linkFailures.length+'\n\n' +
   [...failures,...linkFailures].slice(0,30).map(x=>'- '+x.url+' — '+x.reason).join('\n')+'\n');
 }
 if(failures.length||linkFailures.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1});
