/**
 * RUTAS DE ADMINISTRACIÓN
 * Define endpoints protegidos para el panel administrativo
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const ContenidoTuristicoController = require('../controllers/contenidoTuristicoController');
const { basicAuth, adminApiAuth } = require('../middleware/authMiddleware');

/**
 * VISTA DE ADMINISTRACIÓN
 * Requiere autenticación básica (usuario/contraseña)
 */
router.get('/dashboard', basicAuth, AdminController.showDashboard);
router.get('/contenido-turistico', basicAuth, ContenidoTuristicoController.mostrarPanel);
router.get('/capitulos-datos', basicAuth, (req, res) => {
    const { PAISES_CAPITULOS } = require('../data/paisesCapitulos');
    res.render('admin/capitulos-datos', { title: 'Datos de Capítulos - L.A.M.A.', paisesCapitulos: PAISES_CAPITULOS });
});
router.get('/planillas', basicAuth, (req, res) => res.render('admin/planillas', { title: 'Planillas de Asistencia - L.A.M.A.' }));

/**
 * API DE ADMINISTRACIÓN
 * Requiere API Key en headers: x-api-key
 */
router.get('/inscripciones', adminApiAuth, AdminController.getAllInscripciones);
router.get('/estadisticas', adminApiAuth, AdminController.getEstadisticas);
router.put('/inscripciones/:id/estado', adminApiAuth, AdminController.actualizarEstado);
router.get('/inscripciones/:id/qr', adminApiAuth, AdminController.obtenerQrInscripcion);
router.delete('/inscripciones/:id', adminApiAuth, AdminController.eliminarInscripcion);

/**
 * API DE GESTIÓN DE EVENTOS
 * Requiere API Key en headers: x-api-key
 */
router.get('/api/eventos', adminApiAuth, AdminController.getAllEventos);
router.post('/api/eventos', adminApiAuth, AdminController.createEvento);
router.put('/api/eventos/reordenar', adminApiAuth, AdminController.reorderEventos);
router.put('/api/eventos/:id', adminApiAuth, AdminController.updateEvento);
router.delete('/api/eventos/:id', adminApiAuth, AdminController.deleteEvento);

/**
 * API DE GESTIÓN DE CAPÍTULOS
 * Requiere API Key en headers: x-api-key
 */
router.get('/capitulos', adminApiAuth, AdminController.getAllCapitulos);
router.get('/capitulos/:id', adminApiAuth, AdminController.getCapituloById);
router.post('/capitulos', adminApiAuth, AdminController.createCapitulo);
router.put('/capitulos/:id', adminApiAuth, AdminController.updateCapitulo);
router.delete('/capitulos/:id', adminApiAuth, AdminController.deleteCapitulo);
router.post('/capitulos/:id/imagen', adminApiAuth, AdminController.uploadMiddleware, AdminController.uploadCapituloImagen);

/**
 * API DE DATOS OPERATIVOS DE CAPÍTULOS (coordenadas + oficiales)
 * Distinto del catálogo anterior /capitulos (contenido de marketing en
 * memoria, solo Colombia): esta cubre el catálogo internacional completo y
 * alimenta el cálculo de distancia + tabla de oficiales de las planillas.
 * Requiere API Key en headers: x-api-key
 */
router.get('/api/capitulos-datos', adminApiAuth, AdminController.listarCapitulosDatos);
router.get('/api/capitulos-datos/detalle', adminApiAuth, AdminController.obtenerCapituloDatos);
router.post('/api/capitulos-datos', adminApiAuth, AdminController.guardarCapituloDatos);

/**
 * API DE PLANILLAS DE ASISTENCIA
 * Requiere API Key en headers: x-api-key
 */
router.get('/api/eventos/:id/capitulos-asistencia', adminApiAuth, AdminController.listarCapitulosConAsistenciaEvento);
router.get('/eventos/:id/planilla/:capitulo/pdf', adminApiAuth, AdminController.descargarPlanillaPdf);

/**
 * API DE GESTIÓN DE TICKER
 * Requiere API Key en headers: x-api-key
 * Maneja anuncios dinámicos del ticker de urgencia
 */
router.get('/ticker', adminApiAuth, AdminController.getAllTicker);
router.post('/ticker', adminApiAuth, AdminController.createTicker);
router.put('/ticker/reordenar', adminApiAuth, AdminController.reorderTicker);
router.put('/ticker/:id', adminApiAuth, AdminController.updateTicker);
router.delete('/ticker/:id', adminApiAuth, AdminController.deleteTicker);

/**
 * HISTÓRICO DE FORMULARIOS PDF
 * Requiere API Key en headers: x-api-key
 */
router.get('/pdf-formularios', adminApiAuth, AdminController.getHistorialFormulariosPdf);
router.get('/pdf-formularios/:id/archivo', adminApiAuth, AdminController.descargarFormularioPdf);
router.get('/pdf-formularios/:id/matricula', adminApiAuth, AdminController.descargarMatriculaMoto);
router.get('/pdf-formularios/:id/licencia', adminApiAuth, AdminController.descargarLicenciaConduccion);

/**
 * API DE GESTIÓN DE SERVICIOS PREMIUM
 * Requiere API Key en headers: x-api-key
 * Maneja servicios premium disponibles para los participantes
 */
router.get('/api/servicios', adminApiAuth, AdminController.getAllServicios);
router.post('/api/servicios', adminApiAuth, AdminController.createServicio);
router.put('/api/servicios/:id', adminApiAuth, AdminController.updateServicio);
router.delete('/api/servicios/:id', adminApiAuth, AdminController.deleteServicio);

/**
 * API DE GESTIÓN DE ALOJAMIENTO Y TURISMO
 * Requiere API Key en headers: x-api-key
 */
router.get('/api/hoteles', adminApiAuth, ContenidoTuristicoController.getAllHoteles);
router.post('/api/hoteles', adminApiAuth, ContenidoTuristicoController.createHotel);
router.put('/api/hoteles/:id', adminApiAuth, ContenidoTuristicoController.updateHotel);
router.delete('/api/hoteles/:id', adminApiAuth, ContenidoTuristicoController.deleteHotel);

router.get('/api/destinos-turisticos', adminApiAuth, ContenidoTuristicoController.getAllDestinos);
router.post('/api/destinos-turisticos', adminApiAuth, ContenidoTuristicoController.createDestino);
router.put('/api/destinos-turisticos/:id', adminApiAuth, ContenidoTuristicoController.updateDestino);
router.delete('/api/destinos-turisticos/:id', adminApiAuth, ContenidoTuristicoController.deleteDestino);

router.get('/api/servicios-premium', adminApiAuth, ContenidoTuristicoController.getAllServiciosPremium);
router.post('/api/servicios-premium', adminApiAuth, ContenidoTuristicoController.createServicioPremium);
router.put('/api/servicios-premium/:id', adminApiAuth, ContenidoTuristicoController.updateServicioPremium);
router.delete('/api/servicios-premium/:id', adminApiAuth, ContenidoTuristicoController.deleteServicioPremium);

module.exports = router;
