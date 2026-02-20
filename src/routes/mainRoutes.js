/**
 * CAPA DE PRESENTACIÓN: Rutas principales
 * Define los endpoints de la aplicación y delega la lógica a los controladores
 */

const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// Ruta principal - Landing page
router.get('/', mainController.getHome);

// Ruta de información del club
router.get('/club', mainController.getClubInfo);

// Ruta de contacto
router.get('/contacto', mainController.getContact);
router.post('/contacto', mainController.postContact);

// Ruta de registro al evento
router.get('/registro', mainController.getRegistro);

// Ruta de inscripción al V Campeonato Regional
router.get('/registro-campeonato', mainController.getRegistroCampeonato);

// Ruta del mapa interactivo
router.get('/itinerario', mainController.getItinerario);

// Ruta de capítulos oficiales
router.get('/capitulos', mainController.getCapitulos);

module.exports = router;
