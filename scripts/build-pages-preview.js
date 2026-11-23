// Build a non-indexable GitHub Pages preview without touching the production domain.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const out = path.join(root, "_site");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const included = new Set([".html", ".css", ".js", ".json", ".svg", ".txt", ".xml"]);
let htmlCount = 0;
for (const item of fs.readdirSync(root, { withFileTypes: true })) {
  if (!item.isFile() || !included.has(path.extname(item.name).toLowerCase())) continue;
  if (["sitemap.xml", "robots.txt", "ads.txt"].includes(item.name)) continue;
  const target = path.join(out, item.name);
  if (!item.name.endsWith(".html")) {
    fs.copyFileSync(path.join(root, item.name), target);
    continue;
  }
  let page = fs.readFileSync(path.join(root, item.name), "utf8");
  page = page.replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, "");
  page = page.replace(/<\/head>/i, '  <meta name="robots" content="noindex, nofollow" />\n</head>');
  page = page.replace(/<script\b[^>]*\bsrc=["']https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^>]*><\/script>\s*/gi, "");
  fs.writeFileSync(target, page);
  htmlCount++;
}
const catalog = JSON.parse(fs.readFileSync(path.join(root, "tools.json"), "utf8").replace(/^\uFEFF/, ""));
const slugify = text => String(text).toLowerCase().trim()
  .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
let generated = 0;
const seen = new Set();
for (const tool of catalog) {
  const slug = slugify(tool.slug || tool.name);
  if (!slug || seen.has(slug)) continue;
  seen.add(slug);
  const dir = path.join(out, "tools", slug);
  fs.mkdirSync(dir, { recursive: true });
  const url = "../../tool.html?name=" + encodeURIComponent(slug);
  const html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=' + url + '"><title>AI tool detail</title></head><body><p><a href="' + url + '">Continue to the tool detail</a></p><script>location.replace(' + JSON.stringify(url) + ');</script></body></html>\n';
  fs.writeFileSync(path.join(dir, "index.html"), html);
  generated++;
}
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log("Preview built: " + htmlCount + " pages, " + generated + " legacy URLs; noindex and no ads.");
