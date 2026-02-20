/**
 * CAPA DE VALIDACIÓN: Esquemas de validación con Joi
 * Valida los datos de inscripción antes de procesarlos
 */

const Joi = require('joi');

/**
 * Schema de validación para inscripciones
 * Define las reglas de negocio y restricciones de datos
 */
const inscripcionSchema = Joi.object({
    tipo_participante: Joi.string()
        .valid(
            'DAMA L.A.M.A.',
            'FULL COLOR MEMBER',
            'ROCKET PROSPECT',
            'PROSPECT',
            'ESPOSA (a)',
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
        .pattern(/^[0-9A-Z\-]+$/)
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
        .pattern(/^[\d\s\+\-\(\)]+$/)
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
        .min('2026-09-10')
        .max('2026-09-15')
        .required()
        .messages({
            'any.required': 'La fecha de llegada es obligatoria',
            'date.min': 'La fecha de llegada debe ser entre el 10 y 15 de septiembre de 2026',
            'date.max': 'La fecha de llegada debe ser entre el 10 y 15 de septiembre de 2026'
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

/**
 * Valida los datos de inscripción
 * @param {Object} data - Datos a validar
 * @returns {Object} Resultado de la validación { error, value }
 */
const validateInscripcion = (data) => {
    return inscripcionSchema.validate(data, {
        abortEarly: false, // Retorna todos los errores, no solo el primero
        stripUnknown: true // Remueve campos no definidos en el schema
    });
};

/**
 * Middleware de Express para validar inscripciones
 * Retorna 400 con los errores de validación si falla
 */
const validateInscripcionMiddleware = (req, res, next) => {
    const { error, value } = validateInscripcion(req.body);

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

    // Reemplaza req.body con los datos validados y sanitizados
    req.body = value;
    next();
};

module.exports = {
    inscripcionSchema,
    validateInscripcion,
    validateInscripcionMiddleware
};
