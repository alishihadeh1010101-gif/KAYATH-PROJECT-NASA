# Serves this folder at http://localhost:8765 so the browser can remember the microphone permission.
# (Pages opened as file:// cannot store it, so the browser asks again every time.)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = 'http://localhost:8765/'
$types = @{ '.html' = 'text/html; charset=utf-8'; '.js' = 'text/javascript'; '.mjs' = 'text/javascript'; '.css' = 'text/css'; '.json' = 'application/json'; '.png' = 'image/png'; '.svg' = 'image/svg+xml' }
$listener = New-Object Net.HttpListener
$listener.Prefixes.Add($url)
try { $listener.Start() } catch { Write-Host "RadShield-MD is already running at $url"; Start-Process ($url + 'RadShield-MD.html'); exit }
Write-Host "RadShield-MD running at ${url}RadShield-MD.html  (close this window to stop)"
if (-not $env:RADSHIELD_NOOPEN) { Start-Process ($url + 'RadShield-MD.html') }
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if (-not $rel) { $rel = 'RadShield-MD.html' }
    $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if ($path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $path -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($path)
      $ext = [IO.Path]::GetExtension($path).ToLower()
      $ctx.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
      $ctx.Response.Headers.Add('Cache-Control', 'no-store')
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else { $ctx.Response.StatusCode = 404 }
  } catch { $ctx.Response.StatusCode = 500 }
  $ctx.Response.Close()
}
