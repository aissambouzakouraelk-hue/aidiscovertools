param(
  [string]$BasePath = "."
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path $BasePath
$toolsJs = Join-Path $root "tools.js"
$toolsJson = Join-Path $root "tools.json"
$toolsDir = Join-Path $root "tools"

if (-not (Test-Path $toolsJs) -and -not (Test-Path $toolsJson)) {
  throw "tools.js/tools.json not found in $root"
}

function Slug([string]$name) {
  $s = $name.ToLower().Trim()
  $s = $s -replace '&', ' and '
  $s = $s -replace '[^a-z0-9]+', '-'
  $s = $s -replace '^-+|-+$', ''
  return $s
}

function ToTitleCase([string]$text) {
  if ([string]::IsNullOrWhiteSpace($text)) { return $text }
  $parts = $text -split '[-\s]+'
  return ($parts | ForEach-Object { if ($_.Length -gt 0) { $_.Substring(0,1).ToUpper() + $_.Substring(1) } else { $_ } }) -join ' '
}

function GetCategoryFeatures([string]$category) {
  switch ($category) {
    "writing" { return @("Draft long-form and short-form content", "Refine tone, grammar, and clarity", "Summarize documents and notes") }
    "image" { return @("Generate visual concepts from prompts", "Create branded assets and social graphics", "Edit and enhance images quickly") }
    "video" { return @("Create videos from text prompts", "Edit clips and add captions faster", "Produce explainers and social content") }
    "coding" { return @("Generate code and boilerplate", "Refactor and debug with AI assistance", "Improve developer workflow speed") }
    "marketing" { return @("Plan and optimize campaigns", "Generate ad and social content", "Improve SEO and conversion workflows") }
    "productivity" { return @("Summarize meetings and documents", "Organize tasks and planning", "Automate repetitive daily workflows") }
    default { return @("Accelerate common AI workflows", "Improve output quality and speed", "Support team collaboration") }
  }
}

function GetUseCases([string]$category) {
  switch ($category) {
    "writing" { return @("Blog and article drafting", "Email and copywriting", "Editing and rewriting") }
    "image" { return @("Social media visuals", "Concept art and moodboards", "Brand asset generation") }
    "video" { return @("Short-form video production", "Training and explainer videos", "Content repurposing") }
    "coding" { return @("Rapid prototyping", "Code review assistance", "Test and documentation support") }
    "marketing" { return @("Campaign ideation", "SEO content planning", "Ad creative generation") }
    "productivity" { return @("Meeting summaries", "Task and project planning", "Knowledge management") }
    default { return @("Research and analysis", "Content generation", "Workflow automation") }
  }
}

function GetCategoryPage([string]$category) {
  switch ($category) {
    "writing" { return "/ai-writing-tools.html" }
    "image" { return "/ai-image-generators.html" }
    "video" { return "/ai-video-tools.html" }
    "coding" { return "/best-ai-tools-for-developers.html" }
    "marketing" { return "/best-ai-tools-for-marketing.html" }
    "productivity" { return "/ai-productivity-tools.html" }
    default { return "/best-ai-tools.html" }
  }
}

function GetAlternativesPage([string]$slug) {
  switch ($slug) {
    "chatgpt" { return "/chatgpt-alternatives.html" }
    "midjourney" { return "/midjourney-alternatives.html" }
    "runway" { return "/runway-alternatives.html" }
    default { return "/best-ai-tools.html" }
  }
}

function GetPros([string]$category, [bool]$api, [bool]$openSource, [string]$pricingModel) {
  $pros = @(
    "Strong fit for $category workflows",
    "Can reduce manual, repetitive work",
    "Supports faster delivery cycles"
  )
  if ($api) { $pros += "API support enables workflow integrations" }
  if ($openSource) { $pros += "Open ecosystem can offer flexibility and transparency" }
  if ($pricingModel -eq "Free" -or $pricingModel -eq "Freemium") { $pros += "Accessible pricing for early testing" }
  return $pros | Select-Object -First 5
}

function GetCons([bool]$loginRequired, [bool]$openSource, [string]$pricingModel) {
  $cons = @(
    "Output quality still depends on clear prompts",
    "AI-generated content should be reviewed before publishing"
  )
  if ($loginRequired) { $cons += "Requires account setup for full use" }
  if ($pricingModel -eq "Paid") { $cons += "Advanced functionality may require paid plans" }
  if (-not $openSource) { $cons += "Less transparency than open-source alternatives" }
  return $cons | Select-Object -First 5
}

function GetIntroParagraphs($tool) {
  $categoryTitle = ToTitleCase $tool.category
  $tagOne = if ($tool.tags.Count -gt 0) { ToTitleCase $tool.tags[0] } else { "Workflow" }
  $tagTwo = if ($tool.tags.Count -gt 1) { ToTitleCase $tool.tags[1] } else { "Automation" }
  $pricing = $tool.pricingModel
  $apiText = if ($tool.api) { "includes API access for integrations" } else { "focuses on direct product usage without API-first setup" }

  $p1 = "$($tool.name) is an AI $categoryTitle platform built for users who need practical results rather than generic automation promises. It helps teams and independent users move faster across everyday work, especially in $tagOne and $tagTwo tasks. In real workflows, tools like $($tool.name) are most valuable when they reduce execution time while keeping quality standards stable. This page reviews the platform from a practical perspective so you can decide whether it fits your current process, team structure, and production goals."
  $p2 = "A common reason people evaluate $($tool.name) is workflow pressure: faster deadlines, higher output requirements, and the need to ship better work consistently. Instead of replacing strategy or decision-making, $($tool.name) usually works best as an execution layer that handles repetitive parts of the process. That can include drafting, refinement, organization, or production acceleration depending on category. For decision-making, human review remains essential, but for repetitive steps the tool can provide measurable efficiency improvements."
  $p3 = "From a buying perspective, $($tool.name) currently uses a $pricing pricing model and $apiText. For most users, the right evaluation method is to test the product on recurring weekly tasks and compare the time and quality against your current stack. If the tool reduces manual work without creating new quality risks, it can be a strong addition. The sections below cover features, pros and cons, practical use cases, alternatives, and a final editorial opinion."

  return @($p1, $p2, $p3)
}

function GetFinalOpinion($tool) {
  $categoryTitle = ToTitleCase $tool.category
  $fitText = if ($tool.api) { "Teams with integration needs may get extra value from its API capabilities." } else { "It is especially suitable for teams that prefer a straightforward, interface-first workflow." }
  return "Final opinion: $($tool.name) is a solid option in the AI $categoryTitle space for users who prioritize reliable output and faster execution over experimentation alone. It is not a universal replacement for human judgment, but it can be highly effective as part of a structured workflow. $fitText If you compare it against alternatives in the same category and validate it on real tasks, you can make a confident adoption decision."
}

function GetEditorialAssessment($tool) {
  $categoryTitle = ToTitleCase $tool.category
  return "Editorial assessment: if your team is currently evaluating AI $categoryTitle tools, treat $($tool.name) as one candidate in a broader shortlist instead of a one-click replacement. Run a controlled trial using the same tasks, prompts, and quality criteria across alternatives so you can compare outcomes fairly. Measure time saved, editing overhead, collaboration fit, and consistency of final output. This process usually reveals whether the tool provides lasting workflow value or only short-term novelty."
}

function GetPricing([string[]]$tags) {
  $tagSet = @{}
  foreach ($t in $tags) { $tagSet[$t.ToLower()] = $true }

  if ($tagSet.ContainsKey("enterprise") -or $tagSet.ContainsKey("crm")) {
    return "Pricing typically includes team and enterprise tiers. Check the official site for custom plans and current rates."
  }

  if ($tagSet.ContainsKey("open-source")) {
    return "Often available with free/open options, with possible paid hosted features depending on provider."
  }

  return "Most tools in this category offer a free or trial tier plus paid plans. Review the official pricing page for current details."
}

$tools = @()
if (Test-Path $toolsJson) {
  $jsonData = Get-Content $toolsJson -Raw | ConvertFrom-Json
  foreach ($item in $jsonData) {
    $safeCategory = if ($item.category) { $item.category } else { "productivity" }
    $derivedTags = @($safeCategory, "ai", "tool")
    $tools += [PSCustomObject]@{
      name = $item.name
      description = $item.description
      category = $safeCategory
      url = $item.website
      pricingModel = if ($item.pricing) { $item.pricing } else { "Paid" }
      api = $false
      openSource = $false
      loginRequired = $true
      tags = $derivedTags
      slug = Slug $item.name
    }
  }
} else {
  $raw = Get-Content $toolsJs -Raw
  $pattern = '\{\s*name:\s*"(?<name>[^"]+)",\s*category:\s*"(?<category>[^"]+)",\s*price:\s*\{\s*model:\s*"(?<model>[^"]+)",\s*monthly:\s*(?<monthly>\d+)\s*\},\s*description:\s*"(?<description>[^"]+)",\s*url:\s*"(?<url>[^"]+)",.*?tags:\s*\[(?<tags>[^\]]*)\]\s*\}'
  $matches = [regex]::Matches($raw, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($matches.Count -eq 0) {
    throw "No tools parsed from tools.js"
  }

  foreach ($m in $matches) {
    $tagsRaw = $m.Groups['tags'].Value
    $tagMatches = [regex]::Matches($tagsRaw, '"([^"]+)"')
    $tags = @()
    foreach ($t in $tagMatches) { $tags += $t.Groups[1].Value }

    $tools += [PSCustomObject]@{
      name = $m.Groups['name'].Value
      description = $m.Groups['description'].Value
      category = $m.Groups['category'].Value
      url = $m.Groups['url'].Value
      pricingModel = $m.Groups['model'].Value
      api = $false
      openSource = $false
      loginRequired = $true
      tags = $tags
      slug = Slug $m.Groups['name'].Value
    }
  }
}

if ($tools.Count -eq 0) {
  throw "No tools loaded from tools.json/tools.js"
}

New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null

foreach ($tool in $tools) {
  $related = $tools |
    Where-Object { $_.category -eq $tool.category -and $_.name -ne $tool.name } |
    Sort-Object name |
    Select-Object -First 4

  $tagsHtml = ($tool.tags | ForEach-Object { "<span class='tag'>$($_)</span>" }) -join ""

  $categoryFeatures = GetCategoryFeatures $tool.category
  $featureTagBullets = ($tool.tags | Select-Object -First 3 | ForEach-Object { "$((ToTitleCase $_)) support" })
  $allFeatures = @($categoryFeatures + $featureTagBullets)
  $featuresHtml = ($allFeatures | Select-Object -Unique | Select-Object -First 6 | ForEach-Object { "<li>$_</li>" }) -join "`n"

  $useCasesHtml = ((GetUseCases $tool.category) | ForEach-Object { "<li>$_</li>" }) -join "`n"
  $pricingText = GetPricing $tool.tags
  $prosHtml = ((GetPros $tool.category $tool.api $tool.openSource $tool.pricingModel) | ForEach-Object { "<li>$_</li>" }) -join "`n"
  $consHtml = ((GetCons $tool.loginRequired $tool.openSource $tool.pricingModel) | ForEach-Object { "<li>$_</li>" }) -join "`n"
  $categoryPage = GetCategoryPage $tool.category
  $altPage = GetAlternativesPage $tool.slug
  $introParagraphs = GetIntroParagraphs $tool
  $finalOpinion = GetFinalOpinion $tool
  $assessment = GetEditorialAssessment $tool

  $relatedLinks = ($related | ForEach-Object {
    "<li><a href='/tool.html?name=$(param(
  [string]$BasePath = "."
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path $BasePath
$toolsJs = Join-Path $root "tools.js"
$toolsJson = Join-Path $root "tools.json"
$toolsDir = Join-Path $root "tools"

if (-not (Test-Path $toolsJs) -and -not (Test-Path $toolsJson)) {
  throw "tools.js/tools.json not found in $root"
}

function Slug([string]$name) {
  $s = $name.ToLower().Trim()
  $s = $s -replace '&', ' and '
  $s = $s -replace '[^a-z0-9]+', '-'
  $s = $s -replace '^-+|-+$', ''
  return $s
}

function ToTitleCase([string]$text) {
  if ([string]::IsNullOrWhiteSpace($text)) { return $text }
  $parts = $text -split '[-\s]+'
  return ($parts | ForEach-Object { if ($_.Length -gt 0) { $_.Substring(0,1).ToUpper() + $_.Substring(1) } else { $_ } }) -join ' '
}

function GetCategoryFeatures([string]$category) {
  switch ($category) {
    "writing" { return @("Draft long-form and short-form content", "Refine tone, grammar, and clarity", "Summarize documents and notes") }
    "image" { return @("Generate visual concepts from prompts", "Create branded assets and social graphics", "Edit and enhance images quickly") }
    "video" { return @("Create videos from text prompts", "Edit clips and add captions faster", "Produce explainers and social content") }
    "coding" { return @("Generate code and boilerplate", "Refactor and debug with AI assistance", "Improve developer workflow speed") }
    "marketing" { return @("Plan and optimize campaigns", "Generate ad and social content", "Improve SEO and conversion workflows") }
    "productivity" { return @("Summarize meetings and documents", "Organize tasks and planning", "Automate repetitive daily workflows") }
    default { return @("Accelerate common AI workflows", "Improve output quality and speed", "Support team collaboration") }
  }
}

function GetUseCases([string]$category) {
  switch ($category) {
    "writing" { return @("Blog and article drafting", "Email and copywriting", "Editing and rewriting") }
    "image" { return @("Social media visuals", "Concept art and moodboards", "Brand asset generation") }
    "video" { return @("Short-form video production", "Training and explainer videos", "Content repurposing") }
    "coding" { return @("Rapid prototyping", "Code review assistance", "Test and documentation support") }
    "marketing" { return @("Campaign ideation", "SEO content planning", "Ad creative generation") }
    "productivity" { return @("Meeting summaries", "Task and project planning", "Knowledge management") }
    default { return @("Research and analysis", "Content generation", "Workflow automation") }
  }
}

function GetCategoryPage([string]$category) {
  switch ($category) {
    "writing" { return "/ai-writing-tools.html" }
    "image" { return "/ai-image-generators.html" }
    "video" { return "/ai-video-tools.html" }
    "coding" { return "/best-ai-tools-for-developers.html" }
    "marketing" { return "/best-ai-tools-for-marketing.html" }
    "productivity" { return "/ai-productivity-tools.html" }
    default { return "/best-ai-tools.html" }
  }
}

function GetAlternativesPage([string]$slug) {
  switch ($slug) {
    "chatgpt" { return "/chatgpt-alternatives.html" }
    "midjourney" { return "/midjourney-alternatives.html" }
    "runway" { return "/runway-alternatives.html" }
    default { return "/best-ai-tools.html" }
  }
}

function GetPros([string]$category, [bool]$api, [bool]$openSource, [string]$pricingModel) {
  $pros = @(
    "Strong fit for $category workflows",
    "Can reduce manual, repetitive work",
    "Supports faster delivery cycles"
  )
  if ($api) { $pros += "API support enables workflow integrations" }
  if ($openSource) { $pros += "Open ecosystem can offer flexibility and transparency" }
  if ($pricingModel -eq "Free" -or $pricingModel -eq "Freemium") { $pros += "Accessible pricing for early testing" }
  return $pros | Select-Object -First 5
}

function GetCons([bool]$loginRequired, [bool]$openSource, [string]$pricingModel) {
  $cons = @(
    "Output quality still depends on clear prompts",
    "AI-generated content should be reviewed before publishing"
  )
  if ($loginRequired) { $cons += "Requires account setup for full use" }
  if ($pricingModel -eq "Paid") { $cons += "Advanced functionality may require paid plans" }
  if (-not $openSource) { $cons += "Less transparency than open-source alternatives" }
  return $cons | Select-Object -First 5
}

function GetIntroParagraphs($tool) {
  $categoryTitle = ToTitleCase $tool.category
  $tagOne = if ($tool.tags.Count -gt 0) { ToTitleCase $tool.tags[0] } else { "Workflow" }
  $tagTwo = if ($tool.tags.Count -gt 1) { ToTitleCase $tool.tags[1] } else { "Automation" }
  $pricing = $tool.pricingModel
  $apiText = if ($tool.api) { "includes API access for integrations" } else { "focuses on direct product usage without API-first setup" }

  $p1 = "$($tool.name) is an AI $categoryTitle platform built for users who need practical results rather than generic automation promises. It helps teams and independent users move faster across everyday work, especially in $tagOne and $tagTwo tasks. In real workflows, tools like $($tool.name) are most valuable when they reduce execution time while keeping quality standards stable. This page reviews the platform from a practical perspective so you can decide whether it fits your current process, team structure, and production goals."
  $p2 = "A common reason people evaluate $($tool.name) is workflow pressure: faster deadlines, higher output requirements, and the need to ship better work consistently. Instead of replacing strategy or decision-making, $($tool.name) usually works best as an execution layer that handles repetitive parts of the process. That can include drafting, refinement, organization, or production acceleration depending on category. For decision-making, human review remains essential, but for repetitive steps the tool can provide measurable efficiency improvements."
  $p3 = "From a buying perspective, $($tool.name) currently uses a $pricing pricing model and $apiText. For most users, the right evaluation method is to test the product on recurring weekly tasks and compare the time and quality against your current stack. If the tool reduces manual work without creating new quality risks, it can be a strong addition. The sections below cover features, pros and cons, practical use cases, alternatives, and a final editorial opinion."

  return @($p1, $p2, $p3)
}

function GetFinalOpinion($tool) {
  $categoryTitle = ToTitleCase $tool.category
  $fitText = if ($tool.api) { "Teams with integration needs may get extra value from its API capabilities." } else { "It is especially suitable for teams that prefer a straightforward, interface-first workflow." }
  return "Final opinion: $($tool.name) is a solid option in the AI $categoryTitle space for users who prioritize reliable output and faster execution over experimentation alone. It is not a universal replacement for human judgment, but it can be highly effective as part of a structured workflow. $fitText If you compare it against alternatives in the same category and validate it on real tasks, you can make a confident adoption decision."
}

function GetEditorialAssessment($tool) {
  $categoryTitle = ToTitleCase $tool.category
  return "Editorial assessment: if your team is currently evaluating AI $categoryTitle tools, treat $($tool.name) as one candidate in a broader shortlist instead of a one-click replacement. Run a controlled trial using the same tasks, prompts, and quality criteria across alternatives so you can compare outcomes fairly. Measure time saved, editing overhead, collaboration fit, and consistency of final output. This process usually reveals whether the tool provides lasting workflow value or only short-term novelty."
}

function GetPricing([string[]]$tags) {
  $tagSet = @{}
  foreach ($t in $tags) { $tagSet[$t.ToLower()] = $true }

  if ($tagSet.ContainsKey("enterprise") -or $tagSet.ContainsKey("crm")) {
    return "Pricing typically includes team and enterprise tiers. Check the official site for custom plans and current rates."
  }

  if ($tagSet.ContainsKey("open-source")) {
    return "Often available with free/open options, with possible paid hosted features depending on provider."
  }

  return "Most tools in this category offer a free or trial tier plus paid plans. Review the official pricing page for current details."
}

$tools = @()
if (Test-Path $toolsJson) {
  $jsonData = Get-Content $toolsJson -Raw | ConvertFrom-Json
  foreach ($item in $jsonData) {
    $safeCategory = if ($item.category) { $item.category } else { "productivity" }
    $derivedTags = @($safeCategory, "ai", "tool")
    $tools += [PSCustomObject]@{
      name = $item.name
      description = $item.description
      category = $safeCategory
      url = $item.website
      pricingModel = if ($item.pricing) { $item.pricing } else { "Paid" }
      api = $false
      openSource = $false
      loginRequired = $true
      tags = $derivedTags
      slug = Slug $item.name
    }
  }
} else {
  $raw = Get-Content $toolsJs -Raw
  $pattern = '\{\s*name:\s*"(?<name>[^"]+)",\s*category:\s*"(?<category>[^"]+)",\s*price:\s*\{\s*model:\s*"(?<model>[^"]+)",\s*monthly:\s*(?<monthly>\d+)\s*\},\s*description:\s*"(?<description>[^"]+)",\s*url:\s*"(?<url>[^"]+)",.*?tags:\s*\[(?<tags>[^\]]*)\]\s*\}'
  $matches = [regex]::Matches($raw, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($matches.Count -eq 0) {
    throw "No tools parsed from tools.js"
  }

  foreach ($m in $matches) {
    $tagsRaw = $m.Groups['tags'].Value
    $tagMatches = [regex]::Matches($tagsRaw, '"([^"]+)"')
    $tags = @()
    foreach ($t in $tagMatches) { $tags += $t.Groups[1].Value }

    $tools += [PSCustomObject]@{
      name = $m.Groups['name'].Value
      description = $m.Groups['description'].Value
      category = $m.Groups['category'].Value
      url = $m.Groups['url'].Value
      pricingModel = $m.Groups['model'].Value
      api = $false
      openSource = $false
      loginRequired = $true
      tags = $tags
      slug = Slug $m.Groups['name'].Value
    }
  }
}

if ($tools.Count -eq 0) {
  throw "No tools loaded from tools.json/tools.js"
}

New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null

foreach ($tool in $tools) {
  $related = $tools |
    Where-Object { $_.category -eq $tool.category -and $_.name -ne $tool.name } |
    Sort-Object name |
    Select-Object -First 4

  $tagsHtml = ($tool.tags | ForEach-Object { "<span class='tag'>$($_)</span>" }) -join ""

  $categoryFeatures = GetCategoryFeatures $tool.category
  $featureTagBullets = ($tool.tags | Select-Object -First 3 | ForEach-Object { "$((ToTitleCase $_)) support" })
  $allFeatures = @($categoryFeatures + $featureTagBullets)
  $featuresHtml = ($allFeatures | Select-Object -Unique | Select-Object -First 6 | ForEach-Object { "<li>$_</li>" }) -join "`n"

  $useCasesHtml = ((GetUseCases $tool.category) | ForEach-Object { "<li>$_</li>" }) -join "`n"
  $pricingText = GetPricing $tool.tags
  $prosHtml = ((GetPros $tool.category $tool.api $tool.openSource $tool.pricingModel) | ForEach-Object { "<li>$_</li>" }) -join "`n"
  $consHtml = ((GetCons $tool.loginRequired $tool.openSource $tool.pricingModel) | ForEach-Object { "<li>$_</li>" }) -join "`n"
  $categoryPage = GetCategoryPage $tool.category
  $altPage = GetAlternativesPage $tool.slug
  $introParagraphs = GetIntroParagraphs $tool
  $finalOpinion = GetFinalOpinion $tool
  $assessment = GetEditorialAssessment $tool

  $relatedLinks = ($related | ForEach-Object {
    "<li><a href='/tool.html?name=$($_.slug)'>$($_.name)</a></li>"
  }) -join "`n"

  $pageTitle = "$($tool.name) AI Tool | AI Finder"
  $metaDesc = "$($tool.description) Learn key features, pricing, use cases, alternatives, and visit the official website."
  $canonical = "https://aidiscovertools.com/tool.html?name=$($tool.slug)"

  $jsonLd = @{
    '@context' = 'https://schema.org'
    '@type' = 'SoftwareApplication'
    name = $tool.name
    applicationCategory = $tool.category
    description = $tool.description
    url = $tool.url
    keywords = ($tool.tags -join ', ')
  } | ConvertTo-Json -Depth 4

  $html = @"
<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
  <title>$pageTitle</title>
  <meta name='description' content='$metaDesc' />
  <meta name='robots' content='index,follow' />
  <link rel='canonical' href='$canonical' />
  <meta property='og:title' content='$pageTitle' />
  <meta property='og:description' content='$metaDesc' />
  <meta property='og:type' content='article' />
  <meta property='og:url' content='$canonical' />
  <meta property='og:site_name' content='AI Finder' />
  <meta name='twitter:card' content='summary' />
  <meta name='twitter:title' content='$pageTitle' />
  <meta name='twitter:description' content='$metaDesc' />
  <script type='application/ld+json'>$jsonLd</script>
  <link rel='stylesheet' href='../styles.css' />
</head>
<body>
  <header class='hero'>
    <div class='container hero-wrap'>
      <div>
        <h1 class='title'>AI Finder</h1>
        <p class='subtitle'>Detailed AI tool profiles with practical buying context.</p>
      </div>
      <a class='btn-secondary' href='../index.html'>Back to Directory</a>
    </div>
  </header>

  <main class='container tool-page-main'>
    <section class='tool-detail-shell'>
      <article class='tool-panel tool-overview'>
        <div class='tool-title-row'>
          <h1>$($tool.name)</h1>
          <span class='category'>$($tool.category)</span>
        </div>
        <p class='tool-description'>$($tool.description)</p>
        <div class='tool-meta'>
          <div>
            <strong>Category</strong>
            <p class='meta-text'>$($tool.category)</p>
          </div>
          <div>
            <strong>Tags</strong>
            <div class='tags'>$tagsHtml</div>
          </div>
        </div>
        <a class='tool-link' href='$($tool.url)' target='_blank' rel='noopener noreferrer'>Visit Tool</a>
      </article>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Introduction</h2>
        <p class='tool-description'>$($introParagraphs[0])</p>
        <p class='tool-description'>$($introParagraphs[1])</p>
        <p class='tool-description'>$($introParagraphs[2])</p>
      </section>

      <section class='detail-grid'>
        <article class='tool-panel detail-card'>
          <h2 class='detail-title'>Features</h2>
          <ul class='detail-list'>
            $featuresHtml
          </ul>
        </article>

        <article class='tool-panel detail-card'>
          <h2 class='detail-title'>Use Cases</h2>
          <ul class='detail-list'>
            $useCasesHtml
          </ul>
        </article>

        <article class='tool-panel detail-card'>
          <h2 class='detail-title'>Pros</h2>
          <ul class='detail-list'>$prosHtml</ul>
        </article>

        <article class='tool-panel detail-card'>
          <h2 class='detail-title'>Cons</h2>
          <ul class='detail-list'>$consHtml</ul>
        </article>
      </section>

      <section class='related-section'>
        <h2 class='related-title'>Alternatives</h2>
        <ul class='related-links-list'>
          $relatedLinks
        </ul>
      </section>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Pricing Notes</h2>
        <p class='tool-description'>$pricingText</p>
      </section>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Final Opinion</h2>
        <p class='tool-description'>$finalOpinion</p>
      </section>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Editorial Assessment</h2>
        <p class='tool-description'>$assessment</p>
      </section>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Internal Links</h2>
        <div class='related-links-list'>
          <a href='$categoryPage'>Browse $((ToTitleCase $tool.category)) Tools</a>
          <a href='$altPage'>View Alternative Guide</a>
          <a href='/best-ai-tools.html'>Best AI Tools</a>
        </div>
      </section>

      <section class='tool-cta'>
        <a class='tool-link' href='$($tool.url)' target='_blank' rel='noopener noreferrer'>Visit Tool</a>
      </section>
    </section>
  </main>
</body>
</html>
"@

  $path = Join-Path $toolsDir "$($tool.slug).html"
  Set-Content -Path $path -Value $html -Encoding UTF8
}

Write-Output "Generated $($tools.Count) detailed tool pages with new sections."
.slug)'>$($_.name)</a></li>"
  }) -join "`n"

  $pageTitle = "$($tool.name) AI Tool | AI Finder"
  $metaDesc = "$($tool.description) Learn key features, pricing, use cases, alternatives, and visit the official website."
  $canonical = "https://aidiscovertools.com/tool.html?name=$($tool.slug)"

  $jsonLd = @{
    '@context' = 'https://schema.org'
    '@type' = 'SoftwareApplication'
    name = $tool.name
    applicationCategory = $tool.category
    description = $tool.description
    url = $tool.url
    keywords = ($tool.tags -join ', ')
  } | ConvertTo-Json -Depth 4

  $html = @"
<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
  <title>$pageTitle</title>
  <meta name='description' content='$metaDesc' />
  <meta name='robots' content='index,follow' />
  <link rel='canonical' href='$canonical' />
  <meta property='og:title' content='$pageTitle' />
  <meta property='og:description' content='$metaDesc' />
  <meta property='og:type' content='article' />
  <meta property='og:url' content='$canonical' />
  <meta property='og:site_name' content='AI Finder' />
  <meta name='twitter:card' content='summary' />
  <meta name='twitter:title' content='$pageTitle' />
  <meta name='twitter:description' content='$metaDesc' />
  <script type='application/ld+json'>$jsonLd</script>
  <link rel='stylesheet' href='../styles.css' />
</head>
<body>
  <header class='hero'>
    <div class='container hero-wrap'>
      <div>
        <h1 class='title'>AI Finder</h1>
        <p class='subtitle'>Detailed AI tool profiles with practical buying context.</p>
      </div>
      <a class='btn-secondary' href='../index.html'>Back to Directory</a>
    </div>
  </header>

  <main class='container tool-page-main'>
    <section class='tool-detail-shell'>
      <article class='tool-panel tool-overview'>
        <div class='tool-title-row'>
          <h1>$($tool.name)</h1>
          <span class='category'>$($tool.category)</span>
        </div>
        <p class='tool-description'>$($tool.description)</p>
        <div class='tool-meta'>
          <div>
            <strong>Category</strong>
            <p class='meta-text'>$($tool.category)</p>
          </div>
          <div>
            <strong>Tags</strong>
            <div class='tags'>$tagsHtml</div>
          </div>
        </div>
        <a class='tool-link' href='$($tool.url)' target='_blank' rel='noopener noreferrer'>Visit Tool</a>
      </article>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Introduction</h2>
        <p class='tool-description'>$($introParagraphs[0])</p>
        <p class='tool-description'>$($introParagraphs[1])</p>
        <p class='tool-description'>$($introParagraphs[2])</p>
      </section>

      <section class='detail-grid'>
        <article class='tool-panel detail-card'>
          <h2 class='detail-title'>Features</h2>
          <ul class='detail-list'>
            $featuresHtml
          </ul>
        </article>

        <article class='tool-panel detail-card'>
          <h2 class='detail-title'>Use Cases</h2>
          <ul class='detail-list'>
            $useCasesHtml
          </ul>
        </article>

        <article class='tool-panel detail-card'>
          <h2 class='detail-title'>Pros</h2>
          <ul class='detail-list'>$prosHtml</ul>
        </article>

        <article class='tool-panel detail-card'>
          <h2 class='detail-title'>Cons</h2>
          <ul class='detail-list'>$consHtml</ul>
        </article>
      </section>

      <section class='related-section'>
        <h2 class='related-title'>Alternatives</h2>
        <ul class='related-links-list'>
          $relatedLinks
        </ul>
      </section>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Pricing Notes</h2>
        <p class='tool-description'>$pricingText</p>
      </section>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Final Opinion</h2>
        <p class='tool-description'>$finalOpinion</p>
      </section>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Editorial Assessment</h2>
        <p class='tool-description'>$assessment</p>
      </section>

      <section class='tool-review-section'>
        <h2 class='detail-title'>Internal Links</h2>
        <div class='related-links-list'>
          <a href='$categoryPage'>Browse $((ToTitleCase $tool.category)) Tools</a>
          <a href='$altPage'>View Alternative Guide</a>
          <a href='/best-ai-tools.html'>Best AI Tools</a>
        </div>
      </section>

      <section class='tool-cta'>
        <a class='tool-link' href='$($tool.url)' target='_blank' rel='noopener noreferrer'>Visit Tool</a>
      </section>
    </section>
  </main>
</body>
</html>
"@

  $path = Join-Path $toolsDir "$($tool.slug).html"
  Set-Content -Path $path -Value $html -Encoding UTF8
}

Write-Output "Generated $($tools.Count) detailed tool pages with new sections."

