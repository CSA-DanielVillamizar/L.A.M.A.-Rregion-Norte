/**
 * Servidor principal con debugging
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Iniciando servidor...');

try {
    console.log('1. Configurando middleware...');
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, 'public')));

    console.log('2. Configurando vistas...');
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'src', 'views'));

    console.log('3. Cargando rutas...');
    const mainRoutes = require('./src/routes/mainRoutes');
    console.log('  - mainRoutes OK');
    
    const eventRoutes = require('./src/routes/eventRoutes');
    console.log('  - eventRoutes OK');
    
    const apiRoutes = require('./src/routes/apiRoutes');
    console.log('  - apiRoutes OK');
    
    const adminRoutes = require('./src/routes/adminRoutes');
    console.log('  - adminRoutes OK');

    console.log('4. Registrando rutas...');
    app.use('/', mainRoutes);
    app.use('/eventos', eventRoutes);
    app.use('/api', apiRoutes);
    app.use('/admin', adminRoutes);

    console.log('5. Iniciando servidor...');
    app.listen(PORT, () => {
        console.log(`
    ╔════════════════════════════════════════╗
    ║   L.A.M.A. HARDCORE TROPICAL           ║
    ║  Servidor ejecutándose en puerto ${PORT}  ║
    ║  Entorno: ${process.env.NODE_ENV}         ║
    ╚════════════════════════════════════════╝
        `);
    });
} catch (error) {
    console.error('ERROR FATAL:', error.message);
    console.error(error.stack);
    process.exit(1);
}

module.exports = app;
