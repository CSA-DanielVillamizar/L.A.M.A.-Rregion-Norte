/**
 * CAPA DE DOMINIO: Servicio principal
 * Contiene la lógica de negocio para las operaciones principales
 */

const formularioService = require('./formularioService');

/**
 * Obtiene los datos para la página principal
 * @returns {Object} Datos estructurados para la vista home
 */
exports.getHomeData = () => {
    return {
        hero: {
            title: 'HARDCORE',
            subtitle: 'Tropical',
            tagline: 'DEL ASFALTO AL ARRECIFE',
            description: 'Una fusión agresiva donde la rudeza del cuero se encuentra con el lujo del Caribe.',
            eventDate: 'SEPT 12-13, 2026',
            location: 'SAN ANDRÉS ISLAS'
        },
        features: [
            {
                icon: '<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
                title: 'ADRENALINA',
                description: 'Competencia de Jet Skis y rutas extremas'
            },
            {
                icon: '<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>',
                title: 'PARAÍSO',
                description: 'Experiencia en el Caribe colombiano'
            },
            {
                icon: '<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>',
                title: 'LUJO',
                description: 'Hotelería y eventos VIP Clase 2'
            }
        ],
        stats: {
            miembros: '250+',
            eventos: '11',
            capitulos: '9'
        }
    };
};

/**
 * Obtiene información del club L.A.M.A.
 * @returns {Object} Datos del club
 */
exports.getClubData = () => {
    return {
        nombre: 'L.A.M.A.',
        nombreCompleto: 'Latin American Motorcycle Association',
        fundacion: '2010',
        mision: 'Integrar a la comunidad biker latinoamericana con liderazgo, disciplina organizacional y hermandad, promoviendo una cultura de conducción responsable en cada capítulo.',
        vision: 'Consolidar a L.A.M.A. como la red de mototurismo referente en Latinoamérica por su excelencia operativa, impacto social y proyección internacional.',
        valores: [
            'Hermandad',
            'Disciplina',
            'Respeto',
            'Aventura',
            'Excelencia'
        ],
        regiones: [
            {
                nombre: 'Región Norte',
                descripcion: 'Cobertura del Caribe colombiano y zona norte del país.'
            },
            {
                nombre: 'Región Centro',
                descripcion: 'Integración de capítulos del eje central y principales capitales.'
            },
            {
                nombre: 'Región Sur',
                descripcion: 'Representación de capítulos del sur con rutas de alta montaña.'
            },
            {
                nombre: 'Región Internacional',
                descripcion: 'Conexión con capítulos y delegaciones fuera de Colombia.'
            }
        ]
    };
};

/**
 * Procesa una solicitud de contacto
 * @param {Object} contactData - Datos del formulario de contacto
 * @returns {Boolean} Éxito de la operación
 */
exports.processContact = async (contactData) => {
    const resultado = await formularioService.registrarContacto({
        nombre: contactData.nombre,
        email: contactData.email,
        mensaje: contactData.mensaje,
        origen: 'contacto_web'
    });

    if (!resultado.success) {
        throw new Error(resultado.message || 'No fue posible guardar el contacto');
    }

    return true;
};
