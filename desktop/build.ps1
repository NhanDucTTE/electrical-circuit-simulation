[CmdletBinding()]
param([string]$WebViewSdkDirectory, [switch]$HostOnly, [switch]$PackageOnly)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$releaseRoot = Join-Path $projectRoot 'release'
$releaseName = 'MoPhongTuDien-v1.4.3'
$portable = Join-Path $releaseRoot "$releaseName-win-x64"
$work = Join-Path $projectRoot '.build'
$sdkVersion = '1.0.2365.46'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$dlls = @('Microsoft.Web.WebView2.Core.dll', 'Microsoft.Web.WebView2.WinForms.dll', 'WebView2Loader.dll')
if ($HostOnly -and $PackageOnly) { throw 'Chỉ chọn một trong hai tùy chọn HostOnly hoặc PackageOnly.' }

function Build-Host {
    if (-not $WebViewSdkDirectory) {
        $WebViewSdkDirectory = Join-Path $env:ProgramFiles 'Microsoft Office\root\Office16\ADDINS\Microsoft Power Query for Excel Integrated\bin'
    }
    $managed = Join-Path $WebViewSdkDirectory 'lib\net462'
    if (-not (Test-Path -LiteralPath $managed)) { $managed = $WebViewSdkDirectory }
    $native = Join-Path $WebViewSdkDirectory 'runtimes\win-x64\native'
    if (-not (Test-Path -LiteralPath $native)) { $native = $WebViewSdkDirectory }
    $dependencies = @((Join-Path $managed $dlls[0]), (Join-Path $managed $dlls[1]), (Join-Path $native $dlls[2]))
    foreach ($dependency in $dependencies) {
        if (-not (Test-Path -LiteralPath $dependency)) {
            throw "Thiếu $dependency. Giải nén gói Microsoft.Web.WebView2 $sdkVersion và truyền -WebViewSdkDirectory."
        }
        $file = Get-Item -LiteralPath $dependency
        $signature = Get-AuthenticodeSignature -LiteralPath $dependency
        if ($file.VersionInfo.FileVersion.Trim() -ne $sdkVersion -or $signature.Status -ne 'Valid' -or
            $signature.SignerCertificate.Subject -notmatch '(?:^|,)\s*CN=Microsoft Corporation(?:,|$)') {
            throw "Nguồn, chữ ký hoặc phiên bản không khớp SDK Microsoft $sdkVersion cho $dependency."
        }
    }

    New-Item -ItemType Directory -Path $work,$portable -Force | Out-Null
    $output = Join-Path $work 'MoPhongTuDien.exe'
    $arguments = @(
        '/nologo', '/codepage:65001', '/platform:x64', '/target:winexe', '/optimize+', '/warnaserror+',
        "/out:$output", "/win32manifest:$(Join-Path $PSScriptRoot 'app.manifest')",
        '/reference:System.dll', '/reference:System.Core.dll', '/reference:System.Drawing.dll',
        '/reference:System.Windows.Forms.dll', '/reference:System.Web.Extensions.dll',
        "/reference:$(Join-Path $PSScriptRoot 'cad\ACadSharp.dll')",
        "/reference:$($dependencies[0])", "/reference:$($dependencies[1])",
        "/resource:$(Join-Path $PSScriptRoot 'bridge.js'),bridge.js",
        "/resource:$(Join-Path $projectRoot 'tests\desktop-smoke.js'),desktop-smoke.js",
        (Join-Path $PSScriptRoot 'Program.cs'), (Join-Path $PSScriptRoot 'Verification.cs'),
        (Join-Path $PSScriptRoot 'ExportDrawing.cs')
    )
    $icon = Join-Path $PSScriptRoot 'app.ico'
    if (Test-Path -LiteralPath $icon) { $arguments += "/win32icon:$icon" }
    & $compiler @arguments
    if ($LASTEXITCODE -ne 0) { throw "Biên dịch Windows thất bại với mã $LASTEXITCODE." }
    Copy-Item -LiteralPath $output -Destination $portable -Force
    Copy-Item -LiteralPath $dependencies -Destination $portable -Force
    Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'cad') -Filter '*.dll' | Copy-Item -Destination $portable -Force
}

if (-not $PackageOnly) { Build-Host }
if ($HostOnly) { return }
if (-not (Test-Path -LiteralPath (Join-Path $portable 'MoPhongTuDien.exe'))) {
    throw 'Biên dịch host trước khi chạy PackageOnly.'
}

$assetRoot = Join-Path $portable 'web'
$exampleRoot = Join-Path $portable 'examples'
$docRoot = Join-Path $portable 'docs'
New-Item -ItemType Directory -Path $assetRoot,$exampleRoot,$docRoot -Force | Out-Null
foreach ($pair in @(@('src',$assetRoot), @('examples',$exampleRoot), @('docs',$docRoot))) {
    $input = Join-Path $projectRoot $pair[0]
    Get-ChildItem -LiteralPath $input -Force | Copy-Item -Destination $pair[1] -Recurse -Force
}
Copy-Item -LiteralPath (Join-Path $projectRoot 'README.md'),(Join-Path $PSScriptRoot 'LICENSE-WebView2.txt') -Destination $portable -Force
Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'cad') -Filter 'LICENSE*.txt' | Copy-Item -Destination $docRoot -Force
Copy-Item -LiteralPath (Join-Path $portable 'MoPhongTuDien.exe') -Destination (Join-Path $portable 'Mo Phong Mach Dien.exe') -Force
Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'portable') -File | Copy-Item -Destination $portable -Force
$archive = Join-Path $releaseRoot "$releaseName-win-x64.zip"
Compress-Archive -LiteralPath $portable -DestinationPath $archive -CompressionLevel Optimal -Force
$sourceArchive = Join-Path $releaseRoot "$releaseName-source.zip"
$sourcePaths = @('README.md','src','desktop','examples','docs','tests') | ForEach-Object { Join-Path $projectRoot $_ }
Compress-Archive -LiteralPath $sourcePaths -DestinationPath $sourceArchive -CompressionLevel Optimal -Force
Get-Item -LiteralPath $archive,$sourceArchive | Select-Object FullName,Length
