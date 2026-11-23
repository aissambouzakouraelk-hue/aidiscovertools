const searchInput = document.getElementById("searchInput");
const categoryChips = document.getElementById("categoryChips");
const categoryPageLinks = document.getElementById("categoryPageLinks");
const resultInfo = document.getElementById("resultInfo");
const emptyState = document.getElementById("emptyState");
const trendingToolsGrid = document.getElementById("trendingToolsGrid");
const popularToolsGrid = document.getElementById("popularToolsGrid");
const featuredToolsGrid = document.getElementById("featuredToolsGrid");
const monthlyTopGrid = document.getElementById("monthlyTopGrid");
const newToolsGrid = document.getElementById("newToolsGrid");
const freeToolsGrid = document.getElementById("freeToolsGrid");
const mostPopularGrid = document.getElementById("mostPopularGrid");
const guideHighlights = document.getElementById("guideHighlights");
const totalToolsStat = document.getElementById("totalToolsStat");
const totalCategoriesStat = document.getElementById("totalCategoriesStat");
const lastUpdatedStat = document.getElementById("lastUpdatedStat");
const finderTaskInput = document.getElementById("finderTaskInput");
const finderTaskButton = document.getElementById("finderTaskButton");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const sortSelect = document.getElementById("sortSelect");
const openSourceFilter = document.getElementById("openSourceFilter");
const noLoginFilter = document.getElementById("noLoginFilter");
const apiFilter = document.getElementById("apiFilter");
const quickAllTools = document.getElementById("quickAllTools");
const quickFreeTools = document.getElementById("quickFreeTools");
const quickPaidTools = document.getElementById("quickPaidTools");
const quickWritingTools = document.getElementById("quickWritingTools");
const quickImageTools = document.getElementById("quickImageTools");
const quickVideoTools = document.getElementById("quickVideoTools");

let toolsData = [];
let categories = [];
let toolIndex = new Map();
let activeCategory = "all";
let activePrice = "all";
let activeSort = "most-popular";
let requireOpenSource = false;
let requireNoLogin = false;
let requireApi = false;
const normalizedPath = window.location.pathname.toLowerCase();
const isSearchPage = normalizedPath.endsWith("/search.html") || normalizedPath === "/search";
const isHomePage = normalizedPath.endsWith("/") || normalizedPath.endsWith("/index.html");

const editorialTopToolNames = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Perplexity",
  "Midjourney",
  "Runway",
  "Canva Magic Media",
  "GitHub Copilot",
  "Cursor",
  "Notion AI",
  "ElevenLabs",
  "HeyGen",
  "Synthesia",
  "Jasper",
  "Writesonic"
];

const popularOrder = new Map([
  "ChatGPT",
  "Claude",
  "Midjourney",
  "Runway",
  "GitHub Copilot",
  "Notion AI",
  "Perplexity",
  "Canva Magic Media",
  "HeyGen",
  "HubSpot AI",
  "Gemini",
  "Cursor"
].map((name, index) => [name, index]));

const affiliatePriorityTools = ["Jasper", "Copy.ai", "Writesonic", "Synthesia", "ElevenLabs"];

const TASK_INTENT_MAP = {
  "create presentations": { categories: ["productivity", "writing", "image"], tags: ["docs", "design", "templates"] },
  "generate blog posts": { categories: ["writing", "marketing"], tags: ["blog", "seo", "content"] },
  "edit videos": { categories: ["video"], tags: ["editing", "captions", "shorts"] },
  "write marketing copy": { categories: ["marketing", "writing"], tags: ["copy", "ads", "campaign"] },
  "build app": { categories: ["coding"], tags: ["code", "debug", "tests"] },
  "create social content": { categories: ["marketing", "image", "video"], tags: ["social", "creative", "clips"] },
  "summarize meetings": { categories: ["productivity"], tags: ["meeting", "summary", "notes"] }
};

const popularityStorageKey = (() => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `toolPopularity:${now.getFullYear()}-${month}`;
})();

const categoryPageMap = {
  writing: "ai-writing-tools.html",
  image: "ai-image-generators.html",
  video: "ai-video-tools.html",
  productivity: "ai-productivity-tools.html",
  coding: "best-ai-tools-for-developers.html",
  marketing: "best-ai-tools-for-marketing.html"
};

const useCaseConfigs = {
  "ai-tools-for-youtube": {
    title: "Best AI Tools for YouTube Creators",
    intro: "Discover AI tools for scripting, thumbnails, editing, captions, and publishing workflows for YouTube channels.",
    categories: ["video", "writing", "image", "marketing"],
    keywords: ["youtube", "video", "thumbnail", "script", "voiceover", "captions", "shorts", "creator"]
  },
  "ai-tools-for-students": {
    title: "Best AI Tools for Students",
    intro: "Find AI tools for research, summaries, writing assignments, note-taking, and study productivity.",
    categories: ["writing", "productivity"],
    keywords: ["students", "study", "notes", "summary", "research", "assignment", "learning", "exam"]
  },
  "ai-tools-for-marketing": {
    title: "Best AI Tools for Marketing",
    intro: "Explore AI software for ad copy, SEO, social content, campaign planning, and conversion-focused optimization.",
    categories: ["marketing", "writing", "image", "video"],
    keywords: ["marketing", "seo", "social", "ads", "campaign", "content", "email", "conversion"]
  },
  "ai-tools-for-coding": {
    title: "Best AI Tools for Coding",
    intro: "Compare coding assistants for code generation, refactoring, debugging, testing, and developer workflows.",
    categories: ["coding", "productivity"],
    keywords: ["coding", "developer", "code", "debug", "refactor", "tests", "github", "ide"]
  },
  "ai-tools-for-blogging": {
    title: "Best AI Tools for Blogging",
    intro: "Find AI tools for blog ideation, drafting, rewriting, SEO optimization, and publishing workflows.",
    categories: ["writing", "marketing"],
    keywords: ["blog", "blogging", "seo", "articles", "content", "rewrite", "keywords", "outline"]
  },
  "ai-tools-for-seo": {
    title: "Best AI Tools for SEO",
    intro: "Browse AI tools for keyword research, SEO content briefs, optimization, and ranking-focused content production.",
    categories: ["marketing", "writing"],
    keywords: ["seo", "keywords", "serp", "optimization", "ranking", "search", "content strategy"]
  },
  "ai-tools-for-instagram": {
    title: "Best AI Tools for Instagram Creators",
    intro: "Discover AI tools for reels, social graphics, captions, and content repurposing for Instagram growth.",
    categories: ["image", "video", "marketing", "writing"],
    keywords: ["instagram", "reels", "captions", "social", "content", "shorts", "design", "creator"]
  },
  "ai-tools-for-content-creators": {
    title: "Best AI Tools for Content Creators",
    intro: "Find AI tools for writing, design, video creation, and social publishing across creator workflows.",
    categories: ["video", "image", "writing", "marketing", "productivity"],
    keywords: ["creator", "content", "video", "image", "social", "editing", "workflow", "publish"]
  }
};

const alternativeConfigs = {
  "chatgpt-alternatives": { target: "chatgpt", title: "Top ChatGPT Alternatives", intro: "Compare AI assistants similar to ChatGPT for writing, productivity, coding, and research workflows." },
  "midjourney-alternatives": { target: "midjourney", title: "Top Midjourney Alternatives", intro: "Explore alternative AI image generators for concept art, design, product visuals, and social creatives." },
  "runway-alternatives": { target: "runway", title: "Top Runway Alternatives", intro: "Find alternatives to Runway for AI video generation, editing, avatar creation, and clip repurposing." }
};

const comparisonConfigs = {
  "chatgpt-vs-claude": { left: "chatgpt", right: "claude", title: "ChatGPT vs Claude", intro: "A practical comparison of ChatGPT and Claude for writing quality, reasoning depth, and daily workflows." },
  "midjourney-vs-dalle": { left: "midjourney", right: "dall-e", title: "Midjourney vs DALL-E", intro: "Compare Midjourney and DALL-E for image quality, style control, editing flexibility, and ease of use." },
  "runway-vs-pika": { left: "runway", right: "pika", title: "Runway vs Pika", intro: "Head-to-head comparison of Runway and Pika for AI video generation, editing tools, and production speed." }
};

function slugifyToolName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getToolSlug(tool) {
  const raw = (tool?.slug || tool?.name || "").toString().trim();
  if (!raw) return "";
  const lastSegment = raw.split("/").pop() || raw;
  const noExt = lastSegment.replace(/\.html?$/i, "");
  return slugifyToolName(noExt);
}

function getToolDetailUrl(tool) {
  const slug = (tool?.slug || getToolSlug(tool) || "").toString().toLowerCase().trim();
  return `tool.html?name=${encodeURIComponent(slug)}`;
}

function getAffiliateLink(tool, intent = "try") {
  const affiliate = tool?.affiliate || {};
  const tryNow =
    affiliate.tryNow ||
    tool?.affiliateTryUrl ||
    tool?.affiliateUrl ||
    tool?.website ||
    tool?.url ||
    "#";
  const trial =
    affiliate.trial ||
    tool?.affiliateTrialUrl ||
    tool?.trialUrl ||
    tool?.affiliateUrl ||
    tool?.website ||
    tool?.url ||
    "#";
  return intent === "trial" ? trial : tryNow;
}

function getPopularityMap() {
  try {
    const raw = localStorage.getItem(popularityStorageKey);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function savePopularityMap(map) {
  localStorage.setItem(popularityStorageKey, JSON.stringify(map));
}

function bumpToolPopularity(toolName, increment = 1) {
  if (!toolName) return;
  const map = getPopularityMap();
  map[toolName] = (map[toolName] || 0) + increment;
  savePopularityMap(map);
}

function getToolPopularity(toolName) {
  const map = getPopularityMap();
  return map[toolName] || 0;
}

function getBasePopularity(toolName) {
  if (popularOrder.has(toolName)) {
    return 120 - popularOrder.get(toolName) * 8;
  }
  return 20;
}

function getPopularityScore(tool) {
  return getBasePopularity(tool.name) + getToolPopularity(tool.name) * 5;
}

function createTags(tags) {
  return tags.map(tag => `<span class="tag">${tag}</span>`).join("");
}

function getToolLogoUrl(tool) {
  try {
    const domain = new URL(tool.website || tool.url).hostname.replace("www.", "");
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  } catch (error) {
    return "https://via.placeholder.com/40";
  }
}

function ensureHtmlSlug(pathname) {
  const normalized = pathname.replace(/\/+$/, "").toLowerCase();
  const segment = normalized.split("/").pop() || "";
  return segment.endsWith(".html") ? segment.slice(0, -5) : segment;
}

function sanitizePricingLabel(value) {
  const normalized = (value || "").toString().trim().toLowerCase();
  if (normalized === "free") return "Free";
  if (normalized === "freemium") return "Freemium";
  return "Paid";
}

function getPriceLabel(tool) {
  return sanitizePricingLabel(tool.pricing || tool.price?.model);
}

function getFeatureBadges(tool) {
  const badges = [];
  if (tool.openSource) badges.push("Open Source");
  if (!tool.loginRequired) badges.push("No Login");
  if (tool.api) badges.push("API");
  return badges;
}

function getToolRelevanceScore(tool, term) {
  if (!term) return 1;

  const normalizedTerm = term.toLowerCase();
  const tokens = normalizedTerm.split(/\s+/).filter(Boolean);
  const name = (tool.name || "").toLowerCase();
  const description = (tool.description || "").toLowerCase();
  const category = (tool.category || "").toLowerCase();
  const tags = (tool.tags || []).join(" ").toLowerCase();
  const haystack = `${name} ${description} ${category} ${tags}`;

  let score = 0;
  if (name.includes(normalizedTerm)) score += 8;
  if (description.includes(normalizedTerm)) score += 5;
  if (category.includes(normalizedTerm)) score += 4;

  tokens.forEach(token => {
    if (name.includes(token)) score += 3;
    else if (description.includes(token)) score += 2;
    else if (tags.includes(token)) score += 2;
    else if (category.includes(token)) score += 1;
  });

  Object.entries(TASK_INTENT_MAP).forEach(([intent, config]) => {
    if (normalizedTerm.includes(intent)) {
      if (config.categories.includes(category)) score += 4;
      config.tags.forEach(tag => {
        if (haystack.includes(tag)) score += 2;
      });
    }
  });

  return score;
}

function prioritizeToolsByNames(toolList, priorityNames, limit) {
  const used = new Set();
  const priority = priorityNames
    .map(name => toolList.find(tool => tool.name === name))
    .filter(tool => {
      if (!tool || used.has(tool.name)) return false;
      used.add(tool.name);
      return true;
    });

  const rest = toolList.filter(tool => !used.has(tool.name));
  const combined = [...priority, ...rest];
  return Number.isFinite(limit) ? combined.slice(0, limit) : combined;
}

function scoreByConfig(tool, config) {
  const categories = new Set(config.categories || []);
  const keywords = (config.keywords || []).map(keyword => keyword.toLowerCase());
  const text = `${tool.name} ${tool.description} ${tool.category} ${(tool.tags || []).join(" ")}`.toLowerCase();

  let score = categories.has(tool.category) ? 6 : 0;
  keywords.forEach(keyword => {
    if (text.includes(keyword)) score += 2;
  });

  return score;
}

function findToolBySlug(slug) {
  const normalizedSlug = slugifyToolName((slug || "").toString().toLowerCase().trim());
  return toolsData.find(tool => (tool.slug || "").toLowerCase() === normalizedSlug);
}

function createUseCaseToolCard(tool, rank, config) {
  const card = createToolCard(tool, rank);
  const reason = document.createElement("p");
  reason.className = "match-reason";

  const matchTag = (tool.tags || []).find(tag =>
    (config.keywords || []).some(keyword => tag.toLowerCase().includes(keyword.toLowerCase()))
  );

  const reasonLabel = matchTag
    ? `Why this tool: Strong fit for ${matchTag} tasks.`
    : `Why this tool: Good fit for ${tool.category} workflows.`;
  reason.textContent = reasonLabel;

  const actionBlock = card.querySelector(".card-actions");
  if (actionBlock) {
    actionBlock.parentNode.insertBefore(reason, actionBlock);
  } else {
    card.appendChild(reason);
  }

  return card;
}

function renderInternalLinks(sectionId, links) {
  const container = document.getElementById(sectionId);
  if (!container) return;

  container.innerHTML = "";
  links.forEach(link => {
    const anchor = document.createElement("a");
    anchor.className = "category-link-card";
    anchor.href = link.href;
    anchor.textContent = link.label;
    container.appendChild(anchor);
  });
}

function renderUseCasePage(slug) {
  const config = useCaseConfigs[slug];
  if (!config) return;

  const title = document.getElementById("seoPageTitle");
  const intro = document.getElementById("seoPageIntro");
  const grid = document.getElementById("seoToolsGrid");
  const info = document.getElementById("seoResultInfo");

  if (title) title.textContent = config.title;
  if (intro) intro.textContent = config.intro;

  const selected = toolsData
    .map(tool => ({ tool, score: scoreByConfig(tool, config) + getPopularityScore(tool) / 30 }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, 18)
    .map(item => item.tool);

  if (info) info.textContent = `${selected.length} relevant tools found`;
  renderGridWithAds(grid, selected, (tool, index) => createUseCaseToolCard(tool, index + 1, config));

  const categoryLinks = [...new Set(config.categories)]
    .map(category => ({
      label: `AI ${category.charAt(0).toUpperCase()}${category.slice(1)}`,
      href: categoryPageMap[category] || "/"
    }));
  renderInternalLinks("seoCategoryLinks", categoryLinks);

  const extraLinks = [
    { label: "ChatGPT Alternatives", href: "chatgpt-alternatives.html" },
    { label: "Midjourney Alternatives", href: "midjourney-alternatives.html" },
    { label: "Runway Alternatives", href: "runway-alternatives.html" },
    { label: "ChatGPT vs Claude", href: "chatgpt-vs-claude.html" },
    { label: "Midjourney vs DALL-E", href: "midjourney-vs-dalle.html" },
    { label: "Runway vs Pika", href: "runway-vs-pika.html" }
  ];
  renderInternalLinks("seoExtraLinks", extraLinks);
}

function renderAlternativesPage(slug) {
  const config = alternativeConfigs[slug];
  if (!config) return;

  const title = document.getElementById("seoPageTitle");
  const intro = document.getElementById("seoPageIntro");
  const grid = document.getElementById("seoToolsGrid");
  const info = document.getElementById("seoResultInfo");

  const baseTool = findToolBySlug(config.target);
  if (!baseTool) return;

  if (title) title.textContent = config.title;
  if (intro) intro.textContent = config.intro;

  const selected = toolsData
    .filter(tool => tool.name !== baseTool.name)
    .map(tool => {
      let score = tool.category === baseTool.category ? 7 : 0;
      const similarTagCount = (tool.tags || []).filter(tag => (baseTool.tags || []).includes(tag)).length;
      score += similarTagCount * 2;
      score += getPopularityScore(tool) / 35;
      return { tool, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, 16)
    .map(item => item.tool);

  if (info) info.textContent = `${selected.length} alternatives to ${baseTool.name}`;
  renderGridWithAds(grid, selected, (tool, index) => createToolCard(tool, index + 1));

  renderInternalLinks("seoCategoryLinks", [
    { label: `${baseTool.name} Use This Tool`, href: getToolDetailUrl(baseTool) },
    { label: `AI ${baseTool.category.charAt(0).toUpperCase()}${baseTool.category.slice(1)} Tools`, href: categoryPageMap[baseTool.category] || "/" }
  ]);

  renderInternalLinks("seoExtraLinks", Object.values(useCaseConfigs).slice(0, 6).map((entry, index) => {
    const slugs = Object.keys(useCaseConfigs);
    return { label: entry.title, href: `${slugs[index]}.html` };
  }));
}

function createComparisonTable(leftTool, rightTool) {
  const tableHost = document.getElementById("comparisonTable");
  if (!tableHost) return;

  const rows = [
    ["Category", leftTool.category, rightTool.category],
    ["Pricing", getPriceLabel(leftTool), getPriceLabel(rightTool)],
    ["API", leftTool.api ? "Yes" : "No", rightTool.api ? "Yes" : "No"],
    ["Open Source", leftTool.openSource ? "Yes" : "No", rightTool.openSource ? "Yes" : "No"],
    ["Login Required", leftTool.loginRequired === false ? "No" : "Yes", rightTool.loginRequired === false ? "No" : "Yes"],
    ["Best For", leftTool.tags?.slice(0, 2).join(", ") || leftTool.category, rightTool.tags?.slice(0, 2).join(", ") || rightTool.category]
  ];

  tableHost.innerHTML = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>${leftTool.name}</th>
          <th>${rightTool.name}</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`).join("")}
      </tbody>
    </table>
  `;
}

function renderComparisonPage(slug) {
  const config = comparisonConfigs[slug];
  if (!config) return;

  const title = document.getElementById("seoPageTitle");
  const intro = document.getElementById("seoPageIntro");
  const grid = document.getElementById("seoToolsGrid");
  const info = document.getElementById("seoResultInfo");

  const leftTool = findToolBySlug(config.left);
  const rightTool = findToolBySlug(config.right);
  if (!leftTool || !rightTool) return;

  if (title) title.textContent = config.title;
  if (intro) intro.textContent = config.intro;
  if (info) info.textContent = `Comparison plus relevant alternatives`;

  createComparisonTable(leftTool, rightTool);

  const comparisonSet = toolsData
    .filter(tool => tool.name !== leftTool.name && tool.name !== rightTool.name)
    .filter(tool => tool.category === leftTool.category || tool.category === rightTool.category)
    .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
    .slice(0, 10);
  renderGridWithAds(grid, comparisonSet, (tool, index) => createToolCard(tool, index + 1));

  renderInternalLinks("seoCategoryLinks", [
    { label: `${leftTool.name} Use This Tool`, href: getToolDetailUrl(leftTool) },
    { label: `${rightTool.name} Use This Tool`, href: getToolDetailUrl(rightTool) },
    { label: `More ${leftTool.category} Tools`, href: categoryPageMap[leftTool.category] || "/" }
  ]);

  renderInternalLinks("seoExtraLinks", [
    { label: "ChatGPT Alternatives", href: "chatgpt-alternatives.html" },
    { label: "Midjourney Alternatives", href: "midjourney-alternatives.html" },
    { label: "Runway Alternatives", href: "runway-alternatives.html" }
  ]);
}

function renderSeoAutoPages() {
  const pageType = document.body?.dataset?.pageType;
  if (!pageType) return;

  const slug = ensureHtmlSlug(window.location.pathname);
  if (pageType === "use-case") {
    renderUseCasePage(slug);
    return;
  }
  if (pageType === "alternatives") {
    renderAlternativesPage(slug);
    return;
  }
  if (pageType === "comparison") {
    renderComparisonPage(slug);
  }
}

function normalizeTool(rawTool) {
  if (rawTool.price && rawTool.url) {
    const pricing = sanitizePricingLabel(rawTool.pricing || rawTool.price?.model);
    return {
      ...rawTool,
      website: rawTool.website || rawTool.url,
      slug: rawTool.slug || slugifyToolName(rawTool.name),
      pricing,
      tags: Array.isArray(rawTool.tags) ? rawTool.tags : [],
      api: !!rawTool.api,
      openSource: !!rawTool.openSource,
      loginRequired: rawTool.loginRequired !== false,
      price: {
        model: pricing
      }
    };
  }

  const pricing = sanitizePricingLabel(rawTool.pricing);
  return {
    name: rawTool.name,
    slug: rawTool.slug || slugifyToolName(rawTool.name),
    description: rawTool.description,
    category: rawTool.category,
    pricing,
    price: {
      model: pricing
    },
    url: rawTool.website,
    website: rawTool.website,
    tags: [rawTool.category, "ai", "tool"],
    api: false,
    openSource: false,
    loginRequired: true
  };
}

async function loadTools() {
  try {
    const cached = sessionStorage.getItem("toolsData:v1");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.map(normalizeTool);
      }
    }
  } catch (error) {
    // Ignore cache read errors.
  }

  if (typeof window.loadToolsData === "function") {
    const loaded = await window.loadToolsData();
    if (Array.isArray(loaded) && loaded.length) {
      try {
        sessionStorage.setItem("toolsData:v1", JSON.stringify(loaded));
      } catch (error) {
        // Ignore cache write errors.
      }
      return loaded.map(normalizeTool);
    }
  }

  try {
    const response = await fetch("tools.json", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length) {
        try {
          sessionStorage.setItem("toolsData:v1", JSON.stringify(data));
        } catch (error) {
          // Ignore cache write errors.
        }
        return data.map(normalizeTool);
      }
    }
  } catch (error) {
    // Fallback below keeps legacy behavior.
  }

  if (Array.isArray(window.tools)) {
    return window.tools.map(normalizeTool);
  }

  return [];
}

function createToolCard(tool, rankNumber) {
  const detailUrl = getToolDetailUrl(tool);
  const tryNowUrl = getAffiliateLink(tool, "try");
  const trialUrl = getAffiliateLink(tool, "trial");
  const featureBadges = getFeatureBadges(tool)
    .map(label => `<span class="feature-badge">${label}</span>`)
    .join("");
  const rankBadge = Number.isFinite(rankNumber) ? `<span class="rank-badge">#${rankNumber}</span>` : "";

  const card = document.createElement("article");
  card.className = "card tool-card";
  card.setAttribute("role", "link");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-label", `Open details for ${tool.name}`);
  card.innerHTML = `
    <div class="card-logo-wrap">
      <img class="tool-logo" src="${getToolLogoUrl(tool)}" alt="${tool.name} logo" loading="lazy" onerror="this.src='https://via.placeholder.com/40'" />
    </div>
    <div class="card-head">
      <div class="card-brand">
        <h3>${tool.name}</h3>
      </div>
      <div class="card-head-badges">
        ${rankBadge}
        <span class="category">${tool.category}</span>
      </div>
    </div>
    <p>${tool.description}</p>
    <div class="card-badges">
      <span class="price-badge">${getPriceLabel(tool)}</span>
      ${featureBadges}
    </div>
    <div class="trust-elements">
      <span class="trust-pill">Free plan available</span>
      <span class="trust-pill">Trusted by millions</span>
      <span class="trust-pill">Best for beginners</span>
    </div>
    <div class="tags">${createTags(tool.tags.slice(0, 3))}</div>
    <div class="card-actions">
      <a class="cta-primary" href="${tryNowUrl}" target="_blank" rel="noopener noreferrer sponsored nofollow">Try now</a>
      <a class="cta-secondary" href="${trialUrl}" target="_blank" rel="noopener noreferrer sponsored nofollow">Start free trial</a>
      <a class="btn-secondary cta-tertiary" href="${detailUrl}">Use this tool</a>
    </div>
  `;

  card.addEventListener("click", () => {
    window.location.href = detailUrl;
  });

  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = detailUrl;
    }
  });

  card.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", event => {
      bumpToolPopularity(tool.name, 1);
      event.stopPropagation();
    });
  });

  return card;
}

function createGridAdCard() {
  const ad = document.createElement("div");
  ad.className = "ad-box grid-ad";
  ad.setAttribute("role", "note");
  ad.innerHTML = "<p>Advertisement</p>";
  return ad;
}

function renderGridWithAds(gridElement, items, renderer, includeAds = true) {
  if (!gridElement) return;
  gridElement.innerHTML = "";
  items.forEach((tool, index) => {
    gridElement.appendChild(renderer(tool, index));
    if (includeAds && (index + 1) % 6 === 0 && index + 1 < items.length) {
      gridElement.appendChild(createGridAdCard());
    }
  });
}

function createTrendingCard(tool) {
  const detailUrl = getToolDetailUrl(tool);
  const tryNowUrl = getAffiliateLink(tool, "try");
  const trialUrl = getAffiliateLink(tool, "trial");
  const card = document.createElement("article");
  card.className = "card tool-card trending-card";
  const rank = popularOrder.has(tool.name) ? popularOrder.get(tool.name) + 1 : null;
  const rankBadge = Number.isFinite(rank) ? `<span class="rank-badge">#${rank}</span>` : "";
  card.innerHTML = `
    <div class="card-logo-wrap">
      <img class="tool-logo" src="${getToolLogoUrl(tool)}" alt="${tool.name} logo" loading="lazy" onerror="this.src='https://via.placeholder.com/40'" />
    </div>
    <div class="card-head">
      <h3>${tool.name}</h3>
      <div class="card-head-badges">
        ${rankBadge}
        <span class="category">${tool.category}</span>
      </div>
    </div>
    <div class="card-actions trending-actions">
      <a class="cta-primary" href="${tryNowUrl}" target="_blank" rel="noopener noreferrer sponsored nofollow">Try now</a>
      <a class="cta-secondary" href="${trialUrl}" target="_blank" rel="noopener noreferrer sponsored nofollow">Start free trial</a>
      <a class="btn-secondary cta-tertiary" href="${detailUrl}">Use this tool</a>
    </div>
  `;

  const visitLink = card.querySelector("a");
  if (visitLink) {
    visitLink.addEventListener("click", () => bumpToolPopularity(tool.name, 1));
  }

  return card;
}

function setDirectoryStructuredData() {
  const structuredData = document.getElementById("directoryStructuredData");
  if (!structuredData) return;

  const itemListElement = toolsData.map((tool, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SoftwareApplication",
      name: tool.name,
      applicationCategory: tool.category,
      description: tool.description,
      image: getToolLogoUrl(tool),
      url: `https://aidiscovertools.com/tool.html?name=${encodeURIComponent((tool.slug || getToolSlug(tool)).toLowerCase())}`,
      offers: {
        "@type": "Offer",
        price: tool.price?.monthly ?? 0,
        priceCurrency: "USD"
      }
    }
  }));

  structuredData.textContent = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "AI Discover Tools Directory",
      numberOfItems: toolsData.length,
      itemListElement
    },
    null,
    2
  );
}

function renderCategoryChips() {
  if (!categoryChips) return;
  categoryChips.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");
    button.className = `chip ${category === activeCategory ? "active" : ""}`;
    button.type = "button";
    button.textContent = category;
    button.addEventListener("click", () => {
      activeCategory = category;
      if (categoryFilter) categoryFilter.value = activeCategory;
      renderCategoryChips();
      renderPopularTools();
    });
    categoryChips.appendChild(button);
  });
}

function renderCategoryFilterOptions() {
  if (!categoryFilter) return;
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories
    .filter(category => category !== "all")
    .forEach(category => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = `AI ${category.charAt(0).toUpperCase()}${category.slice(1)}`;
      categoryFilter.appendChild(option);
    });

  categoryFilter.value = activeCategory;
}

function renderCategoryPageLinks() {
  if (!categoryPageLinks) return;

  categoryPageLinks.innerHTML = "";

  categories
    .filter(category => category !== "all")
    .forEach(category => {
      const link = document.createElement("a");
      link.className = "category-link-card";
      link.href = categoryPageMap[category] || `/?category=${encodeURIComponent(category)}`;
      link.textContent = `AI ${category.charAt(0).toUpperCase()}${category.slice(1)}`;
      categoryPageLinks.appendChild(link);
    });
}

function getPriceRank(model) {
  const rank = { free: 0, freemium: 1, paid: 2 };
  return rank[(model || "").toLowerCase()] ?? 3;
}

function sortTools(list) {
  const sorted = [...list];

  if (activeSort === "free-first") {
    return sorted.sort((a, b) => {
      const rankDiff = getPriceRank(a.price?.model) - getPriceRank(b.price?.model);
      if (rankDiff !== 0) return rankDiff;
      return a.name.localeCompare(b.name);
    });
  }

  if (activeSort === "newest") {
    return sorted.sort((a, b) => (toolIndex.get(b.name) ?? 0) - (toolIndex.get(a.name) ?? 0));
  }

  return sorted.sort((a, b) => {
    const scoreDiff = getPopularityScore(b) - getPopularityScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return a.name.localeCompare(b.name);
  });
}

function getFilteredTools() {
  const term = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const filtered = toolsData
    .map(tool => {
      const relevanceScore = getToolRelevanceScore(tool, term);
      return { tool, relevanceScore };
    })
    .filter(({ tool, relevanceScore }) => {
    const categoryMatch = activeCategory === "all" || tool.category === activeCategory;
    const priceMatch = activePrice === "all" || (tool.pricing || tool.price?.model || "").toLowerCase() === activePrice;
    const openSourceMatch = !requireOpenSource || !!tool.openSource;
    const noLoginMatch = !requireNoLogin || tool.loginRequired === false;
    const apiMatch = !requireApi || !!tool.api;

    const searchMatch = term ? relevanceScore > 0 : true;

    return categoryMatch && priceMatch && openSourceMatch && noLoginMatch && apiMatch && searchMatch;
  })
    .sort((a, b) => b.relevanceScore - a.relevanceScore || a.tool.name.localeCompare(b.tool.name))
    .map(item => item.tool);

  return sortTools(filtered);
}

function getHomepageEditorialTools() {
  const eligible = toolsData.filter(tool => (tool.description || "").trim().length > 40);
  const ranked = [...eligible].sort((a, b) => getPopularityScore(b) - getPopularityScore(a) || a.name.localeCompare(b.name));
  const curated = prioritizeToolsByNames(ranked, editorialTopToolNames, 15);
  return curated.slice(0, 15);
}

function renderPopularTools() {
  if (isHomePage) {
    const curatedTools = getHomepageEditorialTools();
    const term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const visibleCurated = term
      ? curatedTools.filter(tool => getToolRelevanceScore(tool, term) > 0)
      : curatedTools;

    renderGridWithAds(popularToolsGrid, visibleCurated, (tool, index) => createToolCard(tool, index + 1), false);
    if (resultInfo) {
      resultInfo.textContent = term
        ? `${visibleCurated.length} editor-selected tools match "${term}".`
        : `Showing ${visibleCurated.length} editor-selected tools reviewed for real-world workflows.`;
    }
    if (emptyState) emptyState.style.display = visibleCurated.length === 0 ? "block" : "none";
    return;
  }

  const filtered = getFilteredTools();
  const visibleTools = filtered.slice(0, 24);
  renderGridWithAds(popularToolsGrid, visibleTools, (tool, index) => createToolCard(tool, index + 1));

  if (resultInfo) resultInfo.textContent = `${filtered.length} tool${filtered.length === 1 ? "" : "s"} found`;
  if (emptyState) emptyState.style.display = filtered.length === 0 ? "block" : "none";

  if (isSearchPage) {
    updateSearchPageQuery();
  }
}

function renderTrendingTools() {
  if (!trendingToolsGrid) return;

  const trendingBase = [...toolsData]
    .sort((a, b) => getPopularityScore(b) - getPopularityScore(a) || a.name.localeCompare(b.name))
    .slice(0, 24);
  const trending = prioritizeToolsByNames(trendingBase, affiliatePriorityTools, 8);

  renderGridWithAds(trendingToolsGrid, trending, tool => createTrendingCard(tool));
}

function renderFeaturedTools() {
  const featuredNames = ["Jasper", "Copy.ai", "Writesonic", "Synthesia", "ElevenLabs"];
  const featured = featuredNames
    .map(name => toolsData.find(tool => tool.name === name))
    .filter(Boolean)
    .slice(0, 5);

  renderGridWithAds(featuredToolsGrid, featured, (tool, index) => createToolCard(tool, index + 1));
}

function getMonthlyMostUsedTools(limit = 8) {
  return [...toolsData]
    .sort((a, b) => getPopularityScore(b) - getPopularityScore(a) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function renderMonthlyMostUsedTools() {
  if (!monthlyTopGrid) return;
  const rankedBase = getMonthlyMostUsedTools(24);
  const ranked = prioritizeToolsByNames(rankedBase, affiliatePriorityTools, 8);
  renderGridWithAds(monthlyTopGrid, ranked, (tool, index) => createToolCard(tool, index + 1));
}

function renderNewTools() {
  if (!newToolsGrid) return;
  const latest = [...toolsData].slice(-12).reverse();
  renderGridWithAds(newToolsGrid, latest, (tool, index) => createToolCard(tool, index + 1));
}

function renderBestFreeTools() {
  if (!freeToolsGrid) return;
  const freeTools = toolsData
    .filter(tool => {
      const model = (tool.pricing || tool.price?.model || "").toLowerCase();
      return model === "free" || model === "freemium";
    })
    .sort((a, b) => getPopularityScore(b) - getPopularityScore(a) || a.name.localeCompare(b.name))
    .slice(0, 8);

  renderGridWithAds(freeToolsGrid, freeTools, (tool, index) => createToolCard(tool, index + 1));
}

function renderMostPopularTools() {
  if (!mostPopularGrid) return;
  const mostPopularBase = [...toolsData]
    .sort((a, b) => getPopularityScore(b) - getPopularityScore(a) || a.name.localeCompare(b.name))
    .slice(0, 24);
  const mostPopular = prioritizeToolsByNames(mostPopularBase, affiliatePriorityTools, 8);

  renderGridWithAds(mostPopularGrid, mostPopular, (tool, index) => createToolCard(tool, index + 1));
}

function renderDirectoryStats() {
  if (totalToolsStat) {
    totalToolsStat.textContent = `${toolsData.length}`;
  }

  if (totalCategoriesStat) {
    const totalCategories = new Set(toolsData.map(tool => tool.category)).size;
    totalCategoriesStat.textContent = `${totalCategories}`;
  }

  if (lastUpdatedStat && (!lastUpdatedStat.textContent.trim() || lastUpdatedStat.textContent.trim() === "-")) {
    const now = new Date();
    const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    lastUpdatedStat.textContent = date;
  }
}

function renderGuideHighlights() {
  if (!guideHighlights) return;

  const guides = [
    {
      title: "Best AI Tools 2026",
      description: "Editorial breakdown of the most useful AI tools across writing, image, video, coding, and productivity workflows.",
      href: "best-ai-tools-2026.html"
    },
    {
      title: "Best Free AI Tools",
      description: "A curated list of free and freemium AI tools with practical tips for students, freelancers, and small teams.",
      href: "best-free-ai-tools.html"
    },
    {
      title: "AI Tools for Students",
      description: "Study-focused AI tools for notes, writing support, research summaries, and exam preparation workflows.",
      href: "ai-tools-for-students.html"
    },
    {
      title: "AI Tools for Marketing",
      description: "Top tools for SEO, ad creative, campaign planning, social publishing, and conversion-focused copywriting.",
      href: "ai-tools-for-marketing.html"
    },
    {
      title: "AI Tools for Developers",
      description: "Practical coding AI tools for code generation, debugging, testing, and faster software delivery.",
      href: "ai-tools-for-developers.html"
    }
  ];

  guideHighlights.innerHTML = "";

  guides.forEach(guide => {
    const card = document.createElement("article");
    card.className = "blog-card";
    card.innerHTML = `
      <h3>${guide.title}</h3>
      <p>${guide.description}</p>
      <a href="${guide.href}">Read Guide</a>
    `;
    guideHighlights.appendChild(card);
  });
}

function bindEvents() {
  if (searchInput) searchInput.addEventListener("input", renderPopularTools);
  if (categoryFilter) {
    categoryFilter.addEventListener("change", event => {
      activeCategory = event.target.value;
      renderCategoryChips();
      renderPopularTools();
    });
  }
  if (priceFilter) {
    priceFilter.addEventListener("change", event => {
      activePrice = event.target.value;
      renderPopularTools();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", event => {
      activeSort = event.target.value;
      renderPopularTools();
    });
  }

  if (openSourceFilter) {
    openSourceFilter.addEventListener("change", event => {
      requireOpenSource = event.target.checked;
      renderPopularTools();
    });
  }

  if (noLoginFilter) {
    noLoginFilter.addEventListener("change", event => {
      requireNoLogin = event.target.checked;
      renderPopularTools();
    });
  }

  if (apiFilter) {
    apiFilter.addEventListener("change", event => {
      requireApi = event.target.checked;
      renderPopularTools();
    });
  }

  function applyQuickFilter(category, price) {
    activeCategory = category;
    activePrice = price;
    if (categoryFilter) categoryFilter.value = activeCategory;
    if (priceFilter) priceFilter.value = activePrice;
    renderCategoryChips();
    renderPopularTools();
  }

  if (quickAllTools) {
    quickAllTools.addEventListener("click", () => applyQuickFilter("all", "all"));
  }
  if (quickFreeTools) {
    quickFreeTools.addEventListener("click", () => applyQuickFilter("all", "free"));
  }
  if (quickPaidTools) {
    quickPaidTools.addEventListener("click", () => applyQuickFilter("all", "paid"));
  }
  if (quickWritingTools) {
    quickWritingTools.addEventListener("click", () => applyQuickFilter("writing", "all"));
  }
  if (quickImageTools) {
    quickImageTools.addEventListener("click", () => applyQuickFilter("image", "all"));
  }
  if (quickVideoTools) {
    quickVideoTools.addEventListener("click", () => applyQuickFilter("video", "all"));
  }

  if (finderTaskButton) {
    finderTaskButton.addEventListener("click", () => {
      const query = finderTaskInput ? finderTaskInput.value.trim() : "";
      const target = query
        ? `ai-tool-finder.html?q=${encodeURIComponent(query)}`
        : "ai-tool-finder.html";
      window.location.href = target;
    });
  }

  if (finderTaskInput) {
    finderTaskInput.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (finderTaskButton) finderTaskButton.click();
      }
    });
  }
}

function applySearchPageParams() {
  if (!isSearchPage) return;
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const category = (params.get("category") || "all").toLowerCase();
  const pricing = (params.get("pricing") || "all").toLowerCase();
  const sort = (params.get("sort") || "most-popular").toLowerCase();

  if (searchInput) searchInput.value = q;
  if (categories.includes(category)) activeCategory = category;
  if (["all", "free", "freemium", "paid"].includes(pricing)) activePrice = pricing;
  if (["most-popular", "free-first", "newest"].includes(sort)) activeSort = sort;

  if (categoryFilter) categoryFilter.value = activeCategory;
  if (priceFilter) priceFilter.value = activePrice;
  if (sortSelect) sortSelect.value = activeSort;
}

function updateSearchPageQuery() {
  if (!isSearchPage) return;
  const params = new URLSearchParams();
  const term = searchInput ? searchInput.value.trim() : "";
  if (term) params.set("q", term);
  if (activeCategory !== "all") params.set("category", activeCategory);
  if (activePrice !== "all") params.set("pricing", activePrice);
  if (activeSort !== "most-popular") params.set("sort", activeSort);
  const query = params.toString();
  const url = query ? `search.html?${query}` : "search.html";
  window.history.replaceState({}, "", url);
}

async function initializeDirectory() {
  toolsData = await loadTools();
  categories = ["all", ...new Set(toolsData.map(tool => tool.category))];
  toolIndex = new Map(toolsData.map((tool, index) => [tool.name, index]));

  renderCategoryFilterOptions();
  applySearchPageParams();
  bindEvents();
  setDirectoryStructuredData();
  renderCategoryChips();
  renderCategoryPageLinks();
  renderTrendingTools();
  renderMonthlyMostUsedTools();
  renderBestFreeTools();
  renderMostPopularTools();
  renderPopularTools();
  renderFeaturedTools();
  renderNewTools();
  renderDirectoryStats();
  renderGuideHighlights();
  renderSeoAutoPages();
}

initializeDirectory();
