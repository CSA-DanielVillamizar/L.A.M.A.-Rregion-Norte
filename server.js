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

const { getPool } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// CAPA DE CONFIGURACIÓN: Middleware
// ============================================
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

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

app.use('/', mainRoutes);
app.use('/eventos', eventRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

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
            console.log('Conexión a base de datos verificada');
        })
        .catch((error) => {
            console.error('Error al verificar conexión a base de datos:', error.message);
        });
};

// Manejo de errores no capturados
process.on('unhandledRejection', (reason) => {
    console.error('Promesa rechazada no controlada:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Excepción no controlada:', error);
});

startServer();

module.exports = app;
