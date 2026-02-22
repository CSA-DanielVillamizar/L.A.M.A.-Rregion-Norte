# CI/CD con GitHub Actions (Producción)

Este documento define el flujo oficial para evitar divergencias entre local y producción.

## Workflows incluidos

- `/.github/workflows/ci.yml`
  - Corre en `push` y `pull_request` sobre `main`.
  - Valida instalación y carga de scripts críticos.

- `/.github/workflows/deploy-production.yml`
   Corre solo por ejecución manual (`workflow_dispatch`), requiere confirmación explícita (`confirmDeploy=DEPLOY_PROD`), ejecuta bootstrap SQL opcional, despliega a Azure Web App y corre smoke tests de rutas críticas.

## Estado actual: preparado SIN despliegue automático

El pipeline de producción está configurado en modo seguro:

- No se dispara por `push`.
- Solo corre manualmente desde Actions.
- Exige confirmación explícita para evitar ejecuciones accidentales.

## Secrets requeridos (Repository/Environment: production)

Configura estos secrets en GitHub:

1. `AZURE_WEBAPP_NAME`
   Ejemplo: `lamaregionnorte`

2. `AZURE_WEBAPP_PUBLISH_PROFILE`
   Contenido completo del publish profile descargado desde Azure Portal.

3. `APP_BASE_URL`
   Ejemplo: `https://lamaregionnorte.azurewebsites.net`

4. `AZURE_SQL_SERVER`
   Ejemplo: `lamaregionnorte-sql-a90e.database.windows.net`

5. `AZURE_SQL_DATABASE`
6. `AZURE_SQL_USER`
7. `AZURE_SQL_PASSWORD`

## Flujo operativo recomendado

1. Hacer cambios en branch.
2. Abrir Pull Request a `main`.
3. Verificar `CI` en verde.
4. Merge a `main`.
5. Ejecutar manualmente `Deploy Production` cuando se autorice.
6. Verificar resultados en `/health` y rutas críticas.

## Deploy manual controlado

Desde GitHub Actions > `Deploy Production` > `Run workflow`:

- `confirmDeploy=DEPLOY_PROD`: obligatorio para ejecutar.
- `runDbBootstrap=true`: aplica estructura SQL antes de deploy.
- `ref=<sha/tag/branch>`: permite desplegar versión exacta.

## Política para evitar drift

- No deploy manual por ZIP local a producción.
- No hotfix directo en App Service salvo incidente crítico.
- Todo cambio debe pasar por commit + PR + workflow.

## Notas de seguridad

- Nunca guardar credenciales en scripts versionados.
- Rotar publish profile y contraseñas periódicamente.
- Usar `environment: production` con aprobación manual si se requiere control adicional.
