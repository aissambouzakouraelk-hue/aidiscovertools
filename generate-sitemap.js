const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const TOOLS_DIR = path.join(ROOT, "tools");
const OUTPUT = path.join(ROOT, "sitemap.xml");
const BASE_URL = (process.env.SITEMAP_BASE_URL || "https://aidiscovertools.com").replace(/\/+$/, "");
const TODAY = new Date().toISOString().slice(0, 10);

function listHtmlFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
    .map(entry => entry.name);
}

function getPriorityForRootPage(filename) {
  if (filename === "index.html") return "1.0";
  if (filename === "tool.html") return "0.4";
  if (filename.startsWith("ai-") || filename.startsWith("best-")) return "0.9";
  return "0.7";
}

function getChangeFreqForRootPage(filename) {
  return filename === "index.html" ? "daily" : "weekly";
}

function buildUrlNode(loc, changefreq, priority) {
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    `    <lastmod>${TODAY}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>"
  ].join("\n");
}

function generateSitemap() {
  const rootPages = listHtmlFiles(ROOT)
    .filter(name => name !== "404.html")
    .sort((a, b) => a.localeCompare(b));

  const toolPages = listHtmlFiles(TOOLS_DIR).sort((a, b) => a.localeCompare(b));

  const nodes = [];

  for (const page of rootPages) {
    const loc = `${BASE_URL}/${page}`;
    nodes.push(buildUrlNode(loc, getChangeFreqForRootPage(page), getPriorityForRootPage(page)));
  }

  for (const page of toolPages) {
    const loc = `${BASE_URL}/tool.html?name=${page.replace(/\.html$/, "")}`;
    nodes.push(buildUrlNode(loc, "weekly", "0.8"));
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    nodes.join("\n"),
    "</urlset>",
    ""
  ].join("\n");

  fs.writeFileSync(OUTPUT, xml, "utf8");
  console.log(`Sitemap updated: ${nodes.length} URLs`);
  console.log(`Base URL: ${BASE_URL}`);
}

generateSitemap();

