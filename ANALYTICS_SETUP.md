# Google Analytics 4 and Google tag setup

Current publisher-supplied Google tag ID: `AW-17735313498`. This is a Google Ads identifier. It might also appear as a tag identifier associated with a GA4 web stream, **but a linked GA4 property has not been verified**. Do not invent a `G-` ID.

## Already implemented
- The production build injects a valid **gtag.js** loader and `gtag('config','AW-17735313498')` on every root HTML page and on detailed `/tools/<slug>/` profiles.
- Redirect-only placeholder routes do not load the tag (avoids duplicate page views).
- Google consent mode storage defaults to denied (analytics_storage, ad_storage, ad_user_data and ad_personalization) before tag configuration.
- Google AdSense's existing script and `ads.txt` are unchanged.
- The GitHub Pages staging preview remains noindex and without Google Ads/Analytics tag.
- Build tests reject duplicate tag installations and check canonical pages' Google tag.

## To enable traffic stats in Google Analytics 4
1. Go to [Google Analytics](https://analytics.google.com/), choose your AI Discover Tools property, then **Admin → Data streams → Web stream** for `aidiscovertools.com`.
2. Copy the **Measurement ID** displayed in the stream. If it starts with `G-`, add that value to `ga4MeasurementId` in `analytics-config.json` (or set Netlify `GA4_MEASUREMENT_ID`). The production build will add a second `gtag('config','G-...')` using the same tag script, without duplicating loaders. The repo's empty field is intentionally not a placeholder GA property.
3. If the Analytics stream displays only `AW-17735313498`, check in **Google tag → Manage Google tag → Destinations** that your GA4 property/web stream is connected to that tag. A Google Ads destination alone does not create GA4 reporting.
4. Ensure the site's consent management platform actually sends Google Consent Mode `update` signals for Analytics after user consent. The code sets consent denied by default but does not invent permission or assume AdSense's CMP automatically integrates with GA4.
5. After deploy, open https://tagassistant.google.com/ and test tag and consent requests; then check Google Analytics **Reports → Realtime**. Do not confuse Google Ads conversions, Google Search Console clicks and Analytics users.
6. To see external geography and channel data accurately, leave GA4 enhanced measurement configured according to the site's privacy choices and confirm internal-traffic filtering.

**Important**: The code the publisher initially supplied loaded `gtm.js?id=AW-17735313498` but called `gtag()`. That mixes Google Tag Manager's `gtm.js` loader with `gtag.js` commands. The correct standard Google tag loader is `https://www.googletagmanager.com/gtag/js?id=AW-17735313498`, followed by appropriate `gtag('config',...)` commands.

Google source: https://support.google.com/analytics/answer/17231523 and https://support.google.com/analytics/answer/14183469 and https://developers.google.com/tag-platform/security/guides/consent
