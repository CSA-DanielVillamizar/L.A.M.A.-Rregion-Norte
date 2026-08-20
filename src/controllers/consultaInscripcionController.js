/**
 * CAPA DE APLICACIÓN: Controlador del portal público "Buscar mi inscripción"
 * Permite a un socio consultar el estado de su registro y adjuntar el
 * comprobante de pago más tarde, sin volver a diligenciar el formulario.
 */

const multer = require('multer');
const { InscripcionModel } = require('../models/inscripcionModel');
const logger = require('../utils/logger');

const COMPROBANTE_MIME_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png'];

const comprobanteUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (COMPROBANTE_MIME_PERMITIDOS.includes(file.mimetype)) {
            return cb(null, true);
        }
        cb(new Error('Formato de comprobante no permitido. Usa PDF, JPG o PNG.'));
    }
});

exports.uploadComprobanteMiddleware = comprobanteUpload.single('comprobante');

/**
 * Busca una inscripción por documento o email (cualquiera de los dos).
 */
exports.buscarInscripcion = async (req, res) => {
    try {
        const { identificador } = req.body;

        if (!identificador || String(identificador).trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Ingresa tu documento o correo electrónico'
            });
        }

        const inscripcion = await InscripcionModel.buscarPorIdentificador(identificador);

        if (!inscripcion) {
            return res.status(404).json({
                success: false,
                message: 'No encontramos una inscripción con ese documento o correo electrónico'
            });
        }

        return res.status(200).json({
            success: true,
            inscripcion
        });
    } catch (error) {
        logger.error('Error en consultaInscripcionController.buscarInscripcion', { error });
        return res.status(500).json({
            success: false,
            message: 'No fue posible consultar la inscripción'
        });
    }
};

/**
 * Adjunta el comprobante de pago a una inscripción ya existente, ubicada
 * por documento o email.
 */
exports.subirComprobante = async (req, res) => {
    try {
        const { identificador } = req.body;

        if (!identificador) {
            return res.status(400).json({
                success: false,
                message: 'Ingresa tu documento o correo electrónico'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Adjunta un archivo (PDF, JPG o PNG)'
            });
        }

        const actualizada = await InscripcionModel.actualizarComprobante(identificador, {
            nombreArchivo: req.file.originalname,
            mime: req.file.mimetype,
            tamanoBytes: req.file.size,
            contenido: req.file.buffer
        });

        if (!actualizada) {
            return res.status(404).json({
                success: false,
                message: 'No encontramos una inscripción con ese documento o correo electrónico'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Comprobante adjuntado correctamente'
        });
    } catch (error) {
        logger.error('Error en consultaInscripcionController.subirComprobante', { error });
        return res.status(500).json({
            success: false,
            message: error.message && error.message.includes('Formato de comprobante')
                ? error.message
                : 'No fue posible adjuntar el comprobante'
        });
    }
};
