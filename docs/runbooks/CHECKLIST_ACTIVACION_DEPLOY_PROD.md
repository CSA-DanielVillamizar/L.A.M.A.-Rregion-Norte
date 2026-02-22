# Checklist de Activación Deploy a Producción

Estado actual: el repositorio está configurado para **no desplegar automáticamente**.

## Antes de habilitar despliegues

- [ ] Secrets configurados en GitHub (`AZURE_WEBAPP_NAME`, `AZURE_WEBAPP_PUBLISH_PROFILE`, `APP_BASE_URL`, `AZURE_SQL_*`).
- [ ] Environment `production` creado en GitHub.
- [ ] Revisores requeridos en environment `production` (aprobación manual).
- [ ] Branch protection en `main` (PR obligatorio, checks requeridos).
- [ ] CI (`ci.yml`) en verde en `main`.

## Primer despliegue controlado

1. Ir a **Actions** > `Deploy Production` > `Run workflow`.
2. Definir:
   - `confirmDeploy=DEPLOY_PROD`
   - `runDbBootstrap=true` (solo primer despliegue o cambios de esquema)
   - `ref=<SHA validado>`
3. Esperar finalización del job.
4. Validar:
   - `/health`
   - `/`
   - `/capitulos`
   - `/itinerario`
   - `/admin/dashboard` (credenciales admin)

## Política recomendada

- Nunca desplegar por ZIP manual a producción.
- Todo despliegue debe quedar trazado por run de GitHub Actions.
- Para emergencias, hacer hotfix por PR y disparar workflow manual con SHA exacto.
