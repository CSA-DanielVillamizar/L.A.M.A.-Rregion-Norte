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
    Write-Host "`n[provision-node24] $mensaje" -ForegroundColor Cyan
}

Write-Step "Seleccionando suscripción"
az account set --subscription $SubscriptionId | Out-Null

Write-Step "Registrando proveedores requeridos"
az provider register --namespace Microsoft.Web | Out-Null
az provider register --namespace Microsoft.Sql | Out-Null

Write-Step "Creando/validando Resource Group"
az group create --name $ResourceGroup --location $Location --output none

Write-Step "Creando/validando SQL Server"
az sql server create `
    --name $SqlServerName `
    --resource-group $ResourceGroup `
    --location $Location `
    --admin-user $SqlAdminUser `
    --admin-password $SqlAdminPassword `
    --output none

Write-Step "Creando/validando base de datos"
az sql db create `
    --resource-group $ResourceGroup `
    --server $SqlServerName `
    --name $DatabaseName `
    --service-objective Basic `
    --backup-storage-redundancy Local `
    --output none

Write-Step "Habilitando acceso Azure Services en SQL"
az sql server firewall-rule create `
    --resource-group $ResourceGroup `
    --server $SqlServerName `
    --name AllowAzureServices `
    --start-ip-address 0.0.0.0 `
    --end-ip-address 0.0.0.0 `
    --output none

Write-Step "Creando/validando App Service Plan Linux"
az appservice plan create `
    --name $AppServicePlan `
    --resource-group $ResourceGroup `
    --location $Location `
    --is-linux `
    --sku B1 `
    --output none

Write-Step "Creando/validando Web App Node 24"
az webapp create `
    --name $AppServiceName `
    --resource-group $ResourceGroup `
    --plan $AppServicePlan `
    --runtime "NODE|24-lts" `
    --output none

Write-Step "Aplicando configuración de runtime y hardening"
az webapp config set `
    --name $AppServiceName `
    --resource-group $ResourceGroup `
    --linux-fx-version "NODE|24-lts" `
    --always-on true `
    --min-tls-version 1.2 `
    --http20-enabled true `
    --ftps-state Disabled `
    --output none

Write-Step "Aplicando app settings"
az webapp config appsettings set `
    --name $AppServiceName `
    --resource-group $ResourceGroup `
    --settings `
    NODE_ENV=production `
    PORT=8080 `
    AZURE_SQL_SERVER="$SqlServerName.database.windows.net" `
    AZURE_SQL_DATABASE=$DatabaseName `
    AZURE_SQL_USER=$SqlAdminUser `
    AZURE_SQL_PASSWORD=$SqlAdminPassword `
    AZURE_SQL_PORT=1433 `
    AZURE_SQL_ENCRYPT=true `
    AZURE_SQL_TRUST_CERT=false `
    ADMIN_USERNAME=$AdminUsername `
    ADMIN_PASSWORD=$AdminPassword `
    API_KEY=$ApiKey `
    SCM_DO_BUILD_DURING_DEPLOYMENT=true `
    ENABLE_ORYX_BUILD=true `
    --output none

Write-Step "Provisionamiento finalizado"
Write-Host "URL App...............: https://$AppServiceName.azurewebsites.net" -ForegroundColor Green
Write-Host "SQL Server............: $SqlServerName.database.windows.net" -ForegroundColor Green
Write-Host "Base de datos.........: $DatabaseName" -ForegroundColor Green
