/**
 * UTILIDAD: Logger estructurado (JSON lines a stdout/stderr)
 *
 * Azure App Service captura stdout/stderr como logs de la aplicación; que
 * cada línea sea JSON permite que herramientas de log analytics (incluida
 * una futura integración con Application Insights) puedan filtrar/parsear
 * en vez de tener que hacer grep sobre texto libre.
 *
 * Alcance: reemplaza console.log/error en los puntos críticos (arranque,
 * autenticación, errores de base de datos y de los flujos principales), no
 * es un reemplazo exhaustivo de cada console.* del proyecto.
 */

function serializarMeta(meta) {
    if (!meta || typeof meta !== 'object') {
        return {};
    }

    const serializado = { ...meta };

    if (serializado.error instanceof Error) {
        serializado.error = {
            message: serializado.error.message,
            stack: serializado.error.stack
        };
    }

    return serializado;
}

function formatear(level, message, meta) {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        message,
        ...serializarMeta(meta)
    });
}

function info(message, meta) {
    console.log(formatear('info', message, meta));
}

function warn(message, meta) {
    console.warn(formatear('warn', message, meta));
}

function error(message, meta) {
    console.error(formatear('error', message, meta));
}

module.exports = { info, warn, error };
