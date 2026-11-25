# AI Discover Tools — recovered website

This repository contains the static site recovered from the manually uploaded Netlify deploy archive.

## Architecture
- HTML pages in the project root
- `styles.css` for layout and styling
- `script.js`, `landing-page.js`, `tool-page.js`, `tools.js` for browser functionality
- `tools.json` for the tool catalog (124 entries in the recovered file)
- `generate-sitemap.js` and PowerShell generators for maintenance

## Local preview
From this directory run `python -m http.server 8000` and open http://localhost:8000.
Do not open `index.html` directly using `file://` if you want `fetch('tools.json')` to work.

## Publishing without Netlify
For a static hosting provider, use the project root as the publishing directory; no Node build step is required for the supplied files. Use GitHub for version control. Keep the current domain DNS untouched until testing the new host.

## Before migrating
1. The `submit-tool.html` form uses `data-netlify="true"`; replace with another forms service or backend.
2. The homepage newsletter form has `action="#"`; verify whether it has any actual subscription backend before advertising subscriptions.
3. `sitemap.xml` has old `lastmod` values (mostly March 16, 2026). Regenerate dates only when corresponding pages actually change; don't mark all pages newly updated without edits.
4. Verify analytics, Search Console, AdSense, all external links, tool prices, and redirects.
5. `netlify.toml` and `_redirects` are Netlify-specific. Port routes to the new host. Do not blindly copy them expecting redirects to work.
6. Check catalog count messaging: `tools.json` has 124 entries, which may differ from the number displayed on the site.

The recovered code is unmodified. This bundle is a clean working copy with this README and `.gitignore` added, not a tested production release.

## GitHub Pages staging
Once **Settings → Pages → Build and deployment → Source → GitHub Actions** is enabled,
the workflow at `.github/workflows/pages-preview.yml` can publish an isolated,
non-indexable preview from `main`. The preview builder (`node scripts/build-pages-preview.js`)
removes ads and injects `noindex` on staging only. It MUST NOT be used unchanged
for the production domain. Read `MIGRATION_AUDIT.md` before migration.


## Existing Netlify project — Git continuous deployment

The root `netlify.toml` is configured to build the **indexable** `_production` directory on Netlify's production branch, while pull-request and branch previews use the **ad-free, noindex** `_site` output. CI runs `scripts/check-netlify-config.js` to guard this split.

**Do not create a second Netlify project or change DNS.** On the *existing* project serving `aidiscovertools.com`, link Git repository `aissambouzakouraelk-hue/aidiscovertools` from **Project configuration → Build & deploy → Continuous deployment → Repository → Link repository**, with `main` as production branch. Linking normally triggers a deployment: first confirm the current deploy can be restored/rolled back and verify the production build logs and deploy preview. Netlify reads the build command and publish directory from `netlify.toml`.

After the first successful deployment, verify `/ads.txt`, `/robots.txt`, `/sitemap.xml`, `/tools/chatgpt/`, `/tools/claude/`, `/tool.html?name=copy-ai`, search, filters, and consent display on mobile. Check site status, policy issues and actual earnings inside AdSense. Never click your own ads.
