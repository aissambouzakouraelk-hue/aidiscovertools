// Check local HTML references and tool catalog before deploying.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "tools.json"), "utf8").replace(/^\uFEFF/, ""));
const htmlFiles = fs.readdirSync(root).filter(name => name.endsWith(".html"));
const missing = [];
for (const file of htmlFiles) {
  const doc = fs.readFileSync(path.join(root, file), "utf8");
  for (const match of doc.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const link = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#|javascript:|\/\/)/i.test(link) || link.includes("$" + "{")) continue;
    const pathname = link.split(/[?#]/)[0].replace(/^\//, "");
    if (pathname && !fs.existsSync(path.join(root, pathname))) missing.push(file + " -> " + link);
  }
}
const unverifiedClaims = /Trusted by millions|Reviewed by Alex Morgan|>Start free trial<|>Free plan available<|About Alex Morgan/;
for (const file of [...htmlFiles, 'script.js', 'tool-page.js', 'landing-page.js']) {
  if (unverifiedClaims.test(fs.readFileSync(path.join(root, file), 'utf8'))) {
    missing.push(`${file} still has an unverified marketing or attribution claim`);
  }
}
if (!htmlFiles.includes("index.html") || !htmlFiles.includes("tool.html")) missing.push("Essential HTML pages absent");
if (!Array.isArray(catalog) || catalog.length < 100) missing.push("Catalog unexpectedly small or invalid");
const duplicated = catalog.map(x => x.name).filter((name, i, all) => all.indexOf(name) !== i);
if (duplicated.length) missing.push("Repeated tool names: " + duplicated.join(", "));
if (missing.length) {
  console.error("Validation failed (" + missing.length + "):\n" + missing.join("\n"));
  process.exit(1);
}
console.log("Validated " + htmlFiles.length + " HTML pages and " + catalog.length + " tools; no missing local files.");
