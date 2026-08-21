/**
 * Runner de migraciones versionadas de base de datos.
 *
 * Lee database/migrations/NNN_descripcion.sql en orden, y aplica solo las
 * que todavia no esten registradas en la tabla SchemaMigrations. A
 * diferencia del bootstrap original (un solo script gigante re-ejecutado
 * completo cada vez), cada migracion queda registrada individualmente con
 * fecha de aplicacion, dando un historial auditable de cambios de esquema.
 *
 * Convencion para nuevas migraciones:
 *   - Nombre de archivo: NNN_descripcion_corta.sql (NNN = 3 digitos, secuencial)
 *   - El SQL debe ser idempotente (IF NOT EXISTS / IF OBJECT_ID ... IS NULL)
 *     como defensa adicional, aunque el runner ya evita re-ejecutarla.
 *   - Separar lotes con GO en su propia linea si el script necesita varios
 *     batches (igual que el bootstrap existente).
 */

const fs = require('fs');
const path = require('path');
const sql = require('mssql');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../database/migrations');

function obtenerConfiguracionDb() {
    const config = {
        server: process.env.AZURE_SQL_SERVER,
        database: process.env.AZURE_SQL_DATABASE,
        user: process.env.AZURE_SQL_USER,
        password: process.env.AZURE_SQL_PASSWORD,
        port: parseInt(process.env.AZURE_SQL_PORT || '1433', 10),
        options: {
            encrypt: String(process.env.AZURE_SQL_ENCRYPT || 'true').toLowerCase() !== 'false',
            trustServerCertificate: String(process.env.AZURE_SQL_TRUST_CERT || 'false').toLowerCase() === 'true'
        },
        pool: {
            max: 5,
            min: 0,
            idleTimeoutMillis: 30000
        }
    };

    const faltantes = [];
    if (!config.server) faltantes.push('AZURE_SQL_SERVER');
    if (!config.database) faltantes.push('AZURE_SQL_DATABASE');
    if (!config.user) faltantes.push('AZURE_SQL_USER');
    if (!config.password) faltantes.push('AZURE_SQL_PASSWORD');

    if (faltantes.length > 0) {
        throw new Error(`Faltan variables de entorno para conexión SQL: ${faltantes.join(', ')}`);
    }

    return config;
}

function dividirLotes(sqlText) {
    return sqlText
        .split(/^\s*GO\s*$/gim)
        .map((bloque) => bloque.trim())
        .filter(Boolean);
}

async function asegurarTablaControl(pool) {
    await pool.request().query(`
        IF OBJECT_ID('dbo.SchemaMigrations', 'U') IS NULL
        BEGIN
            CREATE TABLE dbo.SchemaMigrations (
                version VARCHAR(20) NOT NULL PRIMARY KEY,
                nombre_archivo VARCHAR(255) NOT NULL,
                aplicada_en DATETIME2 NOT NULL DEFAULT GETDATE()
            );
        END
    `);
}

function listarArchivosMigracion() {
    if (!fs.existsSync(MIGRATIONS_DIR)) return [];

    return fs.readdirSync(MIGRATIONS_DIR)
        .filter((nombre) => /^\d{3}_.+\.sql$/.test(nombre))
        .sort();
}

function extraerVersion(nombreArchivo) {
    return nombreArchivo.slice(0, 3);
}

async function obtenerVersionesAplicadas(pool) {
    const result = await pool.request().query('SELECT version FROM dbo.SchemaMigrations');
    return new Set(result.recordset.map((fila) => fila.version));
}

async function aplicarMigracion(pool, nombreArchivo) {
    const rutaCompleta = path.join(MIGRATIONS_DIR, nombreArchivo);
    const contenido = fs.readFileSync(rutaCompleta, 'utf8');
    const lotes = dividirLotes(contenido);
    const version = extraerVersion(nombreArchivo);

    for (let i = 0; i < lotes.length; i += 1) {
        await pool.request().query(lotes[i]);
    }

    await pool.request()
        .input('version', sql.VarChar(20), version)
        .input('nombre_archivo', sql.VarChar(255), nombreArchivo)
        .query(`
            INSERT INTO dbo.SchemaMigrations (version, nombre_archivo)
            VALUES (@version, @nombre_archivo)
        `);

    console.log(`[migrate] Aplicada: ${nombreArchivo}`);
}

async function ejecutarMigraciones() {
    const archivos = listarArchivosMigracion();

    if (archivos.length === 0) {
        console.log('[migrate] No hay migraciones en database/migrations/');
        return;
    }

    const config = obtenerConfiguracionDb();
    const pool = await sql.connect(config);

    try {
        await asegurarTablaControl(pool);
        const aplicadas = await obtenerVersionesAplicadas(pool);

        let pendientes = 0;
        for (const archivo of archivos) {
            const version = extraerVersion(archivo);
            if (aplicadas.has(version)) {
                console.log(`[migrate] Ya aplicada, se omite: ${archivo}`);
                continue;
            }
            await aplicarMigracion(pool, archivo);
            pendientes += 1;
        }

        console.log(pendientes > 0
            ? `[migrate] ${pendientes} migración(es) nueva(s) aplicada(s)`
            : '[migrate] Base de datos ya al día, nada que aplicar');
    } finally {
        await pool.close();
    }
}

if (require.main === module) {
    ejecutarMigraciones().catch((error) => {
        console.error('[migrate] Error:', error.message);
        process.exit(1);
    });
}

module.exports = {
    ejecutarMigraciones,
    listarArchivosMigracion,
    extraerVersion
};
