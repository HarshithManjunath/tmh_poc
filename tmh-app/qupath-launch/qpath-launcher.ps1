param([string]$Url)

$scheme = 'qpath://'
$path = $Url
if ($path.StartsWith($scheme, [System.StringComparison]::OrdinalIgnoreCase)) {
  $path = $path.Substring($scheme.Length)
}
$path = [System.Uri]::UnescapeDataString($path)
$path = $path.Replace('/', '\')

$exe = $null
foreach ($base in @((Join-Path $env:LOCALAPPDATA 'QuPath-*\QuPath-*.exe'),
                   'C:\Program Files\QuPath-*\QuPath-*.exe')) {
  $found = Get-ChildItem $base -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notmatch 'console' } |
    Select-Object -First 1 -ExpandProperty FullName
  if ($found) { $exe = $found; break }
}

if (-not $exe) {
  Write-Error 'QuPath executable not found.'
  exit 1
}

Start-Process -FilePath $exe -ArgumentList "--image `"$path`""
