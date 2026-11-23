const landingTitle = document.getElementById("landingTitle");
const landingIntro = document.getElementById("landingIntro");
const landingGrid = document.getElementById("landingGrid");
const landingTopCta = document.getElementById("landingTopCta");
const landingMidCta = document.getElementById("landingMidCta");
const landingBottomCta = document.getElementById("landingBottomCta");
const pageConfig = document.getElementById("landingConfig");
const affiliatePriorityNames = ["Jasper", "Copy.ai", "Writesonic", "Synthesia", "ElevenLabs"];

function slugifyToolName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getToolLogoUrl(tool) {
  try {
    const domain = new URL(tool.url).hostname.replace("www.", "");
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  } catch (error) {
    if (tool.domain) {
      return `https://www.google.com/s2/favicons?sz=128&domain=${tool.domain}`;
    }
    return "https://via.placeholder.com/40";
  }
}

function setStructuredData(title, description, toolList) {
  const script = document.getElementById("landingStructuredData");
  if (!script) return;

  script.textContent = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: toolList.length,
        itemListElement: toolList.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "SoftwareApplication",
            name: tool.name,
            applicationCategory: tool.category,
            url: `tool.html?name=${slugifyToolName(tool.name)}`
          }
        }))
      }
    },
    null,
    2
  );
}

function getBestTools() {
  const perCategory = 4;
  const categories = ["writing", "image", "video", "coding", "marketing", "productivity"];
  const selected = [];

  categories.forEach(category => {
    selected.push(...tools.filter(tool => tool.category === category).slice(0, perCategory));
  });

  return selected;
}

function getScoredTools(keywords, preferredCategories, limit = 24) {
  const keywordList = keywords.map(item => item.toLowerCase());
  const preferred = new Set(preferredCategories);

  return tools
    .map(tool => {
      const text = `${tool.name} ${tool.description} ${tool.category} ${tool.tags.join(" ")}`.toLowerCase();
      const keywordScore = keywordList.reduce((score, keyword) => {
        return score + (text.includes(keyword) ? 1 : 0);
      }, 0);
      const categoryScore = preferred.has(tool.category) ? 2 : 0;
      const score = keywordScore + categoryScore;
      return { tool, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, limit)
    .map(item => item.tool);
}

function prioritizeAffiliateTools(toolList, limit = 24) {
  const used = new Set();
  const pinned = affiliatePriorityNames
    .map(name => toolList.find(tool => tool.name === name))
    .filter(tool => {
      if (!tool || used.has(tool.name)) return false;
      used.add(tool.name);
      return true;
    });
  const rest = toolList.filter(tool => !used.has(tool.name));
  return [...pinned, ...rest].slice(0, limit);
}
function getToolsForPage(pageKey) {
  if (pageKey === "best") {
    return getBestTools();
  }

  if (pageKey === "top-50") {
    return [...tools]
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 50);
  }

  if (pageKey === "free") {
    return tools
      .filter(tool => {
        const model = (tool.price?.model || "").toLowerCase();
        return model === "free" || model === "freemium";
      })
      .slice(0, 36);
  }

  const categoryMap = {
    writing: "writing",
    image: "image",
    video: "video",
    productivity: "productivity"
  };

  const category = categoryMap[pageKey];
  if (category) {
    return tools.filter(tool => tool.category === category);
  }

  const audienceMap = {
    students: {
      keywords: ["study", "notes", "summary", "research", "writing", "learning", "meeting", "assistant"],
      categories: ["writing", "productivity"]
    },
    "chatgpt-alternatives": {
      keywords: ["assistant", "chat", "reasoning", "writing", "productivity", "research", "conversation", "ai"],
      categories: ["writing", "productivity", "coding"]
    },
    marketing: {
      keywords: ["marketing", "seo", "ads", "social", "campaign", "content", "email", "conversion"],
      categories: ["marketing", "writing", "image", "video"]
    },
    developers: {
      keywords: ["coding", "developer", "code", "refactor", "debug", "tests", "ide", "assistant"],
      categories: ["coding", "productivity"]
    },
    business: {
      keywords: ["business", "enterprise", "automation", "crm", "workflow", "planning", "productivity"],
      categories: ["productivity", "marketing", "writing"]
    },
    "content-creators": {
      keywords: ["content", "video", "image", "social", "creator", "editing", "voice", "script"],
      categories: ["video", "image", "writing", "marketing"]
    },
    designers: {
      keywords: ["design", "art", "image", "creative", "visual", "brand", "assets", "concept"],
      categories: ["image", "video"]
    },
    productivity: {
      keywords: ["productivity", "notes", "meeting", "calendar", "tasks", "planning", "automation"],
      categories: ["productivity", "writing"]
    },
    startups: {
      keywords: ["startup", "mvp", "growth", "automation", "marketing", "productivity", "coding", "launch"],
      categories: ["coding", "marketing", "productivity", "writing"]
    },
    research: {
      keywords: ["research", "analysis", "documents", "search", "citations", "summary", "knowledge"],
      categories: ["writing", "productivity"]
    }
  };

  const audience = audienceMap[pageKey];
  if (!audience) {
    return [];
  }

  const scored = getScoredTools(audience.keywords, audience.categories, 24);
  if (pageKey === "business" || pageKey === "marketing") {
    return prioritizeAffiliateTools(scored, 24);
  }
  return scored;
}

function renderTools(toolList) {
  landingGrid.innerHTML = "";

  toolList.forEach((tool, index) => {
    const slug = slugifyToolName(tool.name);
    const initials = tool.name
      .split(" ")
      .slice(0, 2)
      .map(part => part[0] || "")
      .join("")
      .toUpperCase();
    const priceText = tool.price?.model === "Free"
      ? "Free"
      : `${tool.price?.model || "Paid"} - $${tool.price?.monthly ?? 0}/mo`;
    const card = document.createElement("article");
    card.className = "landing-card";
    card.innerHTML = `
      <div class="card-logo-wrap">
        <div class="tool-logo" aria-hidden="true">
          <img class="tool-logo-img" src="${getToolLogoUrl(tool)}" alt="" loading="lazy" />
          <span class="tool-logo-fallback">${initials}</span>
        </div>
      </div>
      <h3>${tool.name}</h3>
      <div class="card-badges">
        <span class="rank-badge">#${index + 1}</span>
        <span class="category">${tool.category}</span>
        <span class="price-badge">${priceText}</span>
      </div>
      <p>${tool.description}</p>
      <div class="tags">${tool.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
      <div class="landing-links affiliate-ctas">
        <a class="cta-primary" href="${tool.affiliateUrl || tool.url}" target="_blank" rel="noopener noreferrer sponsored nofollow">Try now</a>
        <a class="cta-tertiary" href="tool.html?name=${slug}">Use this tool</a>
      </div>
    `;

    const logoImg = card.querySelector(".tool-logo-img");
    const fallback = card.querySelector(".tool-logo-fallback");
    logoImg.addEventListener("error", () => {
      logoImg.style.display = "none";
      fallback.style.display = "grid";
    });
    logoImg.addEventListener("load", () => {
      fallback.style.display = "none";
    });

    landingGrid.appendChild(card);
  });
}

function renderLandingCtaBlocks() {
  const html = `
    <div class="tool-cta-group tool-cta-stack">
      <a class="tool-link tool-link-cta cta-primary" href="best-ai-tools.html">Try now</a>
      <a class="tool-link tool-link-cta cta-tertiary" href="index.html#tools">Use this tool</a>
    </div>
  `;

  if (landingTopCta) landingTopCta.innerHTML = html;
  if (landingMidCta) landingMidCta.innerHTML = html;
  if (landingBottomCta) landingBottomCta.innerHTML = html;
}
function applySeoMeta(title, description) {
  document.title = title;

  const desc = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');

  if (desc) desc.setAttribute("content", description);
  if (ogTitle) ogTitle.setAttribute("content", title);
  if (ogDescription) ogDescription.setAttribute("content", description);
  if (twitterTitle) twitterTitle.setAttribute("content", title);
  if (twitterDescription) twitterDescription.setAttribute("content", description);
}

const title = pageConfig.dataset.title;
const intro = pageConfig.dataset.intro;
const pageKey = pageConfig.dataset.page;

landingTitle.textContent = title;
landingIntro.textContent = intro;

const toolList = getToolsForPage(pageKey);
renderTools(toolList);
setStructuredData(title, intro, toolList);
applySeoMeta(title, intro);
renderLandingCtaBlocks();







