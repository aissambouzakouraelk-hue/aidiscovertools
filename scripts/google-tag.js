/**
 * Shared Google tag for AI Discover Tools.
 *
 * The publisher-supplied AW-17735313498 is a Google Ads destination, not
 * proof of a linked GA4 property. If Google Analytics provides an additional
 * G-XXXXXXXXXX web stream measurement ID, set GA4_MEASUREMENT_ID (or the
 * ga4MeasurementId value in analytics-config.json) to add its destination.
 *
 * This code is injected only in _production, never in the noindex Pages preview.
 * Consent defaults are denied. A CMP must publish consent updates for
 * analytics to store identifiers when a visitor accepts.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'analytics-config.json'), 'utf8'));
const ADS_ID = 'AW-17735313498';
if (config.adsTagId !== ADS_ID) throw new Error('Unexpected Google Ads tag ID; check analytics-config.json');
const ga4Id = String(process.env.GA4_MEASUREMENT_ID || config.ga4MeasurementId || '').trim().toUpperCase();
if (ga4Id && !/^G-[A-Z0-9]{6,}$/.test(ga4Id)) {
  throw new Error('GA4 measurement ID must look like G-XXXXXXXXXX; do not paste an Ads AW- or GTM- ID');
}
const DESTINATIONS = [ADS_ID, ...(ga4Id ? [ga4Id] : [])];
const BEGIN = '<!-- AI Discover Tools Google tag (production only) -->';
const snippet = [
  BEGIN,
  '<script>',
  'window.dataLayer = window.dataLayer || [];',
  'function gtag(){window.dataLayer.push(arguments);}',
  // The Google consent mode defaults must run before all gtag config calls.
  "gtag('consent', 'default', {",
  "  analytics_storage: 'denied',",
  "  ad_storage: 'denied',",
  "  ad_user_data: 'denied',",
  "  ad_personalization: 'denied',",
  "  wait_for_update: 500",
  '});',
  "gtag('js', new Date());",
  ...DESTINATIONS.map(id => "gtag('config', '" + id + "');"),
  '</script>',
  '<script async src="https://www.googletagmanager.com/gtag/js?id=' + ADS_ID + '"></script>',
].join('\n');
function addGoogleTag(html, filename) {
  if (html.includes(BEGIN)) return html;
  if (/www\.googletagmanager\.com\/(?:gtag\/js|gtm\.js)\?id=/i.test(html)) {
    throw new Error('Google tag already present in ' + filename + '. Review duplicates before deploying.');
  }
  if (!/<\/head>/i.test(html)) throw new Error('Missing </head> in ' + filename);
  return html.replace(/<\/head>/i, snippet + '\n</head>');
}
module.exports = { addGoogleTag, ADS_ID, ga4Id, DESTINATIONS, BEGIN };
