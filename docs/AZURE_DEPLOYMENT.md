# 🚀 Guía de Despliegue en Azure App Service

## 📋 Pre-requisitos

- ✅ Cuenta de Azure activa
- ✅ Azure CLI instalado (opcional)
- ✅ Git instalado
- ✅ Base de datos Azure SQL configurada

---

## 🎯 Paso 1: Preparar la Aplicación

### 1.1 Verificar Archivos Esenciales

Asegúrate de tener estos archivos en el root:

```
✅ server.js              # Punto de entrada
✅ package.json           # Dependencias
✅ web.config             # Configuración IIS
✅ .env                   # Variables (NO subir a Git)
```

### 1.2 Crear .gitignore

```bash
# Crear archivo .gitignore
echo "node_modules/
.env
*.log
iisnode/
.DS_Store" > .gitignore
```

### 1.3 Instalar Dependencias

```bash
npm install
npm install axios  # Para el script de prueba
```

---

## 🌐 Paso 2: Crear Azure App Service

### Opción A: Azure Portal (Interfaz Web)

1. **Ir a Azure Portal**: https://portal.azure.com
2. **Crear recurso** → Buscar "App Service"
3. **Configuración básica**:
   - Grupo de recursos: `lamanorte-rg` (nuevo o existente)
   - Nombre: `vcampeonatomototurismoregionnorte` (debe ser único)
   - Publicar: **Código**
   - Pila del entorno: **Node 18 LTS**
   - Sistema operativo: **Windows**
   - Región: **Central US** (o la más cercana)
   - Plan: **B1** (Basic) o superior

4. Click en **Revisar y crear** → **Crear**

### Opción B: Azure CLI

```bash
# Login en Azure
az login

# Crear grupo de recursos
az group create --name lama-rg --location eastus

# Crear plan de App Service
az appservice plan create \
  --name lama-plan \
  --resource-group lama-rg \
  --sku B1 \
  --is-linux false

# Crear App Service
az webapp create \
  --name vcampeonatomototurismoregionnorte \
  --resource-group lama-rg \
  --plan lama-plan \
  --runtime "NODE:18-lts"
```

---

## 🔧 Paso 3: Configurar Variables de Entorno en Azure

### 3.1 Desde Azure Portal

1. Ve a tu App Service → **Configuración** → **Configuración de la aplicación**
2. Click en **+ Nueva configuración de aplicación**
3. Agrega estas variables:

```
NOMBRE                    | VALOR
--------------------------|----------------------------------------
NODE_ENV                  | production
PORT                      | 8080
AZURE_SQL_SERVER          | tu-server.database.windows.net
AZURE_SQL_DATABASE        | lama_db
AZURE_SQL_USER            | sqladmin
AZURE_SQL_PASSWORD        | tu_password_seguro
AZURE_SQL_ENCRYPT         | true
ADMIN_USERNAME            | presidente_lama
ADMIN_PASSWORD            | contraseña_super_segura_2026
API_KEY                   | lama-prod-key-$(uuidgen)
```

4. Click en **Guardar**

### 3.2 Con Azure CLI

```bash
az webapp config appsettings set \
  --name vcampeonatomototurismoregionnorte \
  --resource-group lama-rg \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    AZURE_SQL_SERVER=tu-server.database.windows.net \
    AZURE_SQL_DATABASE=lama_db \
    AZURE_SQL_USER=sqladmin \
    AZURE_SQL_PASSWORD=tu_password_seguro \
    AZURE_SQL_ENCRYPT=true \
    ADMIN_USERNAME=admin_prod \
    ADMIN_PASSWORD=Password123! \
    API_KEY=lama-prod-key-abc123
```

---

## 📦 Paso 4: Desplegar el Código

### Opción A: Despliegue con Git (Recomendado)

```bash
# 1. Inicializar repositorio Git (si no existe)
git init

# 2. Agregar archivos
git add .
git commit -m "Initial commit"

# 3. Configurar credenciales de despliegue en Azure Portal
# App Service → Centro de implementación → Credenciales locales de Git/FTPS
# Usuario: lama-deploy
# Contraseña: [genera una segura]

# 4. Obtener URL de Git desde Azure Portal
# Centro de implementación → Git local → Copiar URL Git

# 5. Agregar remote y push
git remote add azure https://lama-deploy@lama-campeonato.scm.azurewebsites.net/lama-campeonato.git
git push azure main
```

### Opción B: Despliegue con VS Code

1. Instalar extensión: **Azure App Service**
2. Click derecho en carpeta del proyecto
3. Seleccionar **Deploy to Web App**
4. Elegir tu App Service
5. Confirmar despliegue

### Opción C: Despliegue con ZIP

```bash
# 1. Crear archivo ZIP (sin node_modules)
zip -r lama-app.zip . -x "node_modules/*" ".git/*" ".env"

# 2. Desplegar con Azure CLI
az webapp deployment source config-zip \
  --name lama-campeonato \
  --resource-group lama-rg \
  --src lama-app.zip
```

---

## 🔒 Paso 5: Configurar Firewall de Azure SQL

### Permitir Conexiones desde App Service

```bash
# Obtener IP saliente del App Service
az webapp show \
  --name lama-campeonato \
  --resource-group lama-rg \
  --query outboundIpAddresses \
  --output tsv

# Agregar regla de firewall para cada IP
az sql server firewall-rule create \
  --server tu-server \
  --resource-group lama-rg \
  --name AllowAppService \
  --start-ip-address [IP_OBTENIDA] \
  --end-ip-address [IP_OBTENIDA]
```

O desde Azure Portal:
1. Ve a tu SQL Server → **Firewall y redes virtuales**
2. Click en **+ Agregar IP de cliente**
3. Agrega las IPs salientes del App Service

---

## ✅ Paso 6: Verificar Despliegue

### 6.1 Probar la Aplicación

```bash
# Abrir en navegador
https://lama-campeonato.azurewebsites.net

# Verificar health check
curl https://lama-campeonato.azurewebsites.net/api/health
```

### 6.2 Ver Logs

```bash
# Con Azure CLI
az webapp log tail \
  --name lama-campeonato \
  --resource-group lama-rg

# O desde Azure Portal
# App Service → Registros de App Service → Habilitar
# Monitoring → Log stream
```

### 6.3 Probar Dashboard

```
URL: https://lama-campeonato.azurewebsites.net/admin/dashboard
Usuario: [ADMIN_USERNAME de config]
Password: [ADMIN_PASSWORD de config]
```

---

## 🔧 Paso 7: Configuraciones Adicionales

### 7.1 Dominio Personalizado (Opcional)

```bash
# Agregar dominio personalizado
az webapp config hostname add \
  --webapp-name lama-campeonato \
  --resource-group lama-rg \
  --hostname www.lama-campeonato.com
```

### 7.2 SSL/HTTPS (Obligatorio en Producción)

```bash
# Habilitar HTTPS forzado
az webapp update \
  --name lama-campeonato \
  --resource-group lama-rg \
  --https-only true
```

### 7.3 Configurar Always On

Desde Azure Portal:
1. App Service → **Configuración** → **Configuración general**
2. Habilitar **Always On** (mantiene la app activa)
3. Guardar

---

## 🐛 Troubleshooting

### Error: "Application Error"

**Solución**:
1. Verifica logs: `az webapp log tail`
2. Verifica que `web.config` esté en root
3. Verifica que `server.js` escuche en `process.env.PORT`

### Error: "Cannot connect to database"

**Solución**:
1. Verifica variables de entorno en Azure
2. Verifica reglas de firewall de SQL Server
3. Prueba conexión desde portal Azure SQL

### Error: "Module not found"

**Solución**:
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Fix dependencies"
git push azure main
```

### Página en blanco o 404

**Solución**:
1. Verifica que `web.config` esté correcto
2. Verifica que el puerto sea `process.env.PORT || 3000`
3. Reinicia el App Service desde portal

---

## 📊 Monitoreo y Mantenimiento

### Application Insights (Recomendado)

1. Crear recurso Application Insights
2. Copiar Instrumentation Key
3. Agregar a configuración del App Service:
   ```
   APPINSIGHTS_INSTRUMENTATIONKEY = [tu-key]
   ```

### Logs de Diagnóstico

```bash
# Habilitar logs detallados
az webapp log config \
  --name lama-campeonato \
  --resource-group lama-rg \
  --application-logging true \
  --detailed-error-messages true \
  --failed-request-tracing true
```

---

## 💰 Costos Estimados (México/Colombia)

| Servicio | Plan | Costo Mensual (USD) |
|----------|------|---------------------|
| App Service | B1 Basic | ~$13 |
| Azure SQL Database | Basic (2GB) | ~$5 |
| **TOTAL** | | **~$18/mes** |

Para producción con más tráfico:
- App Service S1: ~$70/mes
- Azure SQL S0: ~$15/mes
- Total: ~$85/mes

---

## ✅ Checklist Final

Antes de ir a producción:

- [ ] Variables de entorno configuradas en Azure
- [ ] Credenciales de admin cambiadas
- [ ] API Key generada de forma segura
- [ ] Firewall de Azure SQL configurado
- [ ] HTTPS forzado habilitado
- [ ] Always On activado
- [ ] Logs de diagnóstico habilitados
- [ ] Tabla InscripcionesCampeonato creada
- [ ] Script de prueba ejecutado exitosamente
- [ ] Dashboard accesible con nuevas credenciales
- [ ] Backup de base de datos configurado

---

## 🔗 URLs Finales

```
Sitio Web:        https://lama-campeonato.azurewebsites.net
Dashboard Admin:  https://lama-campeonato.azurewebsites.net/admin/dashboard
API Health:       https://lama-campeonato.azurewebsites.net/api/health
Registro:         https://lama-campeonato.azurewebsites.net/registro
```

---

## 📚 Recursos Adicionales

- **Documentación Azure App Service**: https://docs.microsoft.com/azure/app-service/
- **Node.js en Azure**: https://docs.microsoft.com/azure/app-service/quickstart-nodejs
- **Azure SQL Database**: https://docs.microsoft.com/azure/azure-sql/

---

**Fecha**: 13 de febrero de 2026  
**Estado**: ✅ Listo para despliegue
