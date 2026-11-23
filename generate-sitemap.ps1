param(
  [string]$BaseUrl = "https://aidiscovertools.com"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$toolsDir = Join-Path $root "tools"
$output = Join-Path $root "sitemap.xml"
$today = Get-Date -Format "yyyy-MM-dd"
$base = $BaseUrl.TrimEnd('/')

function Get-Priority([string]$name) {
  if ($name -eq "index.html") { return "1.0" }
  if ($name -eq "tool.html") { return "0.4" }
  if ($name.StartsWith("ai-") -or $name.StartsWith("best-")) { return "0.9" }
  return "0.7"
}

function Get-ChangeFreq([string]$name) {
  if ($name -eq "index.html") { return "daily" }
  return "weekly"
}

$rootPages = Get-ChildItem -Path $root -Filter *.html -File |
  Where-Object { $_.Name -ne "404.html" } |
  Sort-Object Name

$toolPages = @()
if (Test-Path $toolsDir) {
  $toolPages = Get-ChildItem -Path $toolsDir -Filter *.html -File | Sort-Object Name
}

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('<?xml version="1.0" encoding="UTF-8"?>')
$lines.Add('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

foreach ($page in $rootPages) {
  $loc = "$base/$($page.Name)"
  $freq = Get-ChangeFreq $page.Name
  $priority = Get-Priority $page.Name

  $lines.Add('  <url>')
  $lines.Add("    <loc>$loc</loc>")
  $lines.Add("    <lastmod>$today</lastmod>")
  $lines.Add("    <changefreq>$freq</changefreq>")
  $lines.Add("    <priority>$priority</priority>")
  $lines.Add('  </url>')
}

foreach ($page in $toolPages) {
  $slug = ($page.BaseName -replace '\.html$','')
  $loc = "$base/tool.html?name=$slug"

  $lines.Add('  <url>')
  $lines.Add("    <loc>$loc</loc>")
  $lines.Add("    <lastmod>$today</lastmod>")
  $lines.Add("    <changefreq>weekly</changefreq>")
  $lines.Add("    <priority>0.8</priority>")
  $lines.Add('  </url>')
}

$lines.Add('</urlset>')
$lines.Add('')

Set-Content -Path $output -Value $lines -Encoding UTF8
Write-Output "Sitemap updated: $($rootPages.Count + $toolPages.Count) URLs"
Write-Output "Base URL: $base"
