'use strict';
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.CHECK_BASE_URL || 'http://127.0.0.1:8765';
const siteHost = new URL(base).hostname;
const events = async page => page.evaluate(() => (window.dataLayer || [])
  .map(e => {try{return Array.from(e)}catch(_){return []}}));
async function makePage(browser, withCmp) {
  const context = await browser.newContext({viewport:{width:1280,height:800}});
  await context.route('**/*',route=>{
    const u = new URL(route.request().url());
    return u.hostname === siteHost ? route.continue() : route.abort();
  });
  if (withCmp) await context.addInitScript(() => { window.__tcfapi = function(){}; });
  const page = await context.newPage();
  await page.goto(base+'/',{waitUntil:'domcontentloaded'});
  return {page,context};
}
(async()=>{
 const browser=await chromium.launch({headless:true});
 let tested=0;
 try {
   let {page,context}=await makePage(browser,false);
   await page.locator('#aidt-analytics-choice').waitFor({state:'visible',timeout:7000});
   let ev=await events(page);
   assert(!ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='granted'),
     'Analytics granted before a visitor chose it');
   await page.locator('[data-aidt-choice="granted"]').click();
   ev=await events(page);
   assert(ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='granted'),
     'Accept button must grant analytics storage');
   assert.equal(ev.filter(e=>e[0]==='event'&&e[1]==='page_view').length,1,
     'Explicit accept must send exactly one GA4 page_view');
   tested++;
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#aidt-analytics-settings').waitFor({state:'visible',timeout:7000});
   ev=await events(page);
   assert(ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='granted'),
     'Analytics choice should persist across pages');
   assert.equal(ev.filter(e=>e[0]==='event'&&e[1]==='page_view').length,1,
     'Stored opt-in should produce one GA4 page_view');
   await page.locator('#aidt-analytics-settings').click();
   await page.locator('[data-aidt-choice="denied"]').click();
   ev=await events(page);
   assert(ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='denied'),
     'User must be able to withdraw analytics consent');
   tested++;
   await context.close();

   ({page,context}=await makePage(browser,true));
   await page.waitForTimeout(2400);
   assert.equal(await page.locator('#aidt-analytics-choice').count(),0,
     'Do not display an independent analytics banner when an IAB TCF CMP is active');
   await page.evaluate(()=>{
     window.googlefc.getGoogleConsentModeValues=()=>({analyticsStoragePurposeConsentStatus:1});
     const listener=window.googlefc.callbackQueue.find(x=>x.CONSENT_MODE_DATA_READY);
     listener.CONSENT_MODE_DATA_READY();
   });
   ev=await events(page);
   assert(ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='granted'),
     'Explicit consent from Google CMP must update analytics');
   assert.equal(ev.filter(e=>e[0]==='event'&&e[1]==='page_view').length,1);
   tested++;
   await context.close();

   ({page,context}=await makePage(browser,true));
   await page.evaluate(()=>{
     window.googlefc.getGoogleConsentModeValues=()=>({analyticsStoragePurposeConsentStatus:2});
     const listener=window.googlefc.callbackQueue.find(x=>x.CONSENT_MODE_DATA_READY);
     listener.CONSENT_MODE_DATA_READY();
   });
   ev=await events(page);
   assert(ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='denied'),
     'Rejection in Google CMP must remain denied');
   assert.equal(ev.filter(e=>e[0]==='event'&&e[1]==='page_view').length,0,
     'No analytics pageviews after rejecting CMP analytics consent');
   tested++;
   await context.close();

   // Actual bug: a Google TCF API exists while the analytics purpose is
   // NOT_CONFIGURED (4). The previous code suppressed all analytics controls.
   ({page,context}=await makePage(browser,true));
   await page.evaluate(()=>{
     window.googlefc.getGoogleConsentModeValues=()=>({analyticsStoragePurposeConsentStatus:4});
     const listener=window.googlefc.callbackQueue.find(x=>x.CONSENT_MODE_DATA_READY);
     listener.CONSENT_MODE_DATA_READY();
   });
   await page.locator('#aidt-analytics-choice').waitFor({state:'visible',timeout:7000});
   ev=await events(page);
   assert(!ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='granted'),
     'TCF without configured analytics must not grant consent automatically');
   await page.locator('[data-aidt-choice="granted"]').click();
   ev=await events(page);
   assert(ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='granted'),
     'TCF with analytics NOT_CONFIGURED should respect explicit local opt-in');
   tested++;
   await context.close();

   // Some real browsers expose __tcfapi before Funding Choices provides any
   // analytics decision. In that case, the visitor must still be able to
   // explicitly choose Analytics using the separate preference control.
   ({page,context}=await makePage(browser,true));
   await page.locator('#aidt-analytics-settings').waitFor({state:'visible',timeout:7000});
   ev=await events(page);
   assert(!ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='granted'),
     'TCF stub must never automatically grant Analytics without user permission');
   await page.locator('#aidt-analytics-settings').click();
   await page.locator('[data-aidt-choice="granted"]').click();
   ev=await events(page);
   assert(ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='granted'),
     'Manual Analytics acceptance must work when TCF is present but silent');
   tested++;
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#aidt-analytics-settings').waitFor({state:'visible',timeout:7000});
   ev=await events(page);
   assert(ev.some(e=>e[0]==='consent'&&e[1]==='update'&&e[2]?.analytics_storage==='granted'),
     'Remembered explicit Analytics acceptance must be applied with a silent TCF stub');
   tested++;
   await context.close();

   console.log('ANALYTICS CONSENT TESTS: '+tested+' passed (explicit choice, persistence and revocation, CMP accept/deny, TCF unconfigured, silent TCF stub).');
 } finally {
   await browser.close();
 }
})().catch(e=>{console.error(e);process.exitCode=1});
