/**
 * CAPA DE VALIDACIÓN: Esquema de validación con Joi para el registro real
 * del V Campeonato (POST /eventos/vnorte-2026/registro).
 *
 * Los nombres de campo y valores permitidos aquí deben coincidir exactamente
 * con lo que envía src/views/registro-campeonato.ejs y con el catálogo
 * global de países/capítulos (src/data/paisesCapitulos.js) - no con la
 * edición anterior del evento en San Andrés.
 */

const Joi = require('joi');
const { PAISES_CAPITULOS, esParPaisCapituloValido } = require('../data/paisesCapitulos');

const acompananteSchema = Joi.object({
    nombre: Joi.string().min(3).max(200).trim().required().messages({
        'any.required': 'Acompañante: el nombre es obligatorio',
        'string.min': 'Acompañante: el nombre debe tener al menos 3 caracteres'
    }),
    documento: Joi.string().min(3).max(30).trim().required().messages({
        'any.required': 'Acompañante: el documento es obligatorio'
    }),
    telefono: Joi.string().min(7).max(50).trim().required().messages({
        'any.required': 'Acompañante: el teléfono es obligatorio'
    }),
    jersey: Joi.boolean().default(false),
    talla: Joi.string()
        .valid('S', 'M', 'L', 'XL', '2XL')
        .allow(null, '')
        .when('jersey', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            'any.required': 'Acompañante: si adquiere jersey, debe indicar la talla',
            'any.only': 'Acompañante: la talla debe ser S, M, L, XL o 2XL'
        })
});

const inscripcionSchema = Joi.object({
    categoria: Joi.string()
        .valid(
            'MIEMBRO FULL COLOR (FCM)',
            'PROSPECTO (P)',
            'ASOCIADO (A) (ASC)',
            'MIEMBRO HONORARIO (HNR)',
            'MIEMBRO RETIRADO (RTR)',
            'HIJO (A) (H)',
            'INVITADO (A) (I)',
            'ESPOSA (O)',
            'DAMA L.A.M.A. - FULL COLOR (FCM)',
            'DAMA L.A.M.A. - PROSPECTO (P)'
        )
        .required()
        .messages({
            'any.required': 'La categoría es obligatoria',
            'any.only': 'Debe seleccionar una categoría válida'
        }),

    vehiculo: Joi.string()
        .valid('MOTO (M)', 'CARRO (C)', 'AVIÓN (A)')
        .required()
        .messages({
            'any.required': 'Debe indicar en qué tipo de vehículo asiste',
            'any.only': 'Debe seleccionar Moto, Carro o Avión'
        }),

    nombre: Joi.string().min(3).max(200).trim().required().messages({
        'any.required': 'El nombre es obligatorio',
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'string.max': 'El nombre no puede exceder 200 caracteres'
    }),

    documento: Joi.string()
        .pattern(/^[0-9A-Za-z-]+$/)
        .min(6)
        .max(30)
        .trim()
        .required()
        .messages({
            'any.required': 'El documento es obligatorio',
            'string.pattern.base': 'El documento solo puede contener números, letras y guiones',
            'string.min': 'El documento debe tener al menos 6 caracteres'
        }),

    eps: Joi.string().min(3).max(100).trim().required().messages({
        'any.required': 'La EPS es obligatoria',
        'string.min': 'La EPS debe tener al menos 3 caracteres'
    }),

    email: Joi.string().email({ tlds: false }).max(150).trim().required().messages({
        'any.required': 'El correo electrónico es obligatorio',
        'string.email': 'El correo electrónico no es válido'
    }),

    fecha_nacimiento: Joi.date().max('now').required().messages({
        'any.required': 'La fecha de nacimiento es obligatoria',
        'date.max': 'La fecha de nacimiento no puede ser futura',
        'date.base': 'La fecha de nacimiento no es válida'
    }),

    emergencia_nombre: Joi.string().min(3).max(200).trim().required().messages({
        'any.required': 'El contacto de emergencia es obligatorio',
        'string.min': 'El contacto debe tener al menos 3 caracteres'
    }),

    emergencia_telefono: Joi.string()
        .pattern(/^[\d\s+()-]+$/)
        .min(7)
        .max(50)
        .trim()
        .required()
        .messages({
            'any.required': 'El teléfono de emergencia es obligatorio',
            'string.pattern.base': 'El teléfono debe ser un número válido',
            'string.min': 'El teléfono debe tener al menos 7 dígitos'
        }),

    pais: Joi.string()
        .valid(...Object.keys(PAISES_CAPITULOS))
        .required()
        .messages({
            'any.required': 'El país es obligatorio',
            'any.only': 'Debe seleccionar un país válido del catálogo L.A.M.A.'
        }),

    capitulo: Joi.string().trim().required().messages({
        'any.required': 'El capítulo es obligatorio'
    }),

    directivo: Joi.string().valid('Sí', 'No').required().messages({
        'any.required': 'Debe indicar si es directivo',
        'any.only': 'Directivo debe ser "Sí" o "No"'
    }),

    ambito: Joi.string()
        .valid('Capítulo', 'Región', 'País', 'Continente', 'Internacional')
        .when('directivo', {
            is: 'Sí',
            then: Joi.required(),
            otherwise: Joi.optional().allow(null, '')
        })
        .messages({
            'any.required': 'Debe seleccionar el ámbito del cargo directivo',
            'any.only': 'Ámbito no válido'
        }),

    cargo: Joi.string()
        .valid(
            'Presidente',
            'Vicepresidente',
            'Tesorero',
            'Secretario',
            'Gerente de Negocios',
            'MTO',
            'Sargento de Armas',
            'Road Captain'
        )
        .when('directivo', {
            is: 'Sí',
            then: Joi.required(),
            otherwise: Joi.optional().allow(null, '')
        })
        .messages({
            'any.required': 'Debe seleccionar el cargo directivo',
            'any.only': 'Cargo no válido'
        }),

    // El rango valido (min/max) depende de las fechas del evento al que se
    // registra, no es fijo - se valida dinamicamente en el controller
    // (eventController.registerToEvent) contra evento.fecha/fechaFin, ya
    // que este schema es compartido por cualquier evento.
    fecha_llegada: Joi.date()
        .required()
        .messages({
            'any.required': 'La fecha de llegada es obligatoria'
        }),

    condicion_medica: Joi.string().max(1000).trim().allow(null, '').optional().messages({
        'string.max': 'La condición médica no puede exceder 1000 caracteres'
    }),

    jersey: Joi.boolean().required().messages({
        'any.required': 'Debe indicar si adquiere el jersey'
    }),

    talla: Joi.string()
        .valid('S', 'M', 'L', 'XL', '2XL')
        .allow(null, '')
        .when('jersey', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            'any.required': 'Si adquiere jersey, debe especificar la talla',
            'any.only': 'La talla debe ser S, M, L, XL o 2XL'
        }),

    acompanante: Joi.boolean().required().messages({
        'any.required': 'Debe indicar si asiste con acompañante'
    }),

    acompanantes: Joi.array()
        .items(acompananteSchema)
        .when('acompanante', {
            is: true,
            then: Joi.array().min(1).required(),
            otherwise: Joi.optional()
        })
        .messages({
            'array.min': 'Debe registrar al menos un acompañante'
        })
})
    .custom((value, helpers) => {
        if (!esParPaisCapituloValido(value.pais, value.capitulo)) {
            return helpers.error('any.invalid', { message: 'El capítulo seleccionado no pertenece al país indicado' });
        }
        return value;
    })
    .messages({
        'any.invalid': 'El país y/o capítulo L.A.M.A. seleccionado no es válido'
    });

/**
 * Valida los datos ya normalizados (booleans y arrays reales, no strings de
 * FormData) de una inscripción.
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de la validación { error, value }
 */
const validateInscripcion = (data) => {
    return inscripcionSchema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });
};

/**
 * Esquema LEGACY: usado únicamente por el endpoint público sin autenticación
 * POST /api/register (src/routes/apiRoutes.js), que antecede al formulario
 * actual y normaliza a este mismo shape antiguo (fecha_llegada_isla,
 * es_directivo, cargo_directivo, capitulo restringido a Colombia). No se
 * toca aquí para no romper ese endpoint; ver nota en apiRoutes.js sobre por
 * qué convendría revisar si sigue siendo necesario.
 */
const inscripcionSchemaLegacy = Joi.object({
    tipo_participante: Joi.string()
        .valid(
            'DAMA L.A.M.A.',
            'FULL COLOR MEMBER',
            'ROCKET PROSPECT',
            'PROSPECT',
            'ESPOSA (o)',
            'CONYUGUE',
            'PAREJA',
            'HIJA (o)',
            'INVITADA (O)'
        )
        .required()
        .messages({
            'any.required': 'El tipo de participante es obligatorio',
            'any.only': 'Debe seleccionar un tipo de participante válido'
        }),

    nombre_completo: Joi.string()
        .min(3)
        .max(200)
        .trim()
        .required()
        .messages({
            'any.required': 'El nombre es obligatorio',
            'string.min': 'El nombre debe tener al menos 3 caracteres',
            'string.max': 'El nombre no puede exceder 200 caracteres'
        }),

    documento_numero: Joi.string()
        .pattern(/^[0-9A-Z-]+$/)
        .min(6)
        .max(30)
        .trim()
        .required()
        .messages({
            'any.required': 'El documento es obligatorio',
            'string.pattern.base': 'El documento solo puede contener números, letras y guiones',
            'string.min': 'El documento debe tener al menos 6 caracteres'
        }),

    eps: Joi.string()
        .min(3)
        .max(100)
        .trim()
        .required()
        .messages({
            'any.required': 'La EPS es obligatoria',
            'string.min': 'La EPS debe tener al menos 3 caracteres'
        }),

    emergencia_nombre: Joi.string()
        .min(3)
        .max(200)
        .trim()
        .required()
        .messages({
            'any.required': 'El contacto de emergencia es obligatorio',
            'string.min': 'El contacto debe tener al menos 3 caracteres'
        }),

    emergencia_telefono: Joi.string()
        .pattern(/^[\d\s+\-()]+$/)
        .min(7)
        .max(50)
        .trim()
        .required()
        .messages({
            'any.required': 'El teléfono de emergencia es obligatorio',
            'string.pattern.base': 'El teléfono debe ser un número válido',
            'string.min': 'El teléfono debe tener al menos 7 dígitos'
        }),

    capitulo: Joi.string()
        .valid(
            'Barranquilla',
            'Bucaramanga',
            'Cartagena',
            'Cúcuta',
            'Floridablanca',
            'Medellín',
            'Puerto Colombia',
            'Valle Aburrá',
            'Zenu',
            'Otros'
        )
        .required()
        .messages({
            'any.required': 'El capítulo es obligatorio',
            'any.only': 'Debe seleccionar un capítulo válido'
        }),

    capitulo_otro: Joi.string()
        .max(100)
        .trim()
        .when('capitulo', {
            is: 'Otros',
            then: Joi.required(),
            otherwise: Joi.optional().allow(null, '')
        })
        .messages({
            'any.required': 'Debe especificar el nombre del capítulo'
        }),

    es_directivo: Joi.boolean()
        .optional()
        .default(false),

    cargo_directivo: Joi.string()
        .valid(
            'Presidente Capítulo',
            'Vice Presidente Capítulo',
            'Secretario Capítulo',
            'Gerente de Negocios Capítulo',
            'Tesorero Capítulo',
            'MTO Capítulo',
            'Sargento de Armas Capítulo',
            'Presidente Región',
            'Vice Presidente Región',
            'Secretario Región',
            'Gerente de Negocios Región',
            'Tesorero Región',
            'MTO Región',
            'Sargento de Armas Región',
            'Presidente País',
            'Vice Presidente País',
            'Secretario País',
            'Gerente de Negocios País',
            'Tesorero País',
            'MTO País',
            'Sargento de Armas País',
            'Presidente Continente',
            'Vice Presidente Continente',
            'Secretario Continente',
            'Gerente de Negocios Continente',
            'Tesorero Continente',
            'MTO Continente',
            'Sargento de Armas Continente',
            'Presidente Internacional',
            'Vice Presidente Internacional',
            'Secretario Internacional',
            'Gerente de Negocios Internacional',
            'Tesorero Internacional',
            'MTO Internacional',
            'Sargento de Armas Internacional'
        )
        .when('es_directivo', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional().allow(null, '')
        })
        .messages({
            'any.required': 'Debe seleccionar un cargo directivo',
            'any.only': 'Debe seleccionar un cargo válido'
        }),

    fecha_llegada_isla: Joi.date()
        .required()
        .messages({
            'any.required': 'La fecha de llegada es obligatoria'
        }),

    condicion_medica: Joi.string()
        .max(1000)
        .trim()
        .allow(null, '')
        .optional()
        .messages({
            'string.max': 'La condición médica no puede exceder 1000 caracteres'
        }),

    adquiere_jersey: Joi.boolean()
        .required()
        .messages({
            'any.required': 'Debe indicar si adquiere el jersey'
        }),

    talla_jersey: Joi.string()
        .valid('S', 'M', 'L', 'XL', '2XL', '3XL')
        .allow(null, '')
        .when('adquiere_jersey', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            'any.required': 'Si adquiere jersey, debe especificar la talla',
            'any.only': 'La talla debe ser: S, M, L, XL, 2XL o 3XL'
        }),

    asiste_con_acompanante: Joi.boolean()
        .required()
        .messages({
            'any.required': 'Debe indicar si asiste con acompañante'
        }),

    nombre_acompanante: Joi.string()
        .min(3)
        .max(200)
        .trim()
        .when('asiste_con_acompanante', {
            is: true,
            then: Joi.required(),
            otherwise: Joi.optional().allow(null, '')
        })
        .messages({
            'any.required': 'Si asiste con acompañante, debe especificar el nombre',
            'string.min': 'El nombre del acompañante debe tener al menos 3 caracteres'
        })
});

const validateInscripcionMiddleware = (req, res, next) => {
    const { error, value } = inscripcionSchemaLegacy.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }));

        return res.status(400).json({
            success: false,
            message: 'Errores de validación en los datos enviados',
            errors
        });
    }

    req.body = value;
    next();
};

module.exports = {
    inscripcionSchema,
    validateInscripcion,
    inscripcionSchemaLegacy,
    validateInscripcionMiddleware
};
