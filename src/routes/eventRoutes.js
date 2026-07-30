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

// Registro a evento (multipart/form-data: incluye el comprobante de pago obligatorio)
router.post('/:id/registro', (req, res, next) => {
    eventController.uploadComprobanteMiddleware(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message || 'Error al procesar el comprobante de pago'
            });
        }
        next();
    });
}, eventController.registerToEvent);

module.exports = router;
