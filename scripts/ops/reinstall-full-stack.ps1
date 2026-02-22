param(
    [Parameter(Mandatory = $true)]
    [string]$SubscriptionId,

    [Parameter(Mandatory = $true)]
    [string]$ResourceGroup,

    [Parameter(Mandatory = $true)]
    [string]$Location,

    [Parameter(Mandatory = $true)]
    [string]$AppServicePlan,

    [Parameter(Mandatory = $true)]
    [string]$AppServiceName,

    [Parameter(Mandatory = $true)]
    [string]$SqlServerName,

    [Parameter(Mandatory = $true)]
    [string]$DatabaseName,

    [Parameter(Mandatory = $true)]
    [string]$SqlAdminUser,

    [Parameter(Mandatory = $true)]
    [string]$SqlAdminPassword,

    [Parameter(Mandatory = $true)]
    [string]$AdminUsername,

    [Parameter(Mandatory = $true)]
    [string]$AdminPassword,

    [Parameter(Mandatory = $true)]
    [string]$ApiKey
)

$ErrorActionPreference = "Stop"

function Write-Step($mensaje) {
    Write-Host "`n[reinstall-full-stack] $mensaje" -ForegroundColor Cyan
}

Write-Step "1/4 Provision Azure"
& "$PSScriptRoot/provision-azure-node24.ps1" `
    -SubscriptionId $SubscriptionId `
    -ResourceGroup $ResourceGroup `
    -Location $Location `
    -AppServicePlan $AppServicePlan `
    -AppServiceName $AppServiceName `
    -SqlServerName $SqlServerName `
    -DatabaseName $DatabaseName `
    -SqlAdminUser $SqlAdminUser `
    -SqlAdminPassword $SqlAdminPassword `
    -AdminUsername $AdminUsername `
    -AdminPassword $AdminPassword `
    -ApiKey $ApiKey

Write-Step "2/4 Bootstrap DB schema"
$env:AZURE_SQL_SERVER = "$SqlServerName.database.windows.net"
$env:AZURE_SQL_DATABASE = $DatabaseName
$env:AZURE_SQL_USER = $SqlAdminUser
$env:AZURE_SQL_PASSWORD = $SqlAdminPassword
$env:AZURE_SQL_PORT = "1433"
$env:AZURE_SQL_ENCRYPT = "true"
$env:AZURE_SQL_TRUST_CERT = "false"
node "$PSScriptRoot/bootstrap-db.js"

Write-Step "3/4 Deploy app"
& "$PSScriptRoot/deploy-release-node24.ps1" `
    -ResourceGroup $ResourceGroup `
    -AppServiceName $AppServiceName

Write-Step "4/4 Smoke checks"
$baseUrl = "https://$AppServiceName.azurewebsites.net"
$health = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/health" -TimeoutSec 90
$home = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/" -TimeoutSec 90
$capitulos = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/capitulos" -TimeoutSec 90
$itinerario = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/itinerario" -TimeoutSec 90

Write-Host "health........... $($health.StatusCode)"
Write-Host "home............. $($home.StatusCode)"
Write-Host "capitulos........ $($capitulos.StatusCode)"
Write-Host "itinerario....... $($itinerario.StatusCode)"

Write-Step "Reinstalación completada"
Write-Host "App URL: $baseUrl" -ForegroundColor Green
