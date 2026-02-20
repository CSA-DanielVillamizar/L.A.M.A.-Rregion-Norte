/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Protege rutas administrativas con autenticación básica
 */

/**
 * Middleware de autenticación básica
 * Usuario y contraseña configurados en variables de entorno
 */
const basicAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
        return res.status(401).json({
            success: false,
            message: 'Autenticación requerida'
        });
    }

    try {
        // Decodificar credenciales Base64
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [username, password] = credentials.split(':');

        // Validar contra variables de entorno
        const adminUser = process.env.ADMIN_USERNAME;
        const adminPass = process.env.ADMIN_PASSWORD;

        if (!adminUser || !adminPass) {
            return res.status(500).json({
                success: false,
                message: 'Configuración insegura: faltan ADMIN_USERNAME y/o ADMIN_PASSWORD en variables de entorno'
            });
        }

        if (username === adminUser && password === adminPass) {
            req.user = { username, role: 'admin' };
            next();
        } else {
            res.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error en el proceso de autenticación'
        });
    }
};

/**
 * Middleware para proteger endpoints de API
 * Verifica token simple en headers
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

module.exports = {
    basicAuth,
    apiKeyAuth
};
