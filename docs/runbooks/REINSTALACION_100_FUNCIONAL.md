# Reinstalación 100% Funcional (App + Azure SQL + Deploy)

Este runbook deja el sistema completo funcional en un servidor nuevo, con pasos repetibles y sin trabajo manual frágil.

## 1) Qué incluye este kit

- Provisión de infraestructura Azure: `scripts/ops/provision-azure-node24.ps1`
- Bootstrap de estructura de base de datos: `database/bootstrap/001_inscripciones_campeonato.sql`
- Ejecutor de bootstrap SQL: `scripts/ops/bootstrap-db.js`
- Deploy de aplicación Node 24: `scripts/ops/deploy-release-node24.ps1`
- Orquestador end-to-end: `scripts/ops/reinstall-full-stack.ps1`

## 2) Prerrequisitos

- Azure CLI autenticado (`az login`)
- Node.js 24.x y npm
- PowerShell 5.1+
- Permisos en suscripción para crear `Microsoft.Web` y `Microsoft.Sql`

## 3) Flujo recomendado (end-to-end)

Ejecuta desde la raíz del repositorio:

```powershell
./scripts/ops/reinstall-full-stack.ps1 \
  -SubscriptionId "<subscription-id>" \
  -ResourceGroup "<rg-name>" \
  -Location "centralus" \
  -AppServicePlan "<plan-name>" \
  -AppServiceName "<webapp-name>" \
  -SqlServerName "<sql-server-name-sin-fqdn>" \
  -DatabaseName "<db-name>" \
  -SqlAdminUser "<sql-admin-user>" \
  -SqlAdminPassword "<sql-admin-password>" \
  -AdminUsername "<admin-user>" \
  -AdminPassword "<admin-password>" \
  -ApiKey "<api-key>"
```

## 4) Flujo por etapas (si deseas control granular)

### 4.1 Provisión Azure

```powershell
./scripts/ops/provision-azure-node24.ps1 \
  -SubscriptionId "<subscription-id>" \
  -ResourceGroup "<rg-name>" \
  -Location "centralus" \
  -AppServicePlan "<plan-name>" \
  -AppServiceName "<webapp-name>" \
  -SqlServerName "<sql-server-name-sin-fqdn>" \
  -DatabaseName "<db-name>" \
  -SqlAdminUser "<sql-admin-user>" \
  -SqlAdminPassword "<sql-admin-password>" \
  -AdminUsername "<admin-user>" \
  -AdminPassword "<admin-password>" \
  -ApiKey "<api-key>"
```

### 4.2 Bootstrap de estructura SQL

Configura variables de entorno y ejecuta:

```powershell
$env:AZURE_SQL_SERVER = "<sql-server>.database.windows.net"
$env:AZURE_SQL_DATABASE = "<db-name>"
$env:AZURE_SQL_USER = "<sql-admin-user>"
$env:AZURE_SQL_PASSWORD = "<sql-admin-password>"
$env:AZURE_SQL_PORT = "1433"
$env:AZURE_SQL_ENCRYPT = "true"
$env:AZURE_SQL_TRUST_CERT = "false"

npm run db:bootstrap
```

### 4.3 Deploy de aplicación

```powershell
./scripts/ops/deploy-release-node24.ps1 \
  -ResourceGroup "<rg-name>" \
  -AppServiceName "<webapp-name>"
```

## 5) Verificación mínima obligatoria

- `https://<webapp-name>.azurewebsites.net/health` → 200 + JSON
- `https://<webapp-name>.azurewebsites.net/` → 200
- `https://<webapp-name>.azurewebsites.net/capitulos` → 200
- `https://<webapp-name>.azurewebsites.net/itinerario` → 200
- `https://<webapp-name>.azurewebsites.net/admin/dashboard` (credenciales admin) → 200

## 6) Estructura de BD cubierta por el bootstrap

El script `001_inscripciones_campeonato.sql` crea o asegura:

- Tabla `dbo.InscripcionesCampeonato`
- Columnas extendidas (`evento_id`, `origen_registro`, `acompanantes_json`, `servicios_*`, `total_servicios`)
- Índice `IX_Participante_Cedula`
- Constraints de tipos de participante, capítulo, talla y estado
- Corrección de valores históricos (`PROSP` → `PROSPECT`, etc.)

Todo el script es idempotente: se puede ejecutar varias veces sin romper el esquema.

## 7) Recomendación de operación

Para evitar divergencias local/producción:

- No hacer deploy manual con archivos sueltos.
- Siempre desplegar desde scripts versionados.
- Ideal: integrar estos scripts en pipeline CI/CD de GitHub Actions.
