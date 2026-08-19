/**
 * CAPA DE PRESENTACIÓN: Controlador del punto de control MTO (check-in por QR)
 * Toda la lógica de negocio vive en InscripcionModel; este controlador solo
 * traduce el resultado a la semántica visual verde/amarillo/rojo del oficial MTO.
 */

const { InscripcionModel } = require('../models/inscripcionModel');
const logger = require('../utils/logger');

/**
 * Renderiza la página de escaneo (cámara web, sin instalación de app)
 * GET /checkin
 */
exports.mostrarScanner = (req, res) => {
    res.render('checkin/scanner', {
        title: 'Check-in MTO · V Campeonato Región Norte'
    });
};

/**
 * Resuelve el estado de una inscripción a partir del token QR escaneado.
 * No muta datos: solo informa. La confirmación de check-in es un paso aparte.
 * GET /checkin/validar/:token
 */
exports.validarToken = async (req, res) => {
    try {
        const { token } = req.params;
        const inscripcion = await InscripcionModel.obtenerPorQrToken(token);

        if (!inscripcion) {
            return res.status(404).json({
                success: true,
                estado: 'rojo',
                mensaje: 'QR no reconocido: no existe ninguna inscripción asociada a este código.'
            });
        }

        const participante = {
            id_inscripcion: inscripcion.id_inscripcion,
            nombre_completo: inscripcion.nombre_completo,
            documento_numero: inscripcion.documento_numero,
            tipo_participante: inscripcion.tipo_participante,
            capitulo: inscripcion.capitulo
        };

        if (inscripcion.estado_validacion !== 'Aprobado') {
            return res.json({
                success: true,
                estado: 'rojo',
                mensaje: `Pago no aprobado (estado actual: ${inscripcion.estado_validacion}).`,
                participante,
                puedeConfirmar: false
            });
        }

        if (inscripcion.checkin_realizado) {
            const fecha = inscripcion.checkin_fecha
                ? new Date(inscripcion.checkin_fecha).toLocaleString('es-CO')
                : 'fecha desconocida';

            return res.json({
                success: true,
                estado: 'amarillo',
                mensaje: `Este piloto ya hizo check-in (${fecha}).`,
                participante,
                puedeConfirmar: false
            });
        }

        return res.json({
            success: true,
            estado: 'verde',
            mensaje: 'Pago aprobado. Listo para marcar el check-in.',
            participante,
            puedeConfirmar: true
        });
    } catch (error) {
        logger.error('Error en CheckinController.validarToken', { error });
        res.status(500).json({ success: false, message: 'Error al validar el código QR' });
    }
};

/**
 * Confirma el check-in físico en el punto de control (acción explícita del
 * oficial MTO tras revisar visualmente la identidad del piloto).
 * POST /checkin/validar/:token/confirmar
 */
exports.confirmarCheckin = async (req, res) => {
    try {
        const { token } = req.params;
        const resultado = await InscripcionModel.confirmarCheckin(token);

        if (!resultado) {
            return res.status(409).json({
                success: false,
                message: 'No fue posible confirmar el check-in (QR inexistente, pago no aprobado o ya registrado).'
            });
        }

        res.json({
            success: true,
            message: 'Check-in confirmado correctamente.',
            data: resultado
        });
    } catch (error) {
        logger.error('Error en CheckinController.confirmarCheckin', { error });
        res.status(500).json({ success: false, message: 'Error al confirmar el check-in' });
    }
};
