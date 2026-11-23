const toolContainer = document.getElementById("toolContainer");
const relatedGrid = document.getElementById("relatedGrid");
const themeToggle = document.getElementById("themeToggle");
const alternativesHeading = document.getElementById("alternativesHeading");
let toolsData = [];

const CATEGORY_PAGE_MAP = {
  writing: "ai-writing-tools.html",
  image: "ai-image-generators.html",
  video: "ai-video-tools.html",
  coding: "best-ai-tools-for-developers.html",
  marketing: "best-ai-tools-for-marketing.html",
  productivity: "ai-productivity-tools.html"
};

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

function slugifyToolName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getToolSlug(tool) {
  return tool?.slug || slugifyToolName(tool?.name || "");
}

function getToolDetailUrl(tool) {
  return `tool.html?name=${encodeURIComponent(getToolSlug(tool))}`;
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

function createTags(tags = []) {
  return tags.map(tag => `<span class="tag">${tag}</span>`).join("");
}

function getToolLogoUrl(tool) {
  try {
    const domain = new URL(tool.url).hostname.replace("www.", "");
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  } catch (error) {
    return "https://via.placeholder.com/40";
  }
}

function getPriceLabel(tool) {
  const model = tool?.price?.model;
  const monthly = Number(tool?.price?.monthly || 0);
  if (!model) return "Pricing: Varies";
  if (model === "Free") return "Free";
  if (model === "Freemium") return "Freemium";
  if (model === "Paid" && monthly > 0) return `Paid - from $${monthly}/mo`;
  return "Paid";
}

function getPopularityStorageKey() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `toolPopularity:${now.getFullYear()}-${month}`;
}

function getToolPopularity(toolName) {
  try {
    const raw = localStorage.getItem(getPopularityStorageKey());
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed[toolName] || 0;
  } catch (error) {
    return 0;
  }
}

function bumpToolPopularity(toolName, increment = 1) {
  try {
    const key = getPopularityStorageKey();
    const raw = localStorage.getItem(key);
    const map = raw ? JSON.parse(raw) : {};
    map[toolName] = (map[toolName] || 0) + increment;
    localStorage.setItem(key, JSON.stringify(map));
  } catch (error) {
    // Ignore storage failures.
  }
}

function getToolScore(tool) {
  const popularityBase = popularOrder.has(tool.name) ? 10 - Math.min(popularOrder.get(tool.name), 9) : 4;
  const popularityDynamic = Math.min(getToolPopularity(tool.name) / 8, 2);
  const features = Math.min(((tool.api ? 1 : 0) + (tool.openSource ? 1 : 0) + Math.min((tool.tags || []).length, 4) / 2), 3);
  const pricing = tool.price?.model === "Free" ? 2 : tool.price?.model === "Freemium" ? 1.5 : 1;
  const ease = tool.loginRequired === false ? 2 : 1.4;
  const raw = popularityBase * 0.45 + popularityDynamic * 0.2 + features * 0.2 + pricing * 0.1 + ease * 0.05;
  return Math.max(6.5, Math.min(9.9, raw)).toFixed(1);
}

function formatCategoryName(category) {
  if (!category) return "AI Tools";
  return `AI ${category.charAt(0).toUpperCase()}${category.slice(1)}`;
}

function getCategoryPageLink(category) {
  return CATEGORY_PAGE_MAP[category] || "best-ai-tools.html";
}

function getCategoryBlueprint(category) {
  const map = {
    writing: {
      features: [
        "Content generation for long and short formats",
        "Blog writing and outline assistance",
        "Grammar, tone, and readability improvements",
        "Copywriting support for ads and landing pages",
        "Summaries and document rewriting",
        "SEO-friendly content drafting"
      ],
      useCases: [
        "Writing blog posts",
        "Creating marketing copy",
        "Drafting product descriptions",
        "Improving email and outreach text",
        "Summarizing long documents"
      ]
    },
    image: {
      features: [
        "Prompt-based image generation",
        "Style customization and iteration controls",
        "Image upscaling and enhancement",
        "Object/background edits",
        "Fast concept art creation",
        "Template-friendly visual outputs"
      ],
      useCases: [
        "Generating social media images",
        "Creating ad and campaign visuals",
        "Design concept ideation",
        "Making product mockups",
        "Building presentation graphics"
      ]
    },
    video: {
      features: [
        "Text-to-video and script-to-video workflows",
        "Automatic captions and subtitle support",
        "AI scene generation and editing",
        "Voiceover and avatar options",
        "Short-form clip repurposing",
        "Template-based video production"
      ],
      useCases: [
        "Video editing",
        "Creating explainer videos",
        "Repurposing podcasts into clips",
        "Publishing short social videos",
        "Producing training content"
      ]
    },
    coding: {
      features: [
        "Code completion and inline suggestions",
        "Debugging and error explanation",
        "Refactoring recommendations",
        "Test case generation",
        "Documentation and comments assistance",
        "Codebase-aware query support"
      ],
      useCases: [
        "Coding assistance",
        "Faster bug fixing",
        "Writing unit tests",
        "Refactoring legacy modules",
        "Accelerating feature delivery"
      ]
    },
    marketing: {
      features: [
        "Campaign copy generation",
        "SEO planning and optimization support",
        "Ad creative and variation ideation",
        "Social content production workflows",
        "Conversion-oriented message suggestions",
        "Content calendar assistance"
      ],
      useCases: [
        "Writing ad and email copy",
        "Planning content campaigns",
        "Creating social media posts",
        "Optimizing conversion copy",
        "Producing SEO content briefs"
      ]
    },
    productivity: {
      features: [
        "Meeting summaries and action extraction",
        "Task automation and workflow support",
        "Note drafting and organization",
        "Smart search across work documents",
        "Calendar and time management support",
        "Team collaboration enhancements"
      ],
      useCases: [
        "Managing daily task workflows",
        "Summarizing meetings quickly",
        "Organizing project notes",
        "Prioritizing team backlog",
        "Reducing repetitive admin work"
      ]
    }
  };

  return map[category] || {
    features: [
      "Automates repetitive workflows",
      "Improves consistency and speed",
      "Supports team collaboration",
      "Provides task-specific AI assistance"
    ],
    useCases: [
      "Increasing daily productivity",
      "Improving workflow quality",
      "Reducing manual overhead",
      "Supporting project execution"
    ]
  };
}

function getWhatIsText(tool) {
  const categoryLabel = formatCategoryName(tool.category);
  const pricingText = getPriceLabel(tool);
  const paragraphOne = `${tool.name} is a ${categoryLabel} platform designed to help users work faster with less manual effort. ${tool.description} It is built for individuals, teams, and businesses that want reliable AI support for day-to-day tasks and content production.`;
  const paragraphTwo = `${tool.name} is especially useful for users who need scalable workflows, consistent output quality, and faster turnaround times. With a ${pricingText.toLowerCase()} model and ${tool.api ? "API support" : "no public API requirement"}, it can fit both simple and advanced use cases depending on your workflow needs.`;
  const paragraphThree = `Most teams use ${tool.name} as part of a broader stack rather than as a standalone replacement for human decision-making. The strongest results usually come from combining AI-generated output with editorial review, quality control, and clear workflow standards.`;
  return [paragraphOne, paragraphTwo, paragraphThree];
}

function getIntroductionText(tool, relatedTools) {
  const categoryLabel = formatCategoryName(tool.category);
  const relatedText = relatedTools.length
    ? `${tool.name} is usually compared with ${relatedTools.slice(0, 2).map(item => item.name).join(" and ")}, but the better question is not which product sounds more impressive on paper. It is which one actually earns a place in your weekly workflow.`
    : `${tool.name} should be judged by how it performs in real work, not by how polished it looks in a short demo.`;
  const paragraphOne = `${tool.name} operates in the ${categoryLabel} category, where users often face the same problem: too many tools promise efficiency, and too few explain what kind of value they actually create after the first trial. That is why we approach pages like this as reviews rather than listings. The useful question is not whether the tool can generate output. Most products can do that. The better question is whether the output is good enough, fast enough, and controllable enough to reduce friction in a real workflow. ${relatedText}`;
  const paragraphTwo = `In our view, the strongest AI products are the ones that improve the middle of the process. They help users get to a solid draft faster, reduce repetitive cleanup, and make iteration less painful. That can mean writing support, design exploration, meeting summaries, code assistance, or campaign execution depending on the category. ${tool.name} is worth examining through that lens. If it helps shorten the path to a usable result while still leaving room for human judgment, it can be a genuinely valuable tool. If it creates more review work than it saves, the appeal fades quickly.`;
  return [paragraphOne, paragraphTwo];
}

function getOverviewText(tool) {
  const categoryLabel = formatCategoryName(tool.category);
  const model = (tool.price?.model || "Paid").toLowerCase();
  const paragraphOne = `${tool.name} is positioned as a practical ${categoryLabel} solution for people who need repeatable results without spending excessive time on manual tasks. In most teams, the biggest benefit comes from reducing preparation work. Instead of starting from a blank page or piecing together a workflow from multiple disconnected tools, users can move directly into execution with clearer outputs. This makes ${tool.name} particularly useful for teams that need predictable delivery across weekly content, campaign, development, or operational cycles.`;
  const paragraphTwo = `From a workflow perspective, ${tool.name} is most effective when teams define a clear success metric before adoption. Common metrics include faster turnaround time, better first-draft quality, fewer revision loops, and improved consistency across outputs. The platform works best as an accelerator, not as a replacement for human judgment. Teams that pair AI output with editorial checks, internal standards, and context-specific review usually achieve stronger results than teams that rely on raw output alone.`;
  const paragraphThree = `Another reason ${tool.name} stands out is flexibility. Depending on the role, users can apply it to brainstorming, production drafts, optimization tasks, or process automation. This makes it suitable for both individual operators and cross-functional teams. Because the pricing model is ${model}, organizations can typically pilot the tool in a low-risk phase before broader rollout. A short pilot with real tasks is the most reliable way to confirm if ${tool.name} improves speed while preserving quality.`;
  const paragraphFour = `For long-term value, teams should review how well ${tool.name} fits existing systems, collaboration practices, and publishing requirements. Integration depth, access controls, and export reliability are often more important than headline features. If the tool can reduce repetitive effort while preserving output standards, it usually becomes a durable part of the stack. If not, switching to a better-fit alternative early is the better decision. In short, ${tool.name} is strongest when deployed with a clear process, measurable goals, and deliberate quality control.`;
  return [paragraphOne, paragraphTwo, paragraphThree, paragraphFour];
}

function getCategoryAudienceLabel(category) {
  const map = {
    writing: "marketers, writers, founders, and content teams",
    image: "designers, marketers, ecommerce teams, and creators",
    video: "creators, media teams, educators, and growth marketers",
    coding: "developers, engineering teams, and technical founders",
    marketing: "growth teams, agencies, founders, and demand generation operators",
    productivity: "operators, managers, researchers, and busy cross-functional teams"
  };
  return map[category] || "individual users and teams with repeatable workflow needs";
}

function getHumanPerspective(tool) {
  const categoryMap = {
    writing: `${tool.name} looks most convincing when the real problem is output volume, not originality. In our view, writing tools earn their keep when they shorten drafting and rewriting time without flattening the voice so much that every piece sounds interchangeable.`,
    image: `With image tools, the gap between a fun demo and a useful workflow is still real. ${tool.name} feels more valuable when you judge it on repeatable creative work, brand fit, and iteration speed instead of on one spectacular image shared online.`,
    video: `Video AI often gets overhyped, so we look for tools that remove editing pain instead of promising to replace production entirely. ${tool.name} is more compelling when it helps publish faster without making the final result feel generic.`,
    coding: `Coding tools create value quickly, but they can also create false confidence. Our bias is toward tools that help developers move faster while still leaving enough room for review, debugging, and code ownership.`,
    marketing: `Marketing tools are easy to oversell because they can generate a lot of output very quickly. ${tool.name} is only truly useful if the extra output improves campaign quality or speed instead of creating more copy for the team to sort through.`,
    productivity: `Productivity software is rarely flashy, but it can be extremely valuable when it removes repeated admin work. ${tool.name} looks strongest when it helps people make decisions faster, not just generate more summaries and notes.`
  };
  return categoryMap[tool.category] || `${tool.name} is easiest to justify when it removes a recurring bottleneck instead of adding another app for the team to manage.`;
}

function getWhoShouldUse(tool) {
  const list = [
    `Teams focused on ${tool.category} operations`,
    "Freelancers who need faster production cycles",
    "Startups validating workflows with limited resources",
    "Operations or marketing teams improving output consistency"
  ];

  if (tool.api) {
    list.push("Technical teams integrating AI into existing products");
  }

  if (tool.openSource) {
    list.push("Users who prefer transparent and flexible ecosystems");
  }

  return list.slice(0, 6);
}

function getWhoShouldUseText(tool) {
  const audience = getCategoryAudienceLabel(tool.category);
  const paragraphOne = `${tool.name} is best suited for ${audience} who already know the kind of task they want to speed up. It is usually a stronger fit for people with recurring workflows than for users who just want to experiment once and move on. If the same drafting, editing, planning, or production task shows up every week, the tool has a better chance of delivering measurable value.`;
  const paragraphTwo = `It is especially relevant for users who care about reducing time-to-first-draft while keeping enough control to review and improve the result. That includes solo operators trying to ship more, small teams working without extra headcount, and larger teams that need more consistency across outputs. ${tool.api ? "Technical teams may also find it easier to scale because API access opens the door to workflow automation." : "Non-technical teams may appreciate the lower setup burden because most of the value comes through the interface itself."}`;
  const paragraphThree = `Who should probably skip it? Users without a clear use case, teams expecting fully hands-off automation, or anyone who is not ready to review outputs before publishing. In our experience, AI tools work best when there is already a real process in place and the software is used to accelerate that process rather than define it from scratch.`;
  return [paragraphOne, paragraphTwo, paragraphThree];
}

function getEvaluationText(tool) {
  const categoryLabel = formatCategoryName(tool.category);
  const integrationText = tool.api
    ? "It provides API support, which can help teams connect it to existing systems and automate repetitive steps."
    : "It is mainly designed for direct use through its interface, which can still be effective for non-technical users.";
  const accessText = tool.loginRequired === false
    ? "No mandatory login requirement lowers friction for quick testing."
    : "Account-based access is common, so teams should review onboarding and access controls before rollout.";

  const paragraphOne = `When evaluating ${tool.name}, focus on output quality consistency, speed under real workloads, and how well results match your brand or project standards. In ${categoryLabel} workflows, a tool that produces fast but inconsistent output can create review overhead. A practical evaluation method is to test ${tool.name} on three recurring tasks from your weekly process and compare the time-to-completion against your current baseline.`;
  const paragraphTwo = `${integrationText} ${accessText} Teams should also review pricing limits, collaboration options, and export flexibility before adoption. A tool is usually worth long-term use when it reduces manual work without lowering quality expectations.`;

  return [paragraphOne, paragraphTwo];
}

function getWorthItText(tool, relatedTools) {
  const comparisonText = relatedTools.length
    ? `${tool.name} becomes easier to justify when it compares well against nearby alternatives like ${relatedTools.slice(0, 3).map(item => item.name).join(", ")}.`
    : `${tool.name} becomes easier to justify when it clearly improves one repeated workflow.`;
  const pricingText = tool.price?.model === "Paid"
    ? "Because it is a paid product, the decision should come down to whether it saves enough time or improves enough output quality to offset the subscription."
    : "Because it has a lower-friction entry point, it is relatively easy to test before making a bigger commitment.";
  const paragraphOne = `Is ${tool.name} worth it? Usually yes, but only for the right user. ${pricingText} We would not judge it by a five-minute trial or a few playful prompts. The better test is to run it against real work for a week and see whether it reduces manual effort without creating extra cleanup later.`;
  const paragraphTwo = `${comparisonText} In editorial terms, a tool is worth paying for when it reliably improves the boring middle of the workflow: drafting, iteration, cleanup, organization, or handoff. That is where software creates durable value. If ${tool.name} only feels impressive in isolated demos, it is probably not the right long-term fit.`;
  const paragraphThree = `Our general advice is simple: if you can point to a repeated task that feels noticeably easier after adopting ${tool.name}, then it is probably worth it. If the team still ends up redoing most of the work manually, the subscription will feel expensive no matter how polished the product looks.`;
  return [paragraphOne, paragraphTwo, paragraphThree];
}

function getPros(tool) {
  const pros = [
    `${tool.name} fits well into ${tool.category} workflows`,
    "Simple onboarding for new users",
    "Improves speed for repetitive tasks"
  ];
  if (tool.price?.model === "Free" || tool.price?.model === "Freemium") {
    pros.push("Can be tested with low upfront cost");
  }
  if (tool.api) pros.push("Offers API options for integrations");
  return pros.slice(0, 5);
}

function getCons(tool) {
  const cons = [
    "Output quality depends on prompt quality",
    "Requires review before publishing production work"
  ];
  if (tool.loginRequired !== false) cons.push("Account setup is required for full use");
  if (tool.price?.model === "Paid") cons.push("Paid plan may be needed for advanced features");
  if (!tool.openSource) cons.push("Limited transparency compared to open-source alternatives");
  return cons.slice(0, 5);
}

function getFaq(tool, relatedTools) {
  return [
    {
      q: `What is ${tool.name} used for?`,
      a: `${tool.name} is primarily used for ${tool.category} workflows, helping users automate repetitive tasks, improve output consistency, and speed up execution in day-to-day projects.`
    },
    {
      q: `Is ${tool.name} free?`,
      a: `${tool.name} uses a ${tool.price?.model || "Paid"} pricing model. Pricing and plan limits can change over time, so you should confirm current details on the official website before making a purchasing decision.`
    },
    {
      q: `Who should use ${tool.name}?`,
      a: `${tool.name} is suitable for creators, operators, marketers, and teams who want to reduce manual work and improve output consistency. It is especially useful when you need to produce high volumes of work while keeping quality standards stable.`
    },
    {
      q: `Are there alternatives to ${tool.name}?`,
      a: relatedTools.length
        ? `Yes. Alternatives in the same category include ${relatedTools.slice(0, 3).map(item => item.name).join(", ")}.`
        : "Yes. There are multiple tools in this category with similar capabilities."
    }
  ];
}

function getFinalVerdict(tool, relatedTools) {
  const price = tool.price?.model || "Paid";
  const alternatives = relatedTools.slice(0, 2).map(item => item.name).join(" and ");
  const alternativeText = alternatives
    ? `If you are comparing options, ${alternatives} are useful benchmarks in the same category.`
    : "If you are comparing options, review a few tools in the same category before committing.";
  const integrationText = tool.api
    ? "It also offers API support, which is valuable for teams that want to automate repeatable workflows."
    : "It is better suited to interface-first users who want fast setup without implementation complexity.";

  return `${tool.name} is a strong choice for users who need reliable ${tool.category} outcomes with a ${price.toLowerCase()} pricing model. In practice, the tool works best when teams define clear quality standards and use AI as a production accelerator, not as a replacement for expert review. ${integrationText} ${alternativeText} The best adoption strategy is a short pilot using real tasks, followed by a decision based on speed gains, output quality, and collaboration fit.`;
}

function getOurVerdictText(tool, relatedTools) {
  const paragraphOne = `Our verdict on ${tool.name} is that it belongs in the conversation for serious ${tool.category} workflows, but the reason matters. We would not describe it as universally essential. We would describe it as a strong candidate when you care about workflow speed, repeatability, and getting to a usable result with less friction. ${getHumanPerspective(tool)}`;
  const paragraphTwo = getFinalVerdict(tool, relatedTools);
  const paragraphThree = `The smartest way to use ${tool.name} is to keep expectations practical. Let it do the repetitive setup work, use human judgment for final quality control, and compare the real output against at least one alternative before committing. That approach usually reveals very quickly whether the tool is genuinely helpful or just easy to admire from a distance.`;
  return [paragraphOne, paragraphTwo, paragraphThree];
}

function getRating(tool, score) {
  const numeric = Number(score);
  const capped = Number.isFinite(numeric) ? Math.max(0, Math.min(5, numeric / 2)) : 4.2;
  const rounded = Math.round(capped * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded % 1 !== 0 ? "☆" : "";
  const empty = "☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)));
  const stars = `${"★".repeat(full)}${half}${empty}`;
  const explanation = `${tool.name} scores ${rounded.toFixed(1)}/5 based on usability, output consistency, workflow fit, and value for its pricing tier.`;
  return { score: rounded.toFixed(1), stars, explanation };
}

function getPricingExplanation(tool) {
  const model = tool.price?.model || "Paid";
  if (model === "Free") {
    return `${tool.name} offers a free plan, which is useful for testing workflow fit before any upgrade decision. Teams should still review usage limits such as output caps, feature restrictions, and collaboration constraints to confirm long-term viability.`;
  }
  if (model === "Freemium") {
    return `${tool.name} uses a freemium model, which typically includes a usable entry tier plus advanced paid capabilities. This is a practical approach for teams that want to validate value in production tasks before scaling usage.`;
  }
  return `${tool.name} is primarily paid, which can be justified when the tool creates measurable gains in speed, quality, or operational consistency. Before adoption, compare expected monthly usage against productivity improvements and collaboration benefits.`;
}

function createReviewSection(title, content) {
  if (!content) return "";
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.trim())
    .filter(Boolean)
    .map(paragraph => `<p class="tool-description">${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `
    <section class="tool-review-section">
      <h2>${title}</h2>
      ${paragraphs}
    </section>
  `;
}

function createCustomReviewSections(tool) {
  const review = tool.review || {};
  const sections = [
    ["What it is", review.whatItIs],
    ["Who it is for", review.whoItIsFor],
    ["What it does best", review.bestAt],
    ["Limitations", review.limitations],
    ["Pricing", review.pricing],
    ["Alternatives", review.alternatives],
    ["Verdict", review.verdict],
    ["Personal experience", review.personalExperience]
  ];

  return sections.map(([title, content]) => createReviewSection(title, content)).join("");
}

function createToolCtaBlock(tryNowUrl, trialUrl, useUrl) {
  return `
    <div class="tool-cta-group tool-cta-stack">
      <a class="tool-link tool-link-cta cta-primary" href="${tryNowUrl}" target="_blank" rel="noopener noreferrer sponsored nofollow">Try now</a>
      <a class="tool-link tool-link-cta cta-secondary" href="${trialUrl}" target="_blank" rel="noopener noreferrer sponsored nofollow">Start free trial</a>
      <a class="tool-link tool-link-cta cta-tertiary" href="${useUrl}" target="_blank" rel="noopener noreferrer sponsored nofollow">Use this tool</a>
    </div>
  `;
}

function getToolFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const toolName = params.get("name");
  if (!toolName) return null;
  const normalizedName = toolName.toLowerCase().trim();
  console.log("Tool loaded:", normalizedName);

  if (!normalizedName) return null;

  return (
    toolsData.find(tool => {
      const slug = (tool.slug || "").toLowerCase();
      return slug === normalizedName;
    }) || null
  );
}

function getRelatedTools(currentTool) {
  return toolsData
    .filter(tool => tool.name !== currentTool.name && tool.category === currentTool.category)
    .slice(0, 5);
}

function setSeoMeta(tool, relatedTools) {
  const title = `${tool.name} Review, Pricing & Alternatives (2026) | AI Discover Tools`;
  const description = `Learn what ${tool.name} does, key features, use cases, pros and cons, pricing, and top alternatives in ${formatCategoryName(tool.category)}.`;
  const slug = encodeURIComponent(getToolSlug(tool));
  const url = `https://aidiscovertools.com/tool.html?name=${slug}`;

  document.title = title;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) descriptionMeta.setAttribute("content", description);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const canonical = document.getElementById("canonicalUrl");

  if (ogTitle) ogTitle.setAttribute("content", title);
  if (ogDescription) ogDescription.setAttribute("content", description);
  if (ogUrl) ogUrl.setAttribute("content", url);
  if (canonical) canonical.setAttribute("href", url);

  const faqEntities = getFaq(tool, relatedTools).map(item => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a
    }
  }));

  const structuredData = document.getElementById("structuredData");
  if (structuredData) {
    structuredData.textContent = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "SoftwareApplication",
            name: tool.name,
            applicationCategory: formatCategoryName(tool.category),
            description: tool.description,
            url: tool.url,
            keywords: (tool.tags || []).join(", ")
          },
          {
            "@type": "FAQPage",
            mainEntity: faqEntities
          }
        ]
      },
      null,
      2
    );
  }
}

function renderTool(tool, relatedTools) {
  const blueprint = getCategoryBlueprint(tool.category);
  const introductionText = getIntroductionText(tool, relatedTools);
  const overviewText = getOverviewText(tool);
  const [paragraphOne, paragraphTwo, paragraphThree] = getWhatIsText(tool);
  const categoryPageLink = getCategoryPageLink(tool.category);
  const faqs = getFaq(tool, relatedTools);
  const pros = getPros(tool);
  const cons = getCons(tool);
  const whoShouldUse = getWhoShouldUse(tool);
  const whoShouldUseText = getWhoShouldUseText(tool);
  const [evaluationOne, evaluationTwo] = getEvaluationText(tool);
  const worthItText = getWorthItText(tool, relatedTools);
  const toolScore = getToolScore(tool);
  const rating = getRating(tool, toolScore);
  const pricingExplanation = getPricingExplanation(tool);
  const ourVerdictText = getOurVerdictText(tool, relatedTools);
  const tryNowUrl = getAffiliateLink(tool, "try");
  const trialUrl = getAffiliateLink(tool, "trial");
  const visitUrl = tool.website || tool.url || tryNowUrl;
  const topCtaBlock = createToolCtaBlock(tryNowUrl, trialUrl, visitUrl);
  const middleCtaBlock = createToolCtaBlock(tryNowUrl, trialUrl, visitUrl);
  const bottomCtaBlock = createToolCtaBlock(tryNowUrl, trialUrl, visitUrl);
  const alternativesLinks = relatedTools
    .map(item => `<a class="inline-link" href="${getToolDetailUrl(item)}">${item.name}</a>`)
    .join("");

  toolContainer.innerHTML = `
    <header class="tool-header-main">
      <div class="tool-header-brand">
        <img class="tool-logo" src="${getToolLogoUrl(tool)}" alt="${tool.name} logo" onerror="this.src='https://via.placeholder.com/40'" />
        <div class="tool-header-copy">
          <h1>${tool.name}</h1>
          <div class="card-badges">
            <span class="category">${tool.category}</span>
            <span class="price-badge">${getPriceLabel(tool)}</span>
            <span class="score-badge">Score: ${toolScore}</span>
          </div>
          <div class="rating-row" aria-label="Tool rating">
            <span class="rating-stars">${rating.stars}</span>
            <span class="rating-score">${rating.score}/5</span>
          </div>
          <p class="meta-text">${rating.explanation}</p>
        </div>
      </div>
      <div>
        ${topCtaBlock}
        <div class="trust-elements trust-elements-detail">
          <span class="trust-pill">Reviewed by Alex Morgan</span>
          <span class="trust-pill">Pros and cons included</span>
          <span class="trust-pill">Alternatives compared</span>
        </div>
      </div>
    </header>

    <section class="tool-review-section">
      <h2>Overview</h2>
      ${overviewText.map(paragraph => `<p class="tool-description">${paragraph}</p>`).join("")}
      <p class="tool-description">${getHumanPerspective(tool)}</p>
    </section>

    <section class="tool-review-section">
      <h2>Introduction</h2>
      ${introductionText.map(paragraph => `<p class="tool-description">${paragraph}</p>`).join("")}
    </section>

    <section class="tool-review-section">
      <h2>What is ${tool.name}?</h2>
      <p class="tool-description">${paragraphTwo}</p>
      <p class="tool-description">${paragraphThree}</p>
      <p class="tool-description">${evaluationOne}</p>
    </section>

    <section class="tool-review-section">
      <h2>Key Features</h2>
      <ul class="detail-list">
        ${blueprint.features.slice(0, 6).map(item => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <section class="tool-review-section">
      <h2>Use Cases</h2>
      <ul class="detail-list">
        ${blueprint.useCases.slice(0, 6).map(item => `<li>${item}</li>`).join("")}
      </ul>
      <p class="tool-description">The main editorial test here is whether ${tool.name} feels useful on ordinary work, not just on showcase prompts. Tools that save time on recurring tasks are much easier to justify than tools that only shine in isolated demos.</p>
      ${middleCtaBlock}
    </section>

    <section class="tool-review-section">
      <h2>Who should use this</h2>
      <ul class="detail-list">
        ${whoShouldUse.map(item => `<li>${item}</li>`).join("")}
      </ul>
      ${whoShouldUseText.map(paragraph => `<p class="tool-description">${paragraph}</p>`).join("")}
      <p class="tool-description">For best results, define your workflow goal first, then evaluate whether ${tool.name} improves speed, quality, and consistency compared to your current process.</p>
      <p class="tool-description">${evaluationTwo}</p>
    </section>

    <section class="tool-review-section">
      <h2>Pros and Cons</h2>
      <div class="detail-grid">
        <article class="tool-panel detail-card">
        <h2 class="detail-title">Pros</h2>
        <ul class="detail-list">${pros.map(item => `<li>${item}</li>`).join("")}</ul>
        </article>
        <article class="tool-panel detail-card">
        <h2 class="detail-title">Cons</h2>
        <ul class="detail-list">${cons.map(item => `<li>${item}</li>`).join("")}</ul>
        </article>
      </div>
    </section>

    <section class="tool-review-section">
      <h2>Pricing Explanation</h2>
      <p class="tool-description">${pricingExplanation}</p>
      <p class="tool-description">Current label: <strong>${getPriceLabel(tool)}</strong>. Verify live pricing and limits on the official website before making a purchase decision.</p>
    </section>

    <section class="tool-review-section">
      <h2>Is it worth it</h2>
      ${worthItText.map(paragraph => `<p class="tool-description">${paragraph}</p>`).join("")}
    </section>

    <section class="tool-review-section">
      <h2>Alternatives to ${tool.name}</h2>
      <div class="related-links-list">
        ${alternativesLinks || `<span class="tool-description">No alternatives found in this category.</span>`}
      </div>
      <div class="related-links-list">
        <a class="inline-link" href="${categoryPageLink}">Browse ${formatCategoryName(tool.category)} tools</a>
      </div>
    </section>

    <section class="tool-review-section">
      <h2>Final verdict</h2>
      ${ourVerdictText.map(paragraph => `<p class="tool-description">${paragraph}</p>`).join("")}
    </section>

    ${createCustomReviewSections(tool)}

    <section class="tool-review-section">
      <h2>Related Tools</h2>
      <p class="tool-description">If you want to keep comparing options in the same category, these are the next tools worth opening. Internal links like these make it easier to build a shortlist without restarting your research.</p>
      <div class="related-links-list">
        ${alternativesLinks || `<span class="tool-description">No related tools found in this category.</span>`}
      </div>
    </section>

    <section class="tool-review-section">
      <h2>FAQ</h2>
      <div class="faq-list">
        ${faqs
          .map(
            item => `
          <article class="faq-item">
            <h3>${item.q}</h3>
            <p class="tool-description">${item.a}</p>
          </article>
        `
          )
          .join("")}
      </div>
    </section>
    <section class="tool-review-section">
      <h2>Get Started</h2>
      <p class="tool-description">Compare plan options and test this platform in your real workflow before committing.</p>
      ${bottomCtaBlock}
    </section>
    <div class="tool-meta">
      <strong>Tags</strong>
      <div class="tags">${createTags(tool.tags || [])}</div>
    </div>
  `;

  toolContainer.querySelectorAll(".tool-link").forEach(link => {
    link.addEventListener("click", () => bumpToolPopularity(tool.name, 1));
  });
}

function renderAlternatives(tool, relatedTools) {
  if (alternativesHeading) {
    alternativesHeading.textContent = `Alternatives to ${tool.name}`;
  }

  relatedGrid.innerHTML = "";

  if (relatedTools.length === 0) {
    relatedGrid.innerHTML = `<p class="tool-description">No alternatives found in this category.</p>`;
    return;
  }

  relatedTools.forEach(item => {
    const card = document.createElement("article");
    card.className = "related-card";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <a href="${getToolDetailUrl(item)}">Use this tool</a>
    `;
    relatedGrid.appendChild(card);
    const link = card.querySelector("a");
    if (link) {
      link.addEventListener("click", () => bumpToolPopularity(item.name, 1));
    }
  });
}

function renderNotFound() {
  toolContainer.innerHTML = `
    <div class="tool-title-row tool-review-section">
      <h1>Tool not found</h1>
      <p class="tool-description">The requested tool does not exist. Go back to the directory and choose a valid tool.</p>
      <a class="tool-link tool-link-cta" href="index.html">Back to Directory</a>
    </div>
  `;
  relatedGrid.innerHTML = "";
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

if (themeToggle) {
  themeToggle.addEventListener("click", toggleTheme);
}

applySavedTheme();

async function initializeToolPage() {
  if (typeof window.loadToolsData === "function") {
    toolsData = await window.loadToolsData();
  } else if (Array.isArray(window.tools)) {
    toolsData = window.tools;
  }

  const tool = getToolFromUrl();
  if (!tool) {
    renderNotFound();
    return;
  }

  const relatedTools = getRelatedTools(tool);
  renderTool(tool, relatedTools);
  renderAlternatives(tool, relatedTools);
  setSeoMeta(tool, relatedTools);
}

initializeToolPage();
