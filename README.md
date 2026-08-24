# L.A.M.A. Región Norte — CMS de Eventos

**Autor:** Daniel Villamizar ([danielvillamizara@gmail.com](mailto:danielvillamizara@gmail.com))
**Licencia:** MIT
**Producción:** https://lamaregionnorte-cus.azurewebsites.net

---

## 1. ¿Qué es esto?

Este proyecto **no es la landing page de un solo evento** — es un **CMS de gestión de eventos** construido para L.A.M.A. (Ladies of Amvets Motorcycle Association) Región Norte, pensado para que **cualquier capítulo de la región** pueda crear, publicar y administrar sus propios eventos de mototurismo sin tocar código:

- Crear un evento nuevo (fechas, capítulo/comité organizador, país, ubicación, hoteles, destinos turísticos, puntos de ruta, agenda).
- Abrir inscripciones con formulario dinámico por evento, categorías oficiales L.A.M.A., merchandising y **servicios premium opcionales** configurables por evento.
- Validar asistentes en el punto de encuentro mediante **check-in por código QR**.
- Generar automáticamente las **planillas de asistencia oficiales por capítulo**, con cálculo de distancia recorrida (Google Maps o línea recta según el caso).
- Administrar todo desde un panel protegido, sin exponer credenciales en el HTML.

Un mismo despliegue puede alojar el evento anual "V Campeonato de Mototurismo Región Norte" y, en paralelo, eventos propios de cada capítulo — todos definidos como filas de datos, no como páginas hardcodeadas.

## 2. Funcionalidades principales

### Público (sin login)
- `/` — Home con hero, features, hoteles, destinos turísticos, seguridad, FAQ.
- `/eventos` y `/eventos/:id` — Listado y detalle de eventos.
- `/eventos/:id/registro-formulario` y `/registro-campeonato` — Formulario de inscripción (categorías oficiales, acompañantes, merchandising, servicios premium opcionales, subida de comprobante de pago).
- `/mi-inscripcion` — Autoservicio: el usuario busca su inscripción por documento y ve su estado / descarga su comprobante.
- `/itinerario`, `/capitulos`, `/club`, `/contacto`.

### Panel de administración (`/admin/dashboard`, Basic Auth)
- CRUD de eventos, capítulos, hoteles, destinos turísticos, servicios premium por evento, ticker de anuncios.
- Gestión de inscripciones: cambio de estado (pendiente → aprobado/rechazado), eliminación, descarga de comprobantes/matrícula/licencia adjuntos.
- Generación y descarga de **planillas de asistencia en PDF** por capítulo y evento (`/admin/planillas`).

### Punto de control MTO (`/checkin`, Basic Auth propia)
- Escáner que valida el token QR del inscrito y muestra su estado (si no ha pagado, indica enviarlo a tesorería; si está aprobado, confirma el check-in).

### Seguridad
- Rate limiting en tres capas (general, admin/checkin, formularios).
- Bloqueo temporal por intentos fallidos de Basic Auth (5 intentos → 15 min de bloqueo, por IP).
- **Cifrado en reposo (AES-256-GCM)** de los campos PII sensibles: condición médica, contacto de emergencia, EPS y teléfono.
- API Key o Basic Auth dual para que el HTML del panel/scanner nunca incruste credenciales.

## 3. Stack técnico

| Capa | Tecnología |
|---|---|
| Backend | Node.js 24 + Express |
| Vistas | EJS |
| Estilos | Tailwind CSS (CDN) |
| Base de datos | Azure SQL Database (`mssql`) |
| Validación | Joi |
| PDF | `pdfkit` |
| QR | `qrcode` |
| Imágenes | `sharp` |
| Tests | Jest |
| Seguridad HTTP | `helmet`, `express-rate-limit` |
| Hosting | Azure App Service (Linux) |
| CI/CD | GitHub Actions |

### Estructura del proyecto

```
/
├── server.js                  # Punto de entrada, middlewares, rate limiting
├── src/
│   ├── config/database.js     # Pool de conexión Azure SQL (mssql)
│   ├── controllers/           # Capa de aplicación
│   ├── services/               # Lógica de negocio (eventos, inscripciones, planillas, distancias)
│   ├── models/                 # Acceso a datos (Azure SQL)
│   ├── middleware/authMiddleware.js  # Basic Auth + API Key + bloqueo por intentos
│   ├── validators/             # Validación Joi
│   ├── routes/                 # mainRoutes, eventRoutes, apiRoutes, adminRoutes, checkinRoutes
│   ├── utils/encryption.js     # Cifrado AES-256-GCM de PII
│   └── views/                  # Plantillas EJS
├── database/migrations/        # Migraciones versionadas (001…011), ver scripts/ops/migrate.js
├── scripts/ops/                # migrate.js, bootstrap-db.js, provisión Azure
├── docs/                       # Documentación y diagramas adicionales (algunos desactualizados, ver nota abajo)
├── .github/workflows/          # ci.yml, deploy-production.yml
└── test/                       # Suite Jest
```

> **Nota sobre `docs/`:** contiene documentación y diagramas de una versión anterior del proyecto (Feb 2026, antes del rediseño como CMS multi-evento). Este `README.md` es la fuente de verdad actual; los archivos dentro de `docs/` pueden estar desactualizados en detalles de funcionalidad, aunque los diagramas de arquitectura de infraestructura Azure siguen siendo aproximadamente válidos.

## 4. Instalación local

```bash
npm install
cp .env.example .env   # completar valores, ver sección 5
npm run dev             # http://localhost:3000
```

```bash
npm test                # suite Jest
npm run migrate         # aplica migraciones pendientes contra AZURE_SQL_* del .env
```

## 5. Variables de entorno

Definidas en `.env` (local) o como **Application Settings** del App Service (producción). Ver `.env.example` para la plantilla completa.

| Variable | Propósito | Obligatoria |
|---|---|---|
| `NODE_ENV` | `development` / `production` | Sí |
| `PORT` | Puerto local (Azure lo inyecta solo en producción) | Solo local |
| `AZURE_SQL_SERVER` | FQDN del servidor lógico SQL | Sí |
| `AZURE_SQL_DATABASE` | Nombre de la base de datos | Sí |
| `AZURE_SQL_USER` / `AZURE_SQL_PASSWORD` | Credenciales SQL | Sí |
| `AZURE_SQL_PORT` | `1433` | Sí |
| `AZURE_SQL_ENCRYPT` | `true` (obligatorio en Azure SQL) | Sí |
| `AZURE_SQL_TRUST_CERT` | `false` en producción | Sí |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Basic Auth del panel `/admin` | Sí |
| `MTO_USERNAME` / `MTO_PASSWORD` | Basic Auth del escáner `/checkin` | Sí |
| `API_KEY` | Header `x-api-key` para integraciones externas y CI | Sí |
| `PII_ENCRYPTION_KEY` | Clave AES-256 (32 bytes, base64) para cifrar campos PII | Sí |
| `GOOGLE_MAPS_API_KEY` | Distance Matrix API, usada por las planillas de asistencia | Sí (si se usan planillas) |
| `APP_BASE_URL` | URL pública para construir el enlace del QR | Opcional (se infiere del host si se omite) |

## 6. Credenciales — dónde viven y cómo rotarlas

**Por decisión de diseño, este `README.md` es público y no contiene ningún valor real de contraseña, API key o cadena de conexión.** Solo documenta los *nombres* de las variables (tabla arriba) y el procedimiento de rotación.

Las credenciales activas de producción viven **únicamente** en:
1. **Azure App Service → Configuration → Application settings** (`lamaregionnorte-cus`, grupo de recursos `rg-lamaregionnorte-prod`).
2. **GitHub → Settings → Environments → `production` → Secrets** (usados solo durante el deploy, ver sección 8).
3. Un `.env` local, nunca commiteado (está en `.gitignore`).

### Rotar `ADMIN_PASSWORD` o `MTO_PASSWORD`

```bash
az webapp config appsettings set \
  --name lamaregionnorte-cus \
  --resource-group rg-lamaregionnorte-prod \
  --settings ADMIN_PASSWORD="<nueva-contraseña-fuerte>"
```

Cambiar `ADMIN_USERNAME`/`MTO_USERNAME` de la misma forma si además se quiere rotar el usuario. El cambio aplica de inmediato (reinicio automático del sitio); no requiere redeploy ni migración.

### Rotar `API_KEY`

```bash
az webapp config appsettings set \
  --name lamaregionnorte-cus \
  --resource-group rg-lamaregionnorte-prod \
  --settings API_KEY="$(openssl rand -base64 32)"
```

Si algún integrador externo usa la API Key, hay que coordinarlo — deja de funcionar en el momento en que se rota.

### Rotar `PII_ENCRYPTION_KEY`

**No es una rotación trivial**: los datos ya cifrados en la base de datos quedan atados a la clave con la que se cifraron. Rotarla sin plan de migración vuelve ilegibles los registros existentes. Procedimiento seguro:

1. Generar la nueva clave: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
2. Escribir un script one-off que lea cada fila con la clave **vieja** (`decrypt`), y la reescriba con la clave **nueva** (`encrypt`), usando `src/utils/encryption.js`.
3. Solo después de confirmar que todas las filas fueron re-cifradas, actualizar `PII_ENCRYPTION_KEY` en Application Settings.
4. Nunca dejar ambas claves cargadas a la vez en producción de forma permanente — es una ventana de migración, no un estado estable.

### Rotar credenciales de Azure SQL (`AZURE_SQL_USER` / `AZURE_SQL_PASSWORD`)

```bash
az sql server update --name lamaregionnorte-sql-cus --resource-group rg-lamaregionnorte-prod \
  --admin-password "<nueva-contraseña-fuerte>"

az webapp config appsettings set \
  --name lamaregionnorte-cus --resource-group rg-lamaregionnorte-prod \
  --settings AZURE_SQL_PASSWORD="<misma-nueva-contraseña>"
```

También hay que actualizar el secret `AZURE_SQL_PASSWORD` en el Environment `production` de GitHub (sección 8), o el próximo deploy/migración fallará.

### Verificar que una rotación no rompió nada

```bash
curl -fsS https://lamaregionnorte-cus.azurewebsites.net/health
curl -fsS https://lamaregionnorte-cus.azurewebsites.net/api/health
```

## 7. Infraestructura de Azure requerida

Recursos actuales de producción, todos en el grupo de recursos **`rg-lamaregionnorte-prod`**, región **Central US**:

| Recurso | Nombre actual | Tipo / SKU |
|---|---|---|
| Resource Group | `rg-lamaregionnorte-prod` | — |
| App Service Plan | `lamaregionnorte-plan` | Linux, **F1 (Free)** |
| App Service | `lamaregionnorte-cus` | Linux, `NODE\|24-lts` |
| Servidor SQL lógico | `lamaregionnorte-sql-cus` | Azure SQL Server v12 |
| Base de datos | `lamaregionnorte_db` | **Basic**, 2 GB máx. |

> **Advertencia sobre el tier actual (F1 Free):** el App Service corre en el tier gratuito, que **no tiene Always On**, tiene una **cuota diaria de ~60 minutos de CPU** (al agotarse, Azure detiene la app hasta el día siguiente) y no ofrece SLA. Esto es la causa más probable de al menos un incidente de caída de producción observado durante este proyecto (la app apareció en estado `Stopped` tras un deploy con actividad de pruebas intensiva). **Para un uso real y público, se recomienda subir como mínimo a App Service Plan `B1` (Basic)**, que sí soporta Always On y elimina la cuota diaria de CPU.

### Provisionar desde cero (paso a paso)

```bash
# 1. Grupo de recursos
az group create --name rg-lamaregionnorte-prod --location centralus

# 2. App Service Plan (usar B1 en vez de F1 para producción real)
az appservice plan create \
  --name lamaregionnorte-plan --resource-group rg-lamaregionnorte-prod \
  --is-linux --sku B1

# 3. App Service (Node 24 LTS)
az webapp create \
  --name <nombre-unico-global> --resource-group rg-lamaregionnorte-prod \
  --plan lamaregionnorte-plan --runtime "NODE:24-lts"

# 4. Forzar build en el servidor tras cada deploy de zip
az webapp config appsettings set \
  --name <nombre-unico-global> --resource-group rg-lamaregionnorte-prod \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true

# 5. Servidor SQL lógico + base de datos
az sql server create \
  --name <servidor-sql-unico-global> --resource-group rg-lamaregionnorte-prod \
  --location centralus --admin-user <usuario-admin> --admin-password "<contraseña-fuerte>"

az sql db create \
  --name lamaregionnorte_db --server <servidor-sql-unico-global> \
  --resource-group rg-lamaregionnorte-prod --service-objective Basic

# 6. Firewall: permitir que los propios servicios de Azure (App Service) alcancen el SQL Server
az sql server firewall-rule create \
  --server <servidor-sql-unico-global> --resource-group rg-lamaregionnorte-prod \
  --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

# 7. Cargar TODAS las variables de la tabla de la sección 5 como Application Settings
az webapp config appsettings set \
  --name <nombre-unico-global> --resource-group rg-lamaregionnorte-prod \
  --settings \
    NODE_ENV=production \
    AZURE_SQL_SERVER="<servidor-sql-unico-global>.database.windows.net" \
    AZURE_SQL_DATABASE=lamaregionnorte_db \
    AZURE_SQL_USER="<usuario-admin>" \
    AZURE_SQL_PASSWORD="<contraseña-fuerte>" \
    AZURE_SQL_PORT=1433 \
    AZURE_SQL_ENCRYPT=true \
    AZURE_SQL_TRUST_CERT=false \
    ADMIN_USERNAME="<usuario-admin-panel>" \
    ADMIN_PASSWORD="<contraseña-fuerte>" \
    MTO_USERNAME="<usuario-mto>" \
    MTO_PASSWORD="<contraseña-fuerte>" \
    API_KEY="$(openssl rand -base64 32)" \
    PII_ENCRYPTION_KEY="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")" \
    GOOGLE_MAPS_API_KEY="<tu-clave-de-google-maps>"

# 8. Bootstrap del esquema inicial + migraciones (ver sección 9)
npm run db:bootstrap
npm run migrate

# 9. Primer despliegue (ver sección 8, vía GitHub Actions, o manualmente con az webapp deploy)
```

Recomendado además, aunque no imprescindible para que funcione: forzar HTTPS (`az webapp update --https-only true`), y activar Application Insights para observabilidad.

## 8. CI/CD — GitHub Actions

Dos workflows en `.github/workflows/`:

- **`ci.yml`** — corre en cada push/PR: instala dependencias y ejecuta `npm test` (suite Jest) como gate obligatorio.
- **`deploy-production.yml`** — despliegue manual (`workflow_dispatch`), requiere escribir literalmente `DEPLOY_PROD` en el input `confirmDeploy` como salvaguarda contra deploys accidentales. Pasos: instala dependencias, opcionalmente corre bootstrap de BD, aplica migraciones versionadas pendientes, empaqueta y despliega a Azure Web App, espera a que `/health` responda (hasta 4 minutos), y corre smoke tests sobre rutas clave.

```bash
gh workflow run deploy-production.yml \
  --repo <owner>/<repo> \
  -f confirmDeploy=DEPLOY_PROD \
  -f runDbBootstrap=false \
  -f ref=main
```

**Secrets requeridos** en GitHub → Settings → Environments → `production`:

| Secret | Valor |
|---|---|
| `AZURE_SQL_SERVER`, `AZURE_SQL_DATABASE`, `AZURE_SQL_USER`, `AZURE_SQL_PASSWORD` | Mismos valores que las Application Settings del App Service |
| `AZURE_WEBAPP_NAME` | Nombre del App Service (`lamaregionnorte-cus` en producción) |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | Publish profile del App Service (`az webapp deployment list-publishing-profiles --xml`) |
| `APP_BASE_URL` | URL pública del sitio, para los smoke tests post-deploy |

> El publish profile es en sí mismo una credencial sensible (contiene usuario/contraseña de despliegue) — trátalo igual que una contraseña: solo vive en GitHub Secrets, nunca en el repo, y se puede regenerar con `az webapp deployment list-publishing-profiles` seguido de resetear las credenciales de despliegue del App Service si se sospecha filtración.

## 9. Migraciones de base de datos

Sistema de migraciones versionadas en `database/migrations/NNN_*.sql`, aplicadas y trackeadas por `scripts/ops/migrate.js` en la tabla `dbo.SchemaMigrations` (nunca se vuelve a correr una migración ya aplicada).

```bash
npm run migrate
```

Para agregar un cambio de esquema nuevo: crear `database/migrations/012_descripcion.sql` (siguiente número consecutivo), correr `npm run migrate` localmente para probarlo, y dejar que `deploy-production.yml` lo aplique en producción como parte del deploy.

## 10. Limitaciones conocidas

- **Rate limiting y bloqueo por intentos fallidos viven en memoria del proceso Node** (`src/middleware/authMiddleware.js`). Si el App Service llega a escalar a más de una instancia, estos contadores dejan de compartirse entre instancias. Con una sola instancia (configuración actual) funciona correctamente.
- **Tier `F1` (Free) del App Service Plan**: sin Always On, con cuota diaria de CPU, no apto para tráfico real sostenido. Ver recomendación en la sección 7.
- Varios archivos dentro de `docs/` corresponden a una versión anterior del proyecto y pueden describir funcionalidad que ya cambió; este `README.md` es la referencia vigente.

## 11. Licencia

MIT License — © 2026 Daniel Villamizar / L.A.M.A. Región Norte.
