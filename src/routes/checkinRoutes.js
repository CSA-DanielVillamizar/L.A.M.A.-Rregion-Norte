/**
 * RUTAS DE CHECK-IN (Punto de Control MTO)
 * La página del escáner exige Basic Auth propio del dispositivo MTO
 * (MTO_USERNAME/MTO_PASSWORD); los endpoints de datos usan el mismo esquema
 * de API Key que el resto del panel administrativo.
 */

const express = require('express');
const router = express.Router();
const CheckinController = require('../controllers/checkinController');
const { mtoAuth, checkinApiAuth } = require('../middleware/authMiddleware');

router.get('/', mtoAuth, CheckinController.mostrarScanner);
router.get('/validar/:token', checkinApiAuth, CheckinController.validarToken);
router.post('/validar/:token/confirmar', checkinApiAuth, CheckinController.confirmarCheckin);

module.exports = router;
