/**
 * CAPA DE PRESENTACIÓN: Rutas API
 * Define los endpoints REST de la aplicación
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const InscripcionController = require('../controllers/inscripcionController');
const { InscripcionModel } = require('../models/inscripcionModel');
const { validateInscripcionMiddleware } = require('../validators/inscripcionValidator');
const { apiKeyAuth } = require('../middleware/authMiddleware');
const PdfFormularioNacionalService = require('../services/pdfFormularioNacionalService');
const PdfRegistroStorageService = require('../services/pdfRegistroStorageService');
const UbicacionController = require('../controllers/ubicacionController');

const uploadMemoria = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const uploadRegistroPdf = uploadMemoria.fields([
    { name: 'fotografia', maxCount: 1 },
    { name: 'matricula_moto', maxCount: 1 },
    { name: 'licencia_conduccion', maxCount: 1 }
]);

const normalizarCapitulo = (capitulo = '') => {
    const mapaCapitulos = {
        'Barranquilla (Atlántico)': 'Barranquilla',
        'Bucaramanga (Santander)': 'Bucaramanga',
        'Cartagena (Bolívar)': 'Cartagena',
        'Cúcuta (Norte de Santander)': 'Cúcuta',
        'Floridablanca (Santander)': 'Floridablanca',
        'Medellín (Antioquia)': 'Medellín',
        'Puerto Colombia (Atlántico)': 'Puerto Colombia',
        'Valle de Aburrá (Antioquia)': 'Valle Aburrá',
        'Zenú (Sucre - Córdoba)': 'Zenu'
    };

    return mapaCapitulos[capitulo] || capitulo;
};

const normalizarPayloadRegistro = (req, res, next) => {
    const body = req.body || {};

    req.body = {
        tipo_participante: body.tipo_participante,
        nombre_completo: body.nombre_completo || body.nombre_miembro,
        documento_numero: body.documento_numero || body.documento,
        eps: body.eps,
        emergencia_nombre: body.emergencia_nombre || body.contacto_emergencia,
        emergencia_telefono: body.emergencia_telefono || body.tel_emergencia,
        capitulo: normalizarCapitulo(body.capitulo),
        capitulo_otro: body.capitulo_otro || null,
        es_directivo: body.es_directivo === true,
        cargo_directivo: body.cargo_directivo || null,
        fecha_llegada_isla: body.fecha_llegada_isla || body.fecha_llegada,
        condicion_medica: body.condicion_medica || null,
        adquiere_jersey: body.adquiere_jersey === true || body.interes_jersey === true,
        talla_jersey: body.talla_jersey || null,
        asiste_con_acompanante: body.asiste_con_acompanante === true || body.asiste_acompanante === true,
        nombre_acompanante: body.nombre_acompanante || null
    };

    next();
};

// ============================================
// ENDPOINTS DE SALUD Y DIAGNÓSTICO
// ============================================

/**
 * GET /api/health
 * Verifica el estado del servicio y conexión a BD
 * Público - No requiere autenticación
 */
router.get('/health', InscripcionController.healthCheck);
router.get('/ubicaciones/municipios', UbicacionController.buscarMunicipios);

// ============================================
// ENDPOINTS DE INSCRIPCIONES
// ============================================

/**
 * POST /api/register
 * Registra una nueva inscripción al evento
 * Público - No requiere autenticación (endpoint de registro)
 *
 * Body (JSON):
 * {
 *   "tipo_participante": "DAMA L.A.M.A.",
 *   "nombre_completo": "Juan Pérez",
 *   "documento_numero": "1234567890",
 *   "eps": "Sanitas",
 *   "emergencia_nombre": "María Pérez",
 *   "emergencia_telefono": "3001234567",
 *   "capitulo": "Barranquilla",
 *   "cargo_directivo": "Secretario Capítulo",
 *   "fecha_llegada_isla": "2026-09-12",
 *   "condicion_medica": "Ninguna",
 *   "adquiere_jersey": true,
 *   "talla_jersey": "L",
 *   "asiste_con_acompanante": false,
 *   "nombre_acompanante": null
 * }
 *
 * Responses:
 * - 201: Inscripción creada exitosamente
 * - 400: Error de validación
 * - 409: Documento duplicado
 * - 500: Error interno del servidor
 */
router.post('/register', normalizarPayloadRegistro, validateInscripcionMiddleware, InscripcionController.register);

router.post('/registro/pdf', uploadRegistroPdf, async (req, res) => {
    try {
        const archivoFoto = req.files?.fotografia?.[0] || null;
        const archivoMatricula = req.files?.matricula_moto?.[0] || null;
        const archivoLicencia = req.files?.licencia_conduccion?.[0] || null;

        if (!archivoFoto || !archivoFoto.buffer) {
            return res.status(400).json({
                success: false,
                message: 'La fotografía es obligatoria para generar el PDF'
            });
        }

        if (!archivoMatricula || !archivoMatricula.buffer) {
            return res.status(400).json({
                success: false,
                message: 'La matrícula de la moto es obligatoria'
            });
        }

        if (!archivoLicencia || !archivoLicencia.buffer) {
            return res.status(400).json({
                success: false,
                message: 'La licencia de conducción es obligatoria'
            });
        }

        const pdfBuffer = await PdfFormularioNacionalService.generarPdfFormularioNacional({
            body: req.body || {},
            fotoBuffer: archivoFoto.buffer,
            fotoNombre: archivoFoto.originalname || 'Sin archivo'
        });

        const fecha = new Date().toISOString().split('T')[0];
        const nombres = (req.body?.nombres || 'aspirante').toString().trim().replace(/\s+/g, '-');
        const apellidos = (req.body?.apellidos || '').toString().trim().replace(/\s+/g, '-');
        const nombreArchivo = `Formulario-Nacional-${nombres}${apellidos ? `-${apellidos}` : ''}-${fecha}.pdf`;

        const registroPdf = await PdfRegistroStorageService.guardarCopia({
            body: req.body || {},
            pdfBuffer,
            nombreArchivo,
            adjuntos: {
                matriculaMoto: {
                    buffer: archivoMatricula.buffer,
                    originalname: archivoMatricula.originalname,
                    mimetype: archivoMatricula.mimetype,
                    size: archivoMatricula.size
                },
                licenciaConduccion: {
                    buffer: archivoLicencia.buffer,
                    originalname: archivoLicencia.originalname,
                    mimetype: archivoLicencia.mimetype,
                    size: archivoLicencia.size
                }
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        res.setHeader('X-Registro-Pdf-Id', String(registroPdf.idRegistroPdf));
        res.setHeader('X-Registro-Pdf-Fecha', String(registroPdf.fechaRegistro));
        return res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error('Error en POST /api/registro/pdf:', error);
        return res.status(500).json({
            success: false,
            message: 'No fue posible generar el PDF del formulario',
            error: error.message
        });
    }
});

router.get('/check-documento/:documento', async (req, res) => {
    try {
        const { documento } = req.params;

        if (!documento || String(documento).trim().length < 3) {
            return res.status(400).json({
                success: false,
                existe: false,
                message: 'Documento inválido'
            });
        }

        const existente = await InscripcionModel.findByDocumento(String(documento).trim());
        const existe = Boolean(existente);

        return res.status(200).json({
            success: true,
            existe
        });
    } catch (error) {
        console.error('Error en GET /api/check-documento/:documento', error);
        return res.status(500).json({
            success: false,
            existe: false,
            message: 'Error interno al validar documento'
        });
    }
});

/**
 * GET /api/inscripciones
 * Obtiene todas las inscripciones registradas
 * PROTEGIDO - Requiere API Key en header: x-api-key
 *
 * Responses:
 * - 200: Lista de inscripciones
 * - 403: API Key inválida
 * - 500: Error interno del servidor
 */
router.get('/inscripciones', apiKeyAuth, InscripcionController.getAllInscripciones);

/**
 * GET /api/inscripciones/:documento
 * Busca una inscripción por número de documento
 * PROTEGIDO - Requiere API Key en header: x-api-key
 *
 * Params:
 * - documento: Número de documento del participante
 *
 * Responses:
 * - 200: Inscripción encontrada
 * - 403: API Key inválida
 * - 404: Inscripción no encontrada
 * - 500: Error interno del servidor
 */
router.get('/inscripciones/:documento', apiKeyAuth, InscripcionController.getByDocumento);

/**
 * GET /api/estadisticas
 * Obtiene estadísticas de las inscripciones
 * PROTEGIDO - Requiere API Key en header: x-api-key
 *
 * Responses:
 * - 200: Estadísticas generadas
 * - 403: API Key inválida
 * - 500: Error interno del servidor
 */
router.get('/estadisticas', apiKeyAuth, InscripcionController.getEstadisticas);

// ============================================
// ENDPOINTS DE TICKER (Anuncios)
// ============================================

/**
 * GET /api/ticker
 * Obtiene todos los anuncios del ticker
 * Público - No requiere autenticación
 *
 * Response:
 * {
 *   "success": true,
 *   "total": 3,
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "CUPOS LIMITADOS",
 *       "message": "Solo 150 cupos disponibles - Quedan 12 lugares",
 *       "type": "critical",
 *       "icon": "ticket",
 *       "color": "#00F5FF"
 *     },
 *     ...
 *   ]
 * }
 */
const AdminController = require('../controllers/adminController');
router.get('/ticker', AdminController.getTickerPublic);

// ============================================
// ENDPOINTS DE SERVICIOS PREMIUM
// ============================================

/**
 * GET /api/servicios
 * Obtiene todos los servicios premium disponibles
 * Público - No requiere autenticación
 *
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "nombre": "Jet Ski",
 *       "descripcion": "Experiencia emocionante en jet ski",
 *       "precio": 150000,
 *       "disponible": 1,
 *       "categoria": "actividades"
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/servicios', AdminController.getServiciosPublic);

// ============================================
// MANEJO DE RUTAS NO ENCONTRADAS (404)
// ============================================
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method
    });
});

module.exports = router;
