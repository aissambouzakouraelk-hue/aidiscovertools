# AI Discover Tools — AdSense and monetization checks (25 November 2026)

This is an implementation checklist, not a statement of earnings or confirmation of live ad delivery. The site owner reports that AdSense has approved `aidiscovertools.com`.

## Safeguards already committed
- Publisher: `pub-7512084984607252` in the source home AdSense tag and `ads.txt`.
- Production build retains original AdSense tags and now adds the same tag to the **indexable, reviewed** static profiles (not to 109 redirect placeholders or noindex/unverified profiles).
- Automated source and production checks fail on a missing home tag, missing seller record, or missing AdSense tag in indexable reviewed profiles.
- GitHub Pages staging remains **noindex and ad-free**. Only a validated production build should ever be assigned the custom domain.
- Editorial and privacy notices explain advertising and potential affiliate referrals without claiming active commissions.

## Must be completed in AdSense account
1. Visit AdSense → Ads → by site → `aidiscovertools.com`. Check **Auto ads** are enabled, preview their positions and avoid crowding the directory/search UI.
2. Visit AdSense → Privacy & messaging → European regulations. Confirm a published Google-certified consent message for EEA, UK and Switzerland (or another certified CMP). This cannot be inferred from source code.
3. Visit AdSense → Sites and check the site's status, the live `https://aidiscovertools.com/ads.txt` seller detection, and any policy issues. The repository containing an `ads.txt` does not by itself establish that the currently live manual Netlify deploy serves it.
4. Check page experience and actual mobile/desktop ad rendering without clicking your own ads. Do not manipulate impressions or request ad clicks.

## Hosting and deployment
- Production remains at the existing Netlify deployment until the user links the correct existing site to GitHub or explicitly chooses a tested cutover.
- GitHub Actions builds `_production` and validates it but deploys **only `_site`**, the noindex preview. Changes to the GitHub repository do **not** automatically appear on the live domain if the old Netlify site is still manually deployed.
- Never connect the custom domain to the current Pages preview workflow. It intentionally disables ads and search indexing.
- Netlify can build and publish the `_production` directory using: `node scripts/build-pages-preview.js && node scripts/build-reviewed-pages.js && node scripts/build-production.js && node scripts/check-production.js`. Set publish directory `_production` **only after testing** a deploy preview and reviewing Netlify redirects. Do not create a second Netlify site with the same production domain.

## Affiliates — apply, do not fabricate links
Official program information (no account approval verified):
- Grammarly: https://www.grammarly.com/affiliates
- Writesonic: https://writesonic.com/affiliate
- Semrush: https://www.semrush.com/lp/affiliate-program/en/
- Jasper: https://www.jasper.ai/legal/affiliates — check current application availability before relying on legacy terms.

After a program accepts the site, put the real tracking URL in the corresponding catalog `affiliateUrl` or `affiliate.tryNow` field and confirm with an actual link preview. Mark only paid/affiliate links with `rel="sponsored"` and display a clear disclosure. Ordinary provider links must not be represented as active affiliate arrangements.

## Measurement
- Google Search Console showed 0 organic clicks for 26 Oct–22 Nov 2026; this is **not** Google Analytics traffic and does not establish zero total users.
- Use AdSense's own reports for earnings, impressions, coverage and policy notices; GSC cannot report ad revenue.
- Focus on improving pages that already have impressions before adding large sets of shallow pages.

Official setup documentation:
- https://support.google.com/adsense/answer/9261307
- https://support.google.com/adsense/answer/10960768
- https://docs.netlify.com/build/configure-builds/overview/
