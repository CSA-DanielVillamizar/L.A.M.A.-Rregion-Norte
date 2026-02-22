param(
    [Parameter(Mandatory = $true)]
    [string]$ResourceGroup,

    [Parameter(Mandatory = $true)]
    [string]$AppServiceName,

    [string]$ZipName = "deploy-release.zip"
)

$ErrorActionPreference = "Stop"

function Write-Step($mensaje) {
    Write-Host "`n[deploy-release] $mensaje" -ForegroundColor Cyan
}

Write-Step "Instalando dependencias de producción"
npm ci --omit=dev

if (Test-Path $ZipName) {
    Remove-Item $ZipName -Force
}

Write-Step "Generando paquete de despliegue"
Compress-Archive -Path "server.js", "package.json", "package-lock.json", "web.config", "src", "public", "node_modules" -DestinationPath $ZipName -CompressionLevel Optimal -Force

Write-Step "Desplegando en App Service"
az webapp deploy `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --src-path $ZipName `
    --type zip `
    --clean true `
    --restart true `
    --track-status true `
    --output none

$hostName = "$AppServiceName.azurewebsites.net"

Write-Step "Health check"
try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "https://$hostName/health" -TimeoutSec 90
    Write-Host "STATUS=$($response.StatusCode)"
    Write-Host "BODY=$($response.Content)"
} catch {
    Write-Warning $_.Exception.Message
    throw
}

Write-Step "Deployment finalizado"
Write-Host "App URL: https://$hostName" -ForegroundColor Green
