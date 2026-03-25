param(
    [Parameter(Mandatory=$true)]
    [string]$Title
)

# Convert title to slug
$slug = $Title.ToLower().Replace(" ", "-")

# Date
$date = Get-Date -Format "yyyy-MM-dd"

# Path
$postsDir = "posts"
$fileName = "$date-$slug.md"
$filePath = Join-Path $postsDir $fileName

# Ensure posts directory exists
if (!(Test-Path $postsDir)) {
    New-Item -ItemType Directory -Path $postsDir
}

# Create post template
@"
---
title: "$Title"
date: "$date"
tags: ["platform-engineering"]
draft: true
---

# $Title

Write your post here.
"@ | Set-Content $filePath

Write-Host "Post created: $filePath"