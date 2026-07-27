# Th1ry.github.io one-click deploy script
# Usage: right-click this file -> Run with PowerShell
# Requires: Git (script will check and install GitHub CLI if missing)

param(
    [string]$RepoName = "Th1ry.github.io",
    [string]$Owner = "Th1ry",
    [string]$Domain = "th1ry.uk"
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[>] $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "[ERR] $Message" -ForegroundColor Red
}

# 1. Check Git
Write-Step "Checking Git installation..."
try {
    $gitVersion = git --version 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $gitVersion) { throw }
    Write-Ok "Git found: $gitVersion"
} catch {
    Write-Err "Git is not installed. Please install it from https://git-scm.com/download/win"
    Write-Host "Then run this script again."
    exit 1
}

# 2. Check GitHub CLI
Write-Step "Checking GitHub CLI installation..."
$ghPath = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghPath) {
    Write-Warn "GitHub CLI (gh) is not installed. Trying to install via winget..."
    try {
        winget install --id GitHub.cli --source winget --accept-package-agreements --accept-source-agreements
        # Reload PATH for current session
        $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User')
        $ghPath = Get-Command gh -ErrorAction SilentlyContinue
        if (-not $ghPath) { throw }
        Write-Ok "GitHub CLI installed successfully"
    } catch {
        Write-Err "Failed to install GitHub CLI automatically. Please install it from https://cli.github.com/"
        exit 1
    }
} else {
    Write-Ok "GitHub CLI is already installed"
}

# 3. Check GitHub authentication
Write-Step "Checking GitHub login status..."
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Not logged in to GitHub. Starting login..."
    gh auth login --web
    if ($LASTEXITCODE -ne 0) {
        Write-Err "GitHub login failed"
        exit 1
    }
} else {
    Write-Ok "Already logged in to GitHub"
}

# 4. Initialize local Git repository
Write-Step "Initializing local Git repository..."
if (-not (Test-Path .git)) {
    git init
}

# Configure git identity for this repo if not already set
$gitName = git config user.name 2>$null
$gitEmail = git config user.email 2>$null
if (-not $gitName) {
    git config user.name "$Owner"
    Write-Ok "Set local git user.name to $Owner"
}
if (-not $gitEmail) {
    $defaultEmail = "$Owner@users.noreply.github.com"
    git config user.email "$defaultEmail"
    Write-Ok "Set local git user.email to $defaultEmail"
}

# Ensure we are on the main branch
$currentBranch = git branch --show-current 2>$null
if ($currentBranch -ne "main") {
    if (-not $currentBranch) {
        git checkout -b main
    } else {
        git branch -M main
    }
}

git add .
$hasChanges = git status --porcelain 2>$null
if ($hasChanges) {
    git commit -m "Initial commit: setup Th1ry blog"
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Git commit failed"
        exit 1
    }
    Write-Ok "Local commit completed"
} elseif (-not (git log --oneline -1 2>$null)) {
    # No changes and no commits yet, create an empty initial commit so the branch exists
    git commit --allow-empty -m "Initial commit: setup Th1ry blog"
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Git commit failed"
        exit 1
    }
    Write-Ok "Initial commit created"
} else {
    Write-Warn "No changes to commit"
}

# 5. Create or connect GitHub repository
$fullRepo = "$Owner/$RepoName"
Write-Step "Checking GitHub repository $fullRepo ..."
$repoExists = $false
try {
    gh repo view $fullRepo --json name 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $repoExists = $true }
} catch {}

if ($repoExists) {
    Write-Warn "Repository $fullRepo already exists, will only push code"
} else {
    Write-Step "Creating GitHub repository $fullRepo ..."
    gh repo create $fullRepo --public
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to create repository"
        exit 1
    }
    Write-Ok "Repository created successfully"
}

# 6. Add remote and push
Write-Step "Pushing code to GitHub..."
$remotes = git remote 2>$null
if ($remotes -notcontains "origin") {
    git remote add origin "https://github.com/$fullRepo.git"
}

# If remote is SSH, make sure HTTPS fallback is not used by git commands inside script
git branch -M main

# Try push, if it fails due to unrelated histories, force push
$pushOutput = git push -u origin main 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Normal push failed: $pushOutput"
    Write-Warn "Trying force push..."
    git push -u origin main --force
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Push failed"
        exit 1
    }
}
Write-Ok "Code pushed to GitHub"

# 7. Enable GitHub Pages with GitHub Actions source
Write-Step "Configuring GitHub Pages (Source: GitHub Actions)..."
$pagesBody = @{
    source = "github_actions"
    cname = $Domain
    public = $true
} | ConvertTo-Json -Compress

$tempFile = [System.IO.Path]::GetTempFileName()
$pagesBody | Out-File -FilePath $tempFile -Encoding utf8 -NoNewline

try {
    gh api "repos/$fullRepo/pages" --method PUT --input $tempFile 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "GitHub Pages enabled with custom domain $Domain"
    } else {
        Write-Warn "Failed to auto-configure Pages. Please go to Settings -> Pages and set Source to GitHub Actions."
    }
} catch {
    Write-Warn "Exception while configuring Pages. Please verify in repository settings."
}
finally {
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

# 8. Final instructions
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  GitHub setup completed" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nPlease complete the final step manually: DNS settings" -ForegroundColor Yellow
Write-Host "Add these records at your domain provider:" -ForegroundColor White
Write-Host "  Type: CNAME    Host: www    Target: $Owner.github.io" -ForegroundColor White
Write-Host "  Type: CNAME    Host: @      Target: $Owner.github.io" -ForegroundColor White
Write-Host "`nIf your provider does not support CNAME on @, use A records:" -ForegroundColor White
Write-Host "  185.199.108.153" -ForegroundColor White
Write-Host "  185.199.109.153" -ForegroundColor White
Write-Host "  185.199.110.153" -ForegroundColor White
Write-Host "  185.199.111.153" -ForegroundColor White
Write-Host "`nAfter DNS propagates, visit:" -ForegroundColor White
Write-Host "  https://$Owner.github.io" -ForegroundColor White
Write-Host "  https://$Domain" -ForegroundColor White
Write-Host "`nThe blog will update automatically every day at 09:00 Beijing time." -ForegroundColor White
Write-Host "You can also trigger manually: Actions -> Auto Blog Deploy -> Run workflow" -ForegroundColor White
