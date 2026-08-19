/**
 * CAPA DE INFRAESTRUCTURA: Configuración de Azure SQL Database
 * Gestiona la conexión con la base de datos usando mssql
 */

const sql = require('mssql');
const logger = require('../utils/logger');

/**
 * Configuración de conexión a Azure SQL Database
 * Utiliza variables de entorno para seguridad
 */
const config = {
    server: process.env.AZURE_SQL_SERVER,
    database: process.env.AZURE_SQL_DATABASE,
    user: process.env.AZURE_SQL_USER,
    password: process.env.AZURE_SQL_PASSWORD,
    port: parseInt(process.env.AZURE_SQL_PORT || '1433'),
    connectionTimeout: 30000,
    requestTimeout: 30000,
    options: {
        encrypt: true,
        trustServerCertificate: false,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

// Pool de conexiones reutilizable
let pool = null;

/**
 * Obtiene el pool de conexiones (Singleton Pattern)
 * @returns {Promise<sql.ConnectionPool>} Pool de conexiones activo
 */
const getPool = async () => {
    try {
        if (!pool) {
            if (!config.server || !config.database || !config.user || !config.password) {
                const missing = [];
                if (!config.server) missing.push('AZURE_SQL_SERVER');
                if (!config.database) missing.push('AZURE_SQL_DATABASE');
                if (!config.user) missing.push('AZURE_SQL_USER');
                if (!config.password) missing.push('AZURE_SQL_PASSWORD');
                throw new Error(`Faltan variables de entorno para Azure SQL: ${missing.join(', ')}`);
            }
            pool = await sql.connect(config);
            logger.info('Conexión establecida con Azure SQL Database');
        }
        return pool;
    } catch (error) {
        logger.error('Error al conectar con Azure SQL Database', { error });
        throw error;
    }
};

/**
 * Cierra el pool de conexiones
 * Útil para limpieza en shutdown de la aplicación
 */
const closePool = async () => {
    try {
        if (pool) {
            await pool.close();
            pool = null;
            logger.info('Conexión con Azure SQL Database cerrada');
        }
    } catch (error) {
        logger.error('Error al cerrar conexión', { error });
        throw error;
    }
};

/**
 * Verifica si la conexión está activa
 * @returns {Boolean} Estado de la conexión
 */
const isConnected = () => {
    return pool && pool.connected;
};

module.exports = {
    sql,
    getPool,
    closePool,
    isConnected,
    config
};
