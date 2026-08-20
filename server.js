/**
 * Servidor principal de la aplicación L.A.M.A. Hardcore Tropical
 * Implementa Clean Architecture con separación de capas
 */

try {
    require('dotenv').config();
} catch (error) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('dotenv no disponible, continuando sin archivo .env');
    }
}
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { getPool } = require('./src/config/database');
const logger = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Necesario para que req.ip refleje la IP real del cliente detrás del
// proxy de Azure App Service (afecta rate limiting y el bloqueo por
// intentos fallidos en authMiddleware.js).
app.set('trust proxy', 1);

// ============================================
// CAPA DE CONFIGURACIÓN: Middleware
// ============================================
app.use(cors());
app.use(helmet({
    // La app carga Tailwind, Google Fonts, Leaflet y html5-qrcode desde CDN
    // y usa scripts/estilos inline en casi todas las vistas. Construir un
    // Content-Security-Policy correcto requiere catalogar cada fuente
    // externa por vista — queda pendiente como tarea aparte, no se
    // improvisa aquí. El resto de cabeceras de helmet (nosniff, frameguard,
    // HSTS, etc.) sí quedan activas.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Límite general de peticiones por IP, como protección base contra abuso/DoS
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
}));

// Límite más estricto para el panel admin y el punto de control MTO,
// complementa el bloqueo por intentos fallidos de authMiddleware.js
const limiterAuth = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiadas peticiones. Intenta de nuevo en unos minutos.' }
});
app.use(['/admin', '/checkin', '/api/mi-inscripcion'], limiterAuth);

// Límite para los envíos reales de los formularios públicos (no las páginas
// que los muestran), evita spam de inscripciones/registros.
const limiterFormularios = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiados envíos. Intenta de nuevo más tarde.' }
});
app.use(['/eventos/:eventId/registro', '/api/registro/pdf'], limiterFormularios);

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        status: 'ok',
        service: 'lama-hardcore-tropical-webapp',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// CAPA DE PRESENTACIÓN: Rutas
// ============================================
const mainRoutes = require('./src/routes/mainRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const apiRoutes = require('./src/routes/apiRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const checkinRoutes = require('./src/routes/checkinRoutes');

app.use('/', mainRoutes);
app.use('/eventos', eventRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/checkin', checkinRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Página No Encontrada',
        message: 'La ruta que buscas no existe en el arrecife.'
    });
});

// ============================================
// CAPA DE INFRAESTRUCTURA: Inicio del servidor
// ============================================
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`
    ╔════════════════════════════════════════╗
    ║   L.A.M.A. HARDCORE TROPICAL           ║
    ║  Servidor ejecutándose en puerto ${PORT}  ║
    ║  Entorno: ${process.env.NODE_ENV}         ║
    ╚════════════════════════════════════════╝
    `);
    });

    getPool()
        .then(() => {
            logger.info('Conexión a base de datos verificada');
        })
        .catch((error) => {
            logger.error('Error al verificar conexión a base de datos', { error });
        });
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason) => {
    logger.error('Promesa rechazada no controlada', { error: reason });
});

process.on('uncaughtException', (error) => {
    logger.error('Excepción no controlada', { error });
});

startServer();

module.exports = app;
