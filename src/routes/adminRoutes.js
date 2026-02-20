/**
 * RUTAS DE ADMINISTRACIÓN
 * Define endpoints protegidos para el panel administrativo
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { basicAuth, apiKeyAuth } = require('../middleware/authMiddleware');

/**
 * VISTA DE ADMINISTRACIÓN
 * Requiere autenticación básica (usuario/contraseña)
 */
router.get('/dashboard', basicAuth, AdminController.showDashboard);

/**
 * API DE ADMINISTRACIÓN
 * Requiere API Key en headers: x-api-key
 */
router.get('/inscripciones', apiKeyAuth, AdminController.getAllInscripciones);
router.get('/estadisticas', apiKeyAuth, AdminController.getEstadisticas);
router.put('/inscripciones/:id/estado', apiKeyAuth, AdminController.actualizarEstado);
router.delete('/inscripciones/:id', apiKeyAuth, AdminController.eliminarInscripcion);

/**
 * API DE GESTIÓN DE EVENTOS
 * Requiere API Key en headers: x-api-key
 */
router.get('/api/eventos', apiKeyAuth, AdminController.getAllEventos);
router.post('/api/eventos', apiKeyAuth, AdminController.createEvento);
router.put('/api/eventos/reordenar', apiKeyAuth, AdminController.reorderEventos);
router.put('/api/eventos/:id', apiKeyAuth, AdminController.updateEvento);
router.delete('/api/eventos/:id', apiKeyAuth, AdminController.deleteEvento);

/**
 * API DE GESTIÓN DE CAPÍTULOS
 * Requiere API Key en headers: x-api-key
 */
router.get('/capitulos', apiKeyAuth, AdminController.getAllCapitulos);
router.get('/capitulos/:id', apiKeyAuth, AdminController.getCapituloById);
router.post('/capitulos', apiKeyAuth, AdminController.createCapitulo);
router.put('/capitulos/:id', apiKeyAuth, AdminController.updateCapitulo);
router.delete('/capitulos/:id', apiKeyAuth, AdminController.deleteCapitulo);
router.post('/capitulos/:id/imagen', apiKeyAuth, AdminController.uploadMiddleware, AdminController.uploadCapituloImagen);

/**
 * API DE GESTIÓN DE TICKER
 * Requiere API Key en headers: x-api-key
 * Maneja anuncios dinámicos del ticker de urgencia
 */
router.get('/ticker', apiKeyAuth, AdminController.getAllTicker);
router.post('/ticker', apiKeyAuth, AdminController.createTicker);
router.put('/ticker/reordenar', apiKeyAuth, AdminController.reorderTicker);
router.put('/ticker/:id', apiKeyAuth, AdminController.updateTicker);
router.delete('/ticker/:id', apiKeyAuth, AdminController.deleteTicker);

/**
 * HISTÓRICO DE FORMULARIOS PDF
 * Requiere API Key en headers: x-api-key
 */
router.get('/pdf-formularios', apiKeyAuth, AdminController.getHistorialFormulariosPdf);
router.get('/pdf-formularios/:id/archivo', apiKeyAuth, AdminController.descargarFormularioPdf);
router.get('/pdf-formularios/:id/matricula', apiKeyAuth, AdminController.descargarMatriculaMoto);
router.get('/pdf-formularios/:id/licencia', apiKeyAuth, AdminController.descargarLicenciaConduccion);

/**
 * API DE GESTIÓN DE SERVICIOS PREMIUM
 * Requiere API Key en headers: x-api-key
 * Maneja servicios premium disponibles para los participantes
 */
router.get('/api/servicios', apiKeyAuth, AdminController.getAllServicios);
router.post('/api/servicios', apiKeyAuth, AdminController.createServicio);
router.put('/api/servicios/:id', apiKeyAuth, AdminController.updateServicio);
router.delete('/api/servicios/:id', apiKeyAuth, AdminController.deleteServicio);

module.exports = router;
