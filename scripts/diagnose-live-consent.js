'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const ctx=await browser.newContext({viewport:{width:1200,height:800}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('https://aidiscovertools.com/',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForTimeout(6500);
  async function state(label){
    const obj=await page.evaluate(()=>{
      const args=(window.dataLayer||[]).map(v=>{try{return Array.from(v)}catch(_){return[]}}).filter(v=>['consent','config','event'].includes(v[0])).map(v=>{
       const out={type:v[0],operation: v[1]};
       if(v[0]==='consent') out.state=v[2];
       if(v[0]==='config') out.id=v[1];
       if(v[0]==='event') out.event=v[1];
       return out;
      });
      let cmp=null,cmpError=null;
      try{if(typeof window.googlefc?.getGoogleConsentModeValues==='function') cmp=window.googlefc.getGoogleConsentModeValues();}
      catch(e){cmpError=String(e.message)}
      return {
       scripts:{analyticsConsent:!!document.querySelector('script[src*="analytics-consent.js"]'),analyticsConfig:!!document.documentElement.outerHTML.includes('G-ZRFF519KR8')},
       cmp:{tcf:typeof window.__tcfapi,api:typeof window.googlefc?.getGoogleConsentModeValues,callbackQueue:window.googlefc?.callbackQueue?.length||0,values:cmp,error:cmpError},
       local:{choice:localStorage.getItem('aidt-analytics-choice-v1'),banner:!!document.querySelector('#aidt-analytics-choice'),settings:!!document.querySelector('#aidt-analytics-settings')},
       commands:args
      };
    });
    console.log(label+' '+JSON.stringify(obj));
    return obj;
  }
  console.log('LIVE HTTP '+response.status()+' URL '+page.url());
  let before=await state('BEFORE');
  if(before.local.banner){
    await page.locator('[data-aidt-choice="granted"]').click();
    await page.waitForTimeout(1000);
    const after=await state('AFTER_EXPLICIT_ACCEPT');
    const update=after.commands.some(x=>x.type==='consent'&&x.operation==='update'&&x.state?.analytics_storage==='granted');
    console.log('LIVE EXPLICIT ACCEPT CONSENT UPDATE '+update);
    assert(update,'The visitor clicked accept but consent update was missing from dataLayer');
  }else{
    console.log('LIVE NO_LOCAL_BANNER; CMP owner/TCF controls the choice or unknown');
  }
  console.log('JS ERRORS '+JSON.stringify(errors));
  await ctx.close();
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
