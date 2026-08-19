/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Protege rutas administrativas y del punto de control MTO.
 */

const logger = require('../utils/logger');

const MAX_INTENTOS = 5;
const VENTANA_BLOQUEO_MS = 15 * 60 * 1000; // 15 minutos

/**
 * Rastreo de intentos fallidos en memoria, por (tipo de credencial + IP).
 * Nota: esto vive en memoria del proceso Node; si la app llega a escalar a
 * más de una instancia, este contador deja de ser compartido entre
 * instancias y habría que moverlo a un almacén externo (Redis/DB).
 */
const intentosFallidos = new Map();

function obtenerIp(req) {
    return req.ip || req.connection?.remoteAddress || 'desconocida';
}

function estaBloqueado(clave) {
    const registro = intentosFallidos.get(clave);
    if (!registro) return false;

    if (registro.bloqueadoHasta && Date.now() < registro.bloqueadoHasta) {
        return true;
    }

    if (registro.bloqueadoHasta && Date.now() >= registro.bloqueadoHasta) {
        intentosFallidos.delete(clave);
    }

    return false;
}

function registrarFallo(clave) {
    const registro = intentosFallidos.get(clave) || { count: 0 };
    registro.count += 1;

    if (registro.count >= MAX_INTENTOS) {
        registro.bloqueadoHasta = Date.now() + VENTANA_BLOQUEO_MS;
        logger.warn('IP bloqueada temporalmente por intentos fallidos de autenticación', {
            clave,
            intentos: registro.count
        });
    }

    intentosFallidos.set(clave, registro);
}

function registrarExito(clave) {
    intentosFallidos.delete(clave);
}

function respuestaBloqueado(res) {
    return res.status(429).json({
        success: false,
        message: 'Demasiados intentos fallidos. Intenta de nuevo en unos minutos.'
    });
}

/**
 * Construye un middleware de Basic Auth puro (para carga de página), con
 * bloqueo temporal tras varios intentos fallidos consecutivos por IP.
 */
function crearBasicAuth({ realm, envUser, envPass, tipoLockout, rol }) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
            return res.status(401).json({
                success: false,
                message: 'Autenticación requerida'
            });
        }

        const clave = `${tipoLockout}:${obtenerIp(req)}`;
        if (estaBloqueado(clave)) {
            return respuestaBloqueado(res);
        }

        try {
            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
            const [username, password] = credentials.split(':');

            const usuarioValido = process.env[envUser];
            const passValido = process.env[envPass];

            if (!usuarioValido || !passValido) {
                return res.status(500).json({
                    success: false,
                    message: `Configuración insegura: faltan ${envUser} y/o ${envPass} en variables de entorno`
                });
            }

            if (username === usuarioValido && password === passValido) {
                registrarExito(clave);
                req.user = { username, role: rol };
                return next();
            }

            registrarFallo(clave);
            logger.warn('Intento de autenticación fallido', { realm, ip: obtenerIp(req) });
            res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        } catch (error) {
            logger.error('Error en autenticación', { realm, error });
            return res.status(500).json({
                success: false,
                message: 'Error en el proceso de autenticación'
            });
        }
    };
}

/**
 * Middleware de autenticación básica para el panel administrativo (carga de página)
 */
const basicAuth = crearBasicAuth({
    realm: 'Admin Dashboard',
    envUser: 'ADMIN_USERNAME',
    envPass: 'ADMIN_PASSWORD',
    tipoLockout: 'admin',
    rol: 'admin'
});

/**
 * Middleware de autenticación básica para el punto de control MTO (carga de página)
 */
const mtoAuth = crearBasicAuth({
    realm: 'MTO Check-in',
    envUser: 'MTO_USERNAME',
    envPass: 'MTO_PASSWORD',
    tipoLockout: 'mto',
    rol: 'mto'
});

/**
 * Middleware para proteger endpoints de API mediante API Key estática.
 * Pensado para llamadas externas (CI/CD, integraciones), no para el propio
 * frontend del dashboard/scanner — ver `crearAuthDual` para ese caso.
 */
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
        return res.status(500).json({
            success: false,
            message: 'Configuración insegura: falta API_KEY en variables de entorno'
        });
    }

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(403).json({
            success: false,
            message: 'API Key inválida o no proporcionada',
            hint: 'Incluye el header: x-api-key'
        });
    }

    next();
};

/**
 * Middleware de autenticación dual: acepta la API Key (para CI/integraciones
 * externas) O las credenciales de Basic Auth de la sesión ya autenticada
 * (para las propias llamadas fetch() del dashboard/scanner). Esto permite
 * que el HTML nunca tenga que incrustar la API Key: el navegador ya reenvía
 * automáticamente las credenciales de Basic Auth cacheadas en cada request
 * al mismo origen tras el primer login exitoso.
 */
function crearAuthDual({ realm, envUser, envPass, tipoLockout, rol }) {
    const validarBasicAuth = crearBasicAuth({ realm, envUser, envPass, tipoLockout, rol });

    return (req, res, next) => {
        const apiKey = req.headers['x-api-key'];
        const validApiKey = process.env.API_KEY;

        if (validApiKey && apiKey === validApiKey) {
            req.user = { role: rol, via: 'api-key' };
            return next();
        }

        return validarBasicAuth(req, res, next);
    };
}

const adminApiAuth = crearAuthDual({
    realm: 'Admin Dashboard',
    envUser: 'ADMIN_USERNAME',
    envPass: 'ADMIN_PASSWORD',
    tipoLockout: 'admin',
    rol: 'admin'
});

const checkinApiAuth = crearAuthDual({
    realm: 'MTO Check-in',
    envUser: 'MTO_USERNAME',
    envPass: 'MTO_PASSWORD',
    tipoLockout: 'mto',
    rol: 'mto'
});

module.exports = {
    basicAuth,
    apiKeyAuth,
    mtoAuth,
    adminApiAuth,
    checkinApiAuth
};
