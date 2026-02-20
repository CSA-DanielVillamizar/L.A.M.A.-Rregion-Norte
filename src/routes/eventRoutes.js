/**
 * CAPA DE PRESENTACIÓN: Rutas de eventos
 * Maneja todas las rutas relacionadas con eventos del campeonato
 */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Listado de eventos
router.get('/', eventController.getAllEvents);

// Detalle de evento específico
router.get('/:id', eventController.getEventById);

// Registro a evento
router.post('/:id/registro', eventController.registerToEvent);

module.exports = router;
