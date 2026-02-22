const fs = require('fs');
const path = require('path');
const sql = require('mssql');

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

async function ejecutarBootstrap() {
    const scriptPath = path.resolve(__dirname, '../../database/bootstrap/001_inscripciones_campeonato.sql');
    const scriptSql = fs.readFileSync(scriptPath, 'utf8');
    const lotes = dividirLotes(scriptSql);

    const config = obtenerConfiguracionDb();
    const pool = await sql.connect(config);

    try {
        for (let i = 0; i < lotes.length; i += 1) {
            const lote = lotes[i];
            await pool.request().query(lote);
            console.log(`[bootstrap-db] Lote ${i + 1}/${lotes.length} aplicado`);
        }

        console.log('[bootstrap-db] Estructura de base de datos lista');
    } finally {
        await pool.close();
    }
}

if (require.main === module) {
    ejecutarBootstrap().catch((error) => {
        console.error('[bootstrap-db] Error:', error.message);
        process.exit(1);
    });
}

module.exports = {
    ejecutarBootstrap
};
