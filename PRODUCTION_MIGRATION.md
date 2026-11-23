# Production migration plan — AI Discover Tools

Status: **prepared for testing, NOT deployed** (23 November 2026).

The public domain `aidiscovertools.com` must keep pointing at its current Netlify deployment until the production bundle and DNS cutover are explicitly checked. The GitHub Pages URL remains a **noindex, ad-free staging preview**. Do not set the custom domain on the staging workflow yet.

## What has been prepared

On every push to `main`, GitHub Actions now:

1. Validates source HTML, JS and tool catalog.
2. Builds `_site`, a **noindex preview without AdSense**, including 124 compatibility routes and 15 detailed editorial pages.
3. Builds a **separate** `_production` folder (no upload or deployment) with live-domain canonicals, `robots.txt`, a sitemap of indexable HTML pages, and the same 124 legacy routes.
4. Verifies the production sitemap links only to existing indexable files and that no tool template query strings appear in it.
5. Uploads **only `_site`** to GitHub Pages. `_production` is intentionally never deployed by this workflow.

The new production sitemap deliberately omits invented `lastmod` dates. It excludes thin redirect pages (`/tools/<slug>/` for tools without a detailed review), the generic search/tool templates and any existing noindex HTML. For editorial pages still containing `[VERIFY]`, the production build preserves `noindex` pending fact checking; those pages remain accessible to readers but are not in the sitemap. The other reviewed tool pages have their own canonical `/tools/<slug>/` URL.

## Cutover checklist — do not skip

- [ ] Review the generated `production-build-report.json` and manually check the home page, browsing, search, filters, mobile navigation, category pages and 15 editorial profiles on a production-equivalent test server.
- [ ] Verify and rewrite any outdated model names, dated pricing claims, `[VERIFY]` notes and untested editorial testimonials. **The remaining tool catalog pricing has NOT been fully audited.**
- [ ] Check incoming links, historical indexed URLs and Google Search Console page coverage to decide whether the 109 placeholder routes need real content or server-side redirects. GitHub Pages only serves HTML/JS redirects, not native server-side 301 rewrites.
- [ ] Verify the contact email and legal pages; the contact form opens a user's email client rather than submitting automatically.
- [ ] Make sure Analytics and AdSense are configured on the public domain, not on the staging preview.
- [ ] Plan a **separate production workflow** using `_production` as the Pages artifact. Never simply point `aidiscovertools.com` to the current preview workflow because it deploys `noindex` and omits ads and sitemap.
- [ ] Verify ownership of `aidiscovertools.com` in GitHub Pages. Configure a custom domain in **Settings → Pages**, then set the registrar DNS records following GitHub's official documentation. Preserve any email/MX/TXT records. Enable HTTPS and test `www`/apex behavior.
- [ ] Check the live `robots.txt`, `sitemap.xml`, canonical links, ads.txt, SSL, key old URLs and 404s after the DNS change.
- [ ] Submit the final sitemap in Search Console after the production site is reachable and then monitor indexing/errors. Do not disable Netlify until the cutover is verified.

Official documentation:

- Google sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google site moves: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- GitHub Pages domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
