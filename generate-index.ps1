param(
  [string]$BasePath = ".",
  [switch]$Check
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path -LiteralPath $BasePath).Path
$toolsPath = Join-Path $root "tools.json"
$indexPath = Join-Path $root "index.html"

if (-not (Test-Path -LiteralPath $toolsPath)) {
  throw "tools.json not found in $root"
}

if (-not (Test-Path -LiteralPath $indexPath)) {
  throw "index.html not found in $root"
}

function ConvertTo-Slug([string]$name) {
  $slug = $name.ToLowerInvariant().Trim()
  $slug = $slug -replace '&', ' and '
  $slug = $slug -replace '[^a-z0-9]+', '-'
  return ($slug -replace '^-+|-+$', '')
}

function Encode-Html([string]$value) {
  return [System.Net.WebUtility]::HtmlEncode($value)
}

function Get-LogoUrl([string]$website) {
  try {
    $uri = [System.Uri]$website
    $domain = $uri.Host -replace '^www\.', ''
    return "https://www.google.com/s2/favicons?sz=128&domain=$domain"
  }
  catch {
    return "https://via.placeholder.com/40"
  }
}

function New-ToolCard($tool, [int]$rank, [string]$newline) {
  $name = Encode-Html ([string]$tool.name)
  $description = Encode-Html ([string]$tool.description)
  $category = Encode-Html ([string]$tool.category)
  $pricing = Encode-Html ([string]$tool.pricing)
  $website = Encode-Html ([string]$tool.website)
  $slug = [System.Uri]::EscapeDataString((ConvertTo-Slug ([string]$tool.name)))
  $detailUrl = "/tool.html?name=$slug"
  $logoUrl = Encode-Html (Get-LogoUrl ([string]$tool.website))

  $lines = @(
    '        <article class="card tool-card" role="link" tabindex="0" aria-label="Open details for ' + $name + '">',
    '          <div class="card-logo-wrap">',
    '            <img class="tool-logo" src="' + $logoUrl + '" alt="' + $name + ' logo" loading="lazy" onerror="this.src=''https://via.placeholder.com/40''" />',
    '          </div>',
    '          <div class="card-head">',
    '            <div class="card-brand">',
    '              <h3>' + $name + '</h3>',
    '            </div>',
    '            <div class="card-head-badges">',
    '              <span class="rank-badge">#' + $rank + '</span>',
    '              <span class="category">' + $category + '</span>',
    '            </div>',
    '          </div>',
    '          <p>' + $description + '</p>',
    '          <div class="card-badges">',
    '            <span class="price-badge">' + $pricing + '</span>',
    '          </div>',
    '          <div class="trust-elements">',
    '            <span class="trust-pill">Free plan available</span>',
    '            <span class="trust-pill">Trusted by millions</span>',
    '            <span class="trust-pill">Best for beginners</span>',
    '          </div>',
    '          <div class="tags">',
    '            <span class="tag">' + $category + '</span>',
    '            <span class="tag">ai</span>',
    '            <span class="tag">tool</span>',
    '          </div>',
    '          <div class="card-actions">',
    '            <a class="cta-primary" href="' + $website + '" target="_blank" rel="noopener noreferrer sponsored nofollow">Try now</a>',
    '            <a class="cta-secondary" href="' + $website + '" target="_blank" rel="noopener noreferrer sponsored nofollow">Start free trial</a>',
    '            <a class="btn-secondary cta-tertiary" href="' + $detailUrl + '">Use this tool</a>',
    '          </div>',
    '        </article>'
  )

  return ($lines -join $newline)
}

$parsedTools = Get-Content -LiteralPath $toolsPath -Raw | ConvertFrom-Json
$tools = if ($parsedTools -is [System.Array]) { $parsedTools } else { @($parsedTools) }
$categories = @($tools | ForEach-Object { $_.category } | Sort-Object -Unique)
$lastUpdated = (Get-Item -LiteralPath $toolsPath).LastWriteTime.ToString(
  "MMM d, yyyy",
  [System.Globalization.CultureInfo]::GetCultureInfo("en-US")
)

$html = [System.IO.File]::ReadAllText($indexPath)
$newline = if ($html.Contains("`r`n")) { "`r`n" } else { "`n" }
if ($html -notmatch '(?s)        <!-- GENERATED TOOLS START -->.*?        <!-- GENERATED TOOLS END -->') {
  throw "Generated tools markers were not found in index.html"
}

$cards = for ($index = 0; $index -lt $tools.Count; $index++) {
  New-ToolCard $tools[$index] ($index + 1) $newline
}

$generatedBlock = @(
  '        <!-- GENERATED TOOLS START -->',
  ($cards -join $newline),
  '        <!-- GENERATED TOOLS END -->'
) -join $newline

$updated = [System.Text.RegularExpressions.Regex]::Replace(
  $html,
  '(?s)        <!-- GENERATED TOOLS START -->.*?        <!-- GENERATED TOOLS END -->',
  [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $generatedBlock }
)
$updated = [System.Text.RegularExpressions.Regex]::Replace(
  $updated,
  '(<h2 id="totalToolsStat">).*?(</h2>)',
  "`${1}$($tools.Count)`${2}"
)
$updated = [System.Text.RegularExpressions.Regex]::Replace(
  $updated,
  '(<h2 id="totalCategoriesStat">).*?(</h2>)',
  "`${1}$($categories.Count)`${2}"
)
$updated = [System.Text.RegularExpressions.Regex]::Replace(
  $updated,
  '(<h2 id="lastUpdatedStat">).*?(</h2>)',
  "`${1}$lastUpdated`${2}"
)

if ($Check) {
  if ($updated -ne $html) {
    throw "index.html is not synchronized with tools.json"
  }
  Write-Output "Check passed: $($tools.Count) tools, $($categories.Count) categories, updated $lastUpdated"
  exit 0
}

$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($indexPath, $updated, $utf8WithoutBom)

Write-Output "index.html updated: $($tools.Count) tools"
Write-Output "Categories: $($categories.Count)"
Write-Output "Last tools.json update: $lastUpdated"
