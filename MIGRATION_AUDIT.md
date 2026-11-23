# AI Discover Tools — migration checklist (23 Nov 2026)

## Work prepared
- Source now uses relative internal links to work with GitHub Pages project previews and the root domain.
- Repaired escaped quotation marks in editorial page links.
- Netlify's submission form was replaced with an **email draft** sent to the address already displayed on the site, `hello@aidiscovertools.com`. This opens an email client; a visitor MUST send the draft themselves. Verify the inbox receives mail.
- Replaced the newsletter signup without a service backend with an ordinary guide link.
- GitHub Actions creates a staging preview only: it adds `noindex`, omits AdSense scripts and the production sitemap, and generates 124 legacy `/tools/<slug>/` static routes pointing to tool detail pages.

## To activate preview
Choose **GitHub Actions** as the Source under repository **Settings → Pages → Build and deployment**. If the initial deployment failed, go to **Actions → Publish AI Discover Tools preview → Run workflow**. Once it succeeds, the preview should be at `https://aissambouzakouraelk-hue.github.io/aidiscovertools/`.

## Before changing the domain
- Test the staging preview on desktop and mobile: home, search, filters, details, guides, and legacy routes.
- Verify that `hello@aidiscovertools.com` is an active mailbox. For a full online form without an email client, add an independent backend or form provider.
- Review provider prices and marketing claims in `tools.json`. Some reviews still contain `[VERIFY]` placeholders and should not be presented as checked.
- Confirm sitemap URLs and Google Search Console coverage. Its existing `lastmod` values are dated March 2026 and should be changed only for real content updates.
- Confirm analytics and AdSense on the final domain. Ads are disabled on preview.
- Preserve existing Netlify hosting until the new host works with the custom domain. GitHub Pages cannot issue Netlify-style server-side HTTP 301 rewrites; the generated static redirect pages are only a compatibility fallback.
- **Do not attach the production domain to the preview workflow unchanged:** it intentionally uses `noindex` and does not include ads or sitemap. Production will require a separate build, DNS change and HTTPS verification.

No authenticated Search Console or analytics data was accessed during the code audit.
