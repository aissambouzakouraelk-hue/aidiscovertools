'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const base='https://aidiscovertools.com';
const urls=[
  '/', '/tool.html', '/tool',
  '/tool?name=deepai-image-generator',
  '/tool?name=opus-clip',
  '/tool?name=canva-magic-media',
  '/tool.html?name=shortwave',
  '/tool.html?name=ink-editor',
  '/tool.html?name=descript.html',
  '/tools/chatgpt/', '/tools/claude/',
  '/tools/bito/', '/tools/shortwave',
  '/tools/chatgpt.html',
  '/ai-tools-for-blogging','/ai-tools-for-instagram','/ai-trends',
  '/chatgpt-alternatives.html','/best-free-ai-tools.html',
  '/ai-tool-finder.html?q=write%20blog%20posts',
  '/ai-tools-for-seo.html','/runway-alternatives',
  '/top-ai-tools.html','/ai-trends.html',
  '/best-ai-tools-2026.html'
];
(async()=>{
 const browser=await chromium.launch({headless:true});
 const errors=[];
 for(const url of urls){
   const page=await browser.newPage({viewport:{width:1280,height:800}});
   const runtimeErrors=[];
   page.on('pageerror',e=>runtimeErrors.push(e.message));
   await page.route('**/*',route=>{
     try {const u=new URL(route.request().url());if(u.hostname!=='aidiscovertools.com')return route.abort();}
     catch(_){}
     return route.continue();
   });
   try{
     const response=await page.goto(base+url,{waitUntil:'domcontentloaded',timeout:20000});
     await page.waitForTimeout(1400);
     const state=await page.evaluate(()=>({
       heading:(document.querySelector('main h1')||document.querySelector('h1'))?.textContent?.trim()||'',
       missingTool:document.body.textContent.includes('Tool not found'),
       mainPresent:!!document.querySelector('main'),
       toolContent:document.querySelector('#toolContainer')?.textContent?.trim().slice(0,110)||'',
       title:document.title
     }));
     const problem= !response?.ok()?('HTTP '+response?.status()):!state.mainPresent?'No main':state.missingTool?'Tool not found rendered':runtimeErrors.length?'JS '+runtimeErrors.slice(0,3).join('|'):'';
     const row={url,final:page.url(),status:response?.status(),...state,errors:runtimeErrors,problem};
     console.log((problem?'FAIL ':'PASS ')+JSON.stringify(row));
     if(problem)errors.push(row);
   }catch(e){console.log('FAIL '+url+' '+e.message);errors.push({url,problem:e.message});}
   await page.close();
 }
 await browser.close();
 fs.writeFileSync('browser-link-audit-report.json',JSON.stringify({checked:urls.length,errors},null,2));
 console.log('BROWSER AUDIT: '+urls.length+' tested; '+errors.length+' failures.');
 if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
