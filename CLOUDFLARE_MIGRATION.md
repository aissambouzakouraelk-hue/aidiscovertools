# AI Discover Tools — move from Netlify to Cloudflare Pages Free

Goal: stop paying for Netlify while preserving `https://aidiscovertools.com`, Google indexing, Analytics, AdSense and existing email records.

## What is prepared in the repository
- `node scripts/build-cloudflare.js` prepares `_production` for Cloudflare Pages; it does not publish or change DNS.
- Google's Analytics `G-ZRFF519KR8`, Ads tag `AW-17735313498`, AdSense publisher `ca-pub-7512084984607252`, `ads.txt`, robots, consent and CSS/JS remain in the production package.
- The sitemap and canonical URLs use Cloudflare Pages' extensionless URLs (`/about` rather than `/about.html`). Cloudflare Pages automatically redirects legacy `/about.html` requests to `/about`.
- All `/tools/<slug>/` review and noindex fallback pages are still generated.
- Cloudflare's `_redirects` includes `/home → /`. Legacy `/tool?name=...` queries rely on Cloudflare's built-in extensionless serving of `tool.html`; **verify sample old Google URLs on the *.pages.dev staging domain before changing DNS.**
- The separate GitHub Pages staging version is still `noindex` and is not the live production site. Do not use it to replace the custom domain.

## Step 1: Create Pages project (without switching domain)
1. Sign in at https://dash.cloudflare.com/ (Cloudflare Free plan).
2. **Workers & Pages → Create application → Pages → Connect to Git**.
3. Authorize the GitHub repository `aissambouzakouraelk-hue/aidiscovertools` and choose the `main` branch.
4. In build settings use:
   - Framework preset: **None**
   - Build command: `node scripts/build-cloudflare.js`
   - Build output directory: `_production`
   - Root directory: repository root / empty
   - Environment variable if needed: `NODE_VERSION=22`
5. Deploy; check `https://<your-project>.pages.dev/`. Cloudflare provides a temporary address.

## Step 2: Pre-switch verification
Check all of these on `*.pages.dev` BEFORE editing DNS:
- Homepage, search and category filters (including mobile).
- `/tools/chatgpt/`, `/tools/claude/` and unreviewed fallback tools.
- Old Search Console URLs such as `/tool?name=deepai-image-generator`, `/tool.html?name=opus-clip`, `/about.html` (should redirect and serve a valid page).
- `/sitemap.xml`, `/robots.txt`, `/ads.txt`, `/analytics-consent.js` and a real 404 response.
- Inspect the canonical URLs: they should point to `https://aidiscovertools.com/`, not `*.pages.dev`.
- For the temporary `*.pages.dev` address, avoid promoting it to search engines; it is only used to verify the build. After cutover, redirect or restrict this address as appropriate.

## Step 3: Move the domain, carefully
Cloudflare Pages requires `aidiscovertools.com` (the apex/root domain) to be a Cloudflare DNS zone with Cloudflare nameservers. In Cloudflare, add the domain to the Free plan and check that it imports **every existing DNS record** correctly. BEFORE changing nameservers at your domain registrar, preserve:
- Mail **MX**, SPF, DKIM and DMARC records (so existing email keeps working).
- Google Search Console and other domain verification TXT entries.
- Any other subdomains and records you currently use.

Only after verifying the Pages staging site:
1. Set `aidiscovertools.com` as a Pages custom domain in **Workers & Pages → [project] → Custom domains**.
2. Follow Cloudflare's setup to connect the custom domain. The registry/registrar nameserver change must be approved in your domain registrar; the current Netlify hosting is not the domain registrar.
3. Confirm HTTPS, root domain, `www` forwarding if configured, sitemap, ads.txt, Analytics consent and old indexed links are correct on the real domain.
4. Keep the existing Netlify deployment in place until the domain has fully moved and been verified. Do not delete the old Netlify site or cancel any service that also renews your domain or provides your email.

## Step 4: Stop paying Netlify
Once the live domain and legacy URLs are confirmed working on Cloudflare:
- Cancel / downgrade the Netlify hosting subscription before renewal.
- Keep the domain registration and any separate email service active.
- Remove Netlify-specific DNS records only after the cutover succeeds, then optionally unlink the old Netlify site's Git repository to avoid unnecessary deploy attempts.

## Why not the existing GitHub Pages preview?
The GitHub Pages build intentionally has `noindex` and omits production advertisements. It is not suitable for your live revenue site. GitHub's own documentation also says GitHub Pages is not intended to host online businesses as a free web-hosting service.

Current official references:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://developers.cloudflare.com/pages/configuration/redirects/
