# Configuración de Azure SQL Database

Esta guía detalla los pasos para configurar Azure SQL Database para la aplicación L.A.M.A. Hardcore Tropical.

---

## Prerrequisitos

1. Cuenta de Azure activa
2. Azure CLI instalado (opcional pero recomendado)
3. Acceso a Azure Portal

---

## Paso 1: Crear Azure SQL Database

### Opción A: Desde Azure Portal

1. Inicia sesión en [Azure Portal](https://portal.azure.com)
2. Busca "SQL databases" en la barra de búsqueda
3. Click en "Create"
4. Completa el formulario:
   - **Subscription**: Selecciona tu suscripción
   - **Resource Group**: Crea uno nuevo o usa existente (ej: `rg-lamaregionnorte-prod`)
   - **Database name**: `Lamaregionnorte_db`
   - **Server**: Click "Create new"
     - **Server name**: `lamaregionnorte-sql-server` (debe ser único globalmente)
     - **Location**: Selecciona la región más cercana
     - **Authentication**: SQL authentication
     - **Server admin login**: `sqladmin`
     - **Password**: Genera una contraseña segura
   - **Compute + storage**: Selecciona el tier apropiado
     - Para desarrollo: Basic (5 DTU)
     - Para producción: Basic (5 DTU) o Standard S1 
5. Click "Review + create" y luego "Create"

### Opción B: Con Azure CLI

```bash
# Variables
RESOURCE_GROUP="rg-lamaregionnorte-prod"
LOCATION="centralus"
SERVER_NAME="lamaregionnorte-sql-server"
DB_NAME="lamaregionnorte_db"
ADMIN_USER="lamaadmin"
ADMIN_PASSWORD="LamaRegionNorte2026**"

# Crear Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Crear SQL Server
az sql server create \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD

# Crear Database
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name $DB_NAME \
  --service-objective S0 \
  --backup-storage-redundancy Local
```

---

## Paso 2: Configurar Firewall

### Desde Azure Portal:

1. Navega a tu SQL Server en el portal
2. En el menú lateral, selecciona "Networking"
3. En "Firewall rules", agrega:
   - **Rule name**: `AllowLocalDev`
   - **Start IP**: Tu IP pública (se muestra en el portal)
   - **End IP**: Tu IP pública
4. Opcional: Habilita "Allow Azure services and resources to access this server"
5. Click "Save"

### Con Azure CLI:

```bash
# Obtener tu IP actual
MY_IP=$(curl -s ifconfig.me)

# Agregar regla de firewall
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name AllowLocalDev \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP

# Permitir servicios de Azure
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

## Paso 3: Crear la Tabla Inscripciones

Conéctate a la base de datos usando:
- Azure Data Studio
- SQL Server Management Studio (SSMS)
- Azure Portal Query Editor

Ejecuta el siguiente script SQL:

```sql
-- Crear tabla Inscripciones
CREATE TABLE Inscripciones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    tipo_participante NVARCHAR(20) NOT NULL CHECK (tipo_participante IN ('miembro', 'simpatizante', 'prospecto')),
    nombre_miembro NVARCHAR(200) NOT NULL,
    documento NVARCHAR(50) NOT NULL,
    eps NVARCHAR(100) NOT NULL,
    contacto_emergencia NVARCHAR(200) NOT NULL,
    tel_emergencia NVARCHAR(20) NOT NULL,
    capitulo NVARCHAR(100) NOT NULL,
    cargo_directivo NVARCHAR(100),
    fecha_llegada DATE NOT NULL,
    condicion_medica NVARCHAR(MAX),
    interes_jersey BIT NOT NULL DEFAULT 0,
    talla_jersey NVARCHAR(10) CHECK (talla_jersey IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', NULL)),
    asiste_acompanante BIT NOT NULL DEFAULT 0,
    nombre_acompanante NVARCHAR(200),
    fecha_registro DATETIME2 DEFAULT GETDATE(),
    
    INDEX IX_Inscripciones_Documento (documento),
    INDEX IX_Inscripciones_Capitulo (capitulo),
    INDEX IX_Inscripciones_FechaRegistro (fecha_registro)
);

-- Verificar creación
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'Inscripciones';
```

---

## Paso 4: Obtener Cadena de Conexión

### Desde Azure Portal:

1. Navega a tu base de datos `lama_db`
2. En el menú lateral, selecciona "Connection strings"
3. Copia la cadena "ADO.NET (SQL authentication)"
4. Formato:
```
Server=tcp:lama-sql-server.database.windows.net,1433;
Initial Catalog=lama_db;
Persist Security Info=False;
User ID=sqladmin;
Password={tu_contraseña};
MultipleActiveResultSets=False;
Encrypt=True;
TrustServerCertificate=False;
Connection Timeout=30;
```

---

## Paso 5: Configurar Variables de Entorno

Actualiza tu archivo `.env` con los valores reales (puedes partir de `.env.example`):

```env
# Azure SQL Database Configuration
AZURE_SQL_SERVER=lama-sql-server.database.windows.net
AZURE_SQL_DATABASE=lama_db
AZURE_SQL_USER=sqladmin
AZURE_SQL_PASSWORD=TuContraseñaSegura123!
AZURE_SQL_PORT=1433
AZURE_SQL_ENCRYPT=true
# Solo para entorno local si el certificado no es confiable
AZURE_SQL_TRUST_CERT=false

# Credenciales de administración
ADMIN_USERNAME=admin
ADMIN_PASSWORD=TuPasswordAdminSegura

# API Key para endpoints protegidos
API_KEY=TuApiKeySegura
```

IMPORTANTE: Nunca subas el archivo `.env` a repositorios públicos.

---

## Paso 6: Probar Conexión

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# En otra terminal, probar health check
curl http://localhost:3000/api/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "Servicio operativo",
  "database": "Conectado",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

---

## Mejores Prácticas de Seguridad

### 1. Usar Azure Key Vault (Recomendado para Producción)

```bash
# Crear Key Vault
az keyvault create \
  --name lama-keyvault \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Guardar secrets
az keyvault secret set \
  --vault-name lama-keyvault \
  --name "SqlPassword" \
  --value "TuContraseñaSegura123!"
```

### 2. Configurar Managed Identity

Permite que tu aplicación se conecte sin credenciales hardcodeadas.

```bash
# Habilitar Azure AD authentication en SQL Server
az sql server ad-admin create \
  --resource-group $RESOURCE_GROUP \
  --server-name $SERVER_NAME \
  --display-name "LAMA Admin" \
  --object-id <tu-object-id>
```

### 3. Habilitar Auditoría

```bash
az sql server audit-policy update \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --state Enabled \
  --storage-account <tu-storage-account>
```

---

## Monitoreo y Diagnóstico

### Habilitar Query Performance Insights

1. En Azure Portal, navega a tu base de datos
2. Selecciona "Intelligent Performance" → "Query Performance Insight"
3. Habilita el análisis automático

### Configurar Alertas

```bash
# Alerta cuando DTU > 80%
az monitor metrics alert create \
  --name "High-DTU-Usage" \
  --resource-group $RESOURCE_GROUP \
  --scopes /subscriptions/{sub-id}/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.Sql/servers/$SERVER_NAME/databases/$DB_NAME \
  --condition "avg dtu_consumption_percent > 80" \
  --description "DTU usage is above 80%"
```

---

## Backup y Recuperación

Azure SQL Database incluye backups automáticos:
- **Backups completos**: Semanales
- **Backups diferenciales**: Cada 12-24 horas
- **Backups de log**: Cada 5-10 minutos
- **Retención**: 7-35 días (configurable)

### Restaurar a un punto en el tiempo:

```bash
az sql db restore \
  --dest-name lama_db_restored \
  --edition Standard \
  --service-objective S0 \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name $DB_NAME \
  --time "2026-02-12T10:00:00Z"
```

---

## Optimización de Costos

1. **Usar tier apropiado**: Para desarrollo, Basic es suficiente
2. **Pausar cuando no se use**: En desarrollo, apagar fuera de horas
3. **Elastic Pool**: Si tienes múltiples BDs con carga variable
4. **Reserved Capacity**: Descuentos hasta 80% con compromiso de 1-3 años

---

## Recursos Adicionales

- [Documentación oficial Azure SQL](https://docs.microsoft.com/azure/azure-sql/)
- [Mejores prácticas de seguridad](https://docs.microsoft.com/azure/azure-sql/database/security-best-practice)
- [Performance tuning](https://docs.microsoft.com/azure/azure-sql/database/performance-guidance)
- [Pricing calculator](https://azure.microsoft.com/pricing/calculator/)

---

## 🆘 Solución de Problemas

### Error: "Cannot open server"
- Verifica reglas de firewall
- Confirma que tu IP esté permitida
- Revisa que el nombre del servidor sea correcto

### Error: "Login failed"
- Verifica usuario y contraseña
- Confirma que la autenticación SQL esté habilitada
- Revisa permisos del usuario

### Error: "Timeout"
- Aumenta `connectionTimeout` en config
- Verifica conectividad de red
- Revisa que el servidor no esté pausado
