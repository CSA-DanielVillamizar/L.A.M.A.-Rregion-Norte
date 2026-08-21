# Migraciones versionadas

Cada cambio de esquema a partir de ahora vive aquí como un archivo `NNN_descripcion_corta.sql`, en vez de acumularse disperso en funciones "self-healing" dentro de los modelos (patrón usado antes en `inscripcionModel.js` — sigue funcionando para lo ya existente, pero no se repite para cambios nuevos).

## Convención

- **Nombre**: `NNN_descripcion_corta.sql`, con `NNN` un número de 3 dígitos secuencial (`001`, `002`, ...). El número es lo único que el runner usa como identificador — nunca reutilizar uno ya aplicado.
- **Idempotencia**: aunque el runner solo aplica cada migración una vez (queda registrada en `dbo.SchemaMigrations`), el SQL igual debe escribirse con guardas (`IF NOT EXISTS`, `IF OBJECT_ID(...) IS NULL`, etc.) como defensa adicional, siguiendo el mismo estilo que `database/bootstrap/001_inscripciones_campeonato.sql`.
- **Lotes**: si el script necesita varios batches, separarlos con `GO` en su propia línea (igual que el bootstrap).
- **Nunca editar una migración ya aplicada en producción.** Si algo quedó mal, se corrige con una migración nueva.

## Cómo se aplican

```bash
npm run migrate
```

Esto crea `dbo.SchemaMigrations` si no existe, revisa qué versiones ya están registradas, y aplica solo las que faltan, en orden. Se ejecuta automáticamente en cada despliegue a producción (ver `.github/workflows/deploy-production.yml`), así que no requiere intervención manual — solo agregar el archivo `.sql` y hacer push a `main`.

## Relación con `database/bootstrap/`

`database/bootstrap/001_inscripciones_campeonato.sql` sigue siendo el script de aprovisionamiento inicial (crear la tabla desde cero en una base de datos nueva) y se sigue disparando manualmente vía el input `runDbBootstrap` del workflow de deploy. Las migraciones de esta carpeta son *incrementales*: asumen que el bootstrap ya corrió alguna vez y solo describen cambios posteriores.
