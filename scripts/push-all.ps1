<#
.SYNOPSIS
    一键提交并推送所有仓库（4 个私有项目 + 1 个网站）

.DESCRIPTION
    - 逐个检查 git 工作区，无变更则跳过
    - 有变更则 add -A + commit（时间戳消息）+ push
    - km-studio：若 data/curated.json 有改动，先跑 build-projects.mjs
      重新生成 projects.js（会自动沿用上一版的 GitHub 统计）
    - 自动清空代理环境变量（WorkBuddy 沙箱代理会导致 GitHub 502）

.EXAMPLE
    pwsh -File scripts\push-all.ps1
#>
#Requires -Version 7.0

$ErrorActionPreference = 'Continue'
$env:HTTP_PROXY = ''; $env:HTTPS_PROXY = ''
$env:http_proxy = ''; $env:https_proxy = ''

$siteRoot = Split-Path $PSScriptRoot -Parent

$repos = @(
    @{ Name = 'living-world-rp'; Path = 'D:\桌面\角色扮演' }
    @{ Name = 'rance03-editor';  Path = 'D:\桌面\file\research\兴趣实验\兰斯修改器' }
    @{ Name = 'cx-exam-float';   Path = 'D:\桌面\file\research\兴趣实验\悬浮窗工具(已完成)' }
    @{ Name = 'esp32-s3-lab';    Path = 'D:\桌面\esp32-s3' }
    @{ Name = 'km-studio';       Path = $siteRoot; Site = $true }
)

$pushed = 0
$skipped = 0
$failed = 0

foreach ($r in $repos) {
    Write-Host "`n=== $($r.Name) ===" -ForegroundColor Cyan

    if (-not (Test-Path (Join-Path $r.Path '.git'))) {
        Write-Host '  ! 不是 git 仓库，跳过' -ForegroundColor Yellow
        $skipped++
        continue
    }

    Push-Location $r.Path

    # 网站：文案变了就重新生成数据文件
    if ($r.Site) {
        $curatedChanged = git status --porcelain data/curated.json 2>$null
        if ($curatedChanged) {
            Write-Host '  ↻ curated.json 有变更，重新生成 projects.js' -ForegroundColor DarkGray
            node scripts/build-projects.mjs | Out-Null
        }
    }

    $status = git status --porcelain 2>$null
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-Host '  (no changes)' -ForegroundColor DarkGray
        $skipped++
        Pop-Location
        continue
    }

    Write-Host $status
    $msg = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git add -A
    git commit -m $msg | Out-Null
    git push 2>&1 | Select-Object -Last 2

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  OK -> $($r.Name)" -ForegroundColor Green
        $pushed++
    }
    else {
        Write-Host "  FAILED -> $($r.Name)" -ForegroundColor Red
        $failed++
    }

    Pop-Location
}

Write-Host "`n----------------------------------------"
Write-Host "pushed=$pushed  skipped=$skipped  failed=$failed"
if ($pushed -gt 0 -and $failed -eq 0) {
    Write-Host '站点会在 1-2 分钟内自动重建：https://kcz-666.github.io/km-studio/' -ForegroundColor Yellow
}
