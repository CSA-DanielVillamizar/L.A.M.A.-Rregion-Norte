/**
 * Servidor DEMO - Sin base de datos para visualizar el diseño
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesiones
app.use(session({
    secret: 'lama-secret-key-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// ============================================
// RUTAS DEMO
// ============================================

// Home
app.get('/', (req, res) => {
    res.render('home', {
        title: 'V Campeonato Regional',
        hero: {
            title: 'V CAMPEONATO REGIONAL',
            subtitle: 'San Andrés | 12-13 Septiembre 2026',
            tagline: 'HARDCORE TROPICAL',
            description: 'La hermandad motera más legendaria del Caribe colombiano te invita a vivir la experiencia definitiva',
            eventDate: '12-13 SEPTIEMBRE 2026',
            location: 'SAN ANDRÉS ISLA'
        },
        features: [
            {
                icon: '<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
                title: 'Mototurismo',
                description: 'Rutas épicas por la isla caribeña'
            },
            {
                icon: '<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>',
                title: 'Jet Ski',
                description: 'Adrenalina en aguas cristalinas'
            },
            {
                icon: '<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>',
                title: 'Hardcore Tropical',
                description: 'La mejor fiesta motera del Caribe'
            }
        ],
        stats: {
            miembros: '200+',
            eventos: '11',
            capitulos: '9'
        }
    });
});

// Registro
app.get('/registro', (req, res) => {
    res.render('registro', {
        title: 'Registro V Campeonato',
        precioBase: 150000,
        precioJersey: 70000
    });
});

// Inscripción al V Campeonato Regional
app.get('/registro-campeonato', (req, res) => {
    res.render('registro-campeonato', {
        title: 'Inscripción V Campeonato Regional'
    });
});

/**
 * Obtiene la lista de eventos demo con estructura completa.
 * @returns {Array<Object>} Listado de eventos con fechas, costos y disponibilidad.
 */
function obtenerEventosDemo() {
    return [
        {
            id: 'vnorte-2026',
            nombre: 'V Campeonato Región Norte',
            fecha: '2026-09-12',
            fechaFin: '2026-09-13',
            ubicacion: 'San Andrés Islas, Colombia',
            hotel: 'Mangrove Bay Hotel San Andres Islas',
            descripcion: 'La Gran Regata L.A.M.A. - Evento cumbre de la región norte con competencia de Jet Ski, rodadas náuticas y terrestres, gala de integración y premiación regional.',
            capacidad: 150,
            registrados: 0,
            precio: 150000,
            imagen: '/images/events/vnorte-2026.jpg',
            destacado: true,
            paqueteOficial: {
                titulo: 'PAQUETE OFICIAL "V CAMPEONATO"',
                valor: 150000,
                moneda: 'COP',
                incluye: [
                    'Kit Oficial (Camiseta, Gorra, Parche Conmemorativo V Edición)',
                    'Acceso a todas las actividades del evento',
                    'Credencial All Access',
                    'Brazalete identificador'
                ]
            },
            costos_adicionales: [
                {
                    categoria: 'Traslados Aeropuerto',
                    items: [
                        { descripcion: 'Traslado Aeropuerto - Hotel - Aeropuerto en taxi', valor: 40000, moneda: 'COP' }
                    ]
                },
                {
                    categoria: 'Vehículos Náuticos',
                    items: [
                        { descripcion: 'Cupo en Jet Ski (2 personas)', valor: 400000, moneda: 'COP', unidad: 'por hora' },
                        { descripcion: 'Lancha de lujo y/o Pontón (9 am a 5 pm)', valor: 80000, moneda: 'COP', unidad: 'por persona' },
                        { descripcion: 'Regata de Veleros por el mar de 7 Colores', valor: 100000, moneda: 'COP', unidad: 'por persona' }
                    ]
                },
                {
                    categoria: 'Vehículos Terrestres',
                    items: [
                        { descripcion: 'Cupo en Mula (Golf Cart) para vuelta a la isla (9 am a 6 pm)', valor: 250000, moneda: 'COP', unidad: 'por 5 personas' },
                        { descripcion: 'Cupo en Chiva', valor: 50000, moneda: 'COP', unidad: 'por persona (3 horas)' },
                        { descripcion: 'Tour Burro', valor: 140000, moneda: 'COP', unidad: 'por persona (2 horas)' }
                    ]
                }
            ],
            contactos: [
                { tipo: 'WhatsApp Oficial Región Norte', valor: '+57 310 632 81 71' },
                { tipo: 'WhatsApp Alterno', valor: '+57 317 7524965' },
                { tipo: 'Correo Electrónico', valor: 'Comiteregionnortelamacolombia@gmail.com' }
            ],
            recomendaciones: [
                'Llevar careta para Snorkel',
                'Llevar Zapatos de playa',
                'Llevar bolsa para proteger celular',
                'Llevar Toalla',
                'Llevar protector solar',
                'Llevar gorra',
                'Llevar lentes de sol',
                'Llevar vestuario blanco para noche de gala'
            ],
            agenda: [
                {
                    dia: 1,
                    fecha: '2026-09-12',
                    titulo: 'LA GRAN REGATA L.A.M.A.',
                    actividades: [
                        {
                            hora: '08:00 AM',
                            titulo: 'Aterrizaje y Recepción Isleña',
                            lugar: 'Aeropuerto Internacional Gustavo Rojas Pinilla',
                            detalles: 'Bienvenida oficial a las delegaciones nacionales e internacionales. Traslado en "Servicio de Taxi" hacia el Hotel Sede.',
                            costo: 40000,
                            nota: 'Por cuenta de participante'
                        },
                        {
                            hora: '09:00 AM',
                            titulo: 'Check-in y Entrega de Kits',
                            lugar: 'Hotel Sede (Zona Rosa / Acceso a Playa)',
                            detalles: 'Entrega de credenciales, camiseta oficial "V Campeonato", gorra náutica y brazalete All Access.',
                            incluido: true
                        },
                        {
                            hora: '12:00 PM',
                            titulo: 'Almuerzo Típico: "Sazón Raizal"',
                            detalles: 'Auténtico Rondón o Pescado Frito para cargar energías antes de la acción.',
                            nota: 'Por cuenta de cada miembro'
                        },
                        {
                            hora: '01:30 PM',
                            titulo: 'FORMACIÓN DE LA ESCUADRA NAVAL (Evento Central)',
                            lugar: 'Muelle Portofino / Marina Tonino',
                            detalles: 'Briefing de Seguridad: Charla técnica obligatoria por parte de la Capitanía de Puerto (equivalente a la charla de seguridad vial).',
                            obligatorio: true
                        },
                        {
                            hora: '02:00 PM',
                            titulo: 'INICIO DEL CAMPEONATO NÁUTICO',
                            detalles: 'Pilotos y Copilotos: Abordaje de Jet Skis (Motos de Agua) organizados en formación Delta sobre el mar. Acompañantes y Familiares: Abordaje de Fragatas y Pontones de Lujo con música y bandera L.A.M.A. Ruta: Bahía de San Andrés → Manglares Old Point → Avistamiento de Mantarrayas → Parada técnica en "El Acuario".',
                            nota: 'Consultar valor en lista de costos adicionales',
                            subruta: [
                                'Bahía de San Andrés',
                                'Manglares Old Point',
                                'Avistamiento de Mantarrayas',
                                'El Acuario'
                            ]
                        },
                        {
                            hora: '04:30 PM',
                            titulo: 'Desembarco en Playa Privada / Johnny Cay',
                            detalles: 'Juegos de Campeonato (Puntos para los Capítulos): Competencia de relevos en agua, Fuerza de cuerdas en la arena, Voleibol L.A.M.A. Hidratación y Coco Loko incluidos.',
                            incluido: true
                        },
                        {
                            hora: '08:00 PM',
                            titulo: 'CENA DE GALA: "NOCHE BLANCA"',
                            codigoVestuario: 'Ropa blanca',
                            detalles: 'Cena buffet caribeña, show de bailes típicos (Reggae, Calypso, Soca) y fiesta de integración.',
                            nota: 'Por cuenta de cada miembro'
                        }
                    ]
                },
                {
                    dia: 2,
                    fecha: '2026-09-13',
                    titulo: 'VUELTA A LA ISLA',
                    actividades: [
                        {
                            hora: '05:00 AM',
                            titulo: 'Vista de Amanecer',
                            lugar: 'Chamey Nautica'
                        },
                        {
                            hora: '05:30 AM',
                            titulo: 'Regata de Veleros por el mar de 7 Colores',
                            costo: 100000,
                            unidad: 'por persona'
                        },
                        {
                            hora: '06:30 AM',
                            titulo: 'Snorkel',
                            detalles: 'Vista de tiburones, mantarrayas, etc.'
                        },
                        {
                            hora: '09:00 AM',
                            titulo: 'Desayuno Costeño',
                            nota: 'Por cuenta de cada miembro'
                        },
                        {
                            hora: '10:00 AM',
                            titulo: 'Caravana Terrestre en "Mulas" o Chiva',
                            detalles: 'Reemplazamos nuestras motos por una caravana de Carritos de Golf (Mulas) decorados con las banderas de cada capítulo. Ruta Turística: Cueva de Morgan → La Piscinita → Hoyo Soplador → West View. Entrada con valor adicional. Foto Oficial: Letrero "I LOVE SAI" con todos los asistentes.',
                            nota: 'Consultar valor en lista de costos adicionales',
                            subruta: [
                                'Cueva de Morgan',
                                'La Piscinita',
                                'Hoyo Soplador',
                                'West View',
                                'Foto Oficial "I LOVE SAI"'
                            ]
                        },
                        {
                            hora: '12:30 PM',
                            titulo: 'ALMUERZO DE CLAUSURA Y PREMIACIÓN',
                            lugar: 'Restaurante de Playa (San Luis / Sound Bay)',
                            detalles: 'Entrega de trofeos y reconocimientos: • Campeón de los Juegos Playeros, • Capítulo con mayor asistencia, • Mención Honorífica al "Motero de Ultramar" (Asistente más lejano).',
                            nota: 'Por cuenta de cada miembro'
                        },
                        {
                            hora: '03:00 PM',
                            titulo: 'Tarde Libre - Retorno y Despedida',
                            detalles: 'Traslado final al aeropuerto y cierre del evento.',
                            nota: 'Por cuenta de cada miembro'
                        }
                    ]
                }
            ],
            disponibilidad: 150,
            moneda: 'COP'
        },
        {
            id: 'aniversario-barranquilla-2026',
            nombre: 'Aniversario L.A.M.A Barranquilla',
            fecha: '2026-02-05',
            fechaFin: '2026-02-07',
            ubicacion: 'Barranquilla, Atlántico',
            precio: 125000,
            moneda: 'COP',
            capacidad: 220,
            registrados: 90,
            disponibilidad: 130,
            porcentajeOcupacion: 41,
            descripcion: 'Encuentro regional con rodada urbana, integración y cena oficial de aniversario.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'aniversario-bucaramanga-2026',
            nombre: 'Aniversario L.A.M.A Bucaramanga',
            fecha: '2026-03-21',
            fechaFin: '2026-03-23',
            ubicacion: 'San Martín, Cesar',
            precio: null,
            moneda: 'COP',
            capacidad: 200,
            registrados: 0,
            disponibilidad: 200,
            porcentajeOcupacion: 0,
            descripcion: 'Celebración oficial con ruta y actividades en el Cesar. Precio por definir.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'rally-internacional-2026',
            nombre: 'XXIX Rally Internacional',
            fecha: '2026-04-22',
            fechaFin: '2026-04-29',
            ubicacion: 'El Salvador',
            precio: 40,
            moneda: 'USD',
            capacidad: 250,
            registrados: 80,
            disponibilidad: 170,
            porcentajeOcupacion: 32,
            descripcion: 'Rally internacional con rutas escénicas y actividades oficiales en El Salvador.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'aniversario-medellin-2026',
            nombre: 'Aniversario L.A.M.A Medellín',
            fecha: '2026-06-19',
            fechaFin: '2026-06-21',
            ubicacion: 'Sabaneta, Antioquia',
            precio: null,
            moneda: 'COP',
            capacidad: 220,
            registrados: 0,
            disponibilidad: 220,
            porcentajeOcupacion: 0,
            descripcion: 'Aniversario oficial con rodada en el Valle de Aburrá. Precio por definir.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'aniversario-valle-aburra-2026',
            nombre: 'Aniversario L.A.M.A Valle de Aburrá',
            fecha: '2026-07-18',
            fechaFin: '2026-07-20',
            ubicacion: 'Medellín, Antioquia',
            precio: null,
            moneda: 'COP',
            capacidad: 220,
            registrados: 0,
            disponibilidad: 220,
            porcentajeOcupacion: 0,
            descripcion: 'Evento regional con actividades oficiales y convivencia. Precio por definir.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'xii-rally-nacional-2026',
            nombre: 'XII Rally Nacional Colombia',
            fecha: '2026-08-14',
            fechaFin: '2026-08-16',
            ubicacion: 'Villavicencio, Meta',
            precio: null,
            moneda: 'COP',
            capacidad: 300,
            registrados: 0,
            disponibilidad: 300,
            porcentajeOcupacion: 0,
            descripcion: 'Rally nacional con recorrido principal y actividades oficiales. Precio por definir.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'xii-rally-suramericano-2026',
            nombre: 'VII Rally Suramericano',
            fecha: '2026-09-30',
            fechaFin: '2026-10-04',
            ubicacion: 'Valparaíso, Chile',
            precio: null,
            moneda: 'USD',
            capacidad: 350,
            registrados: 0,
            disponibilidad: 350,
            porcentajeOcupacion: 0,
            descripcion: 'Rally continental con delegaciones internacionales. Precio por definir.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'aniversario-cucuta-2026',
            nombre: 'Aniversario L.A.M.A Cúcuta',
            fecha: '2026-10-24',
            fechaFin: '2026-10-25',
            ubicacion: 'Cúcuta, Norte de Santander',
            precio: null,
            moneda: 'COP',
            capacidad: 200,
            registrados: 0,
            disponibilidad: 200,
            porcentajeOcupacion: 0,
            descripcion: 'Encuentro oficial de aniversario con actividades regionales. Precio por definir.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'aniversario-floridablanca-2026',
            nombre: 'Aniversario L.A.M.A Floridablanca',
            fecha: '2026-10-30',
            fechaFin: '2026-10-30',
            ubicacion: 'Bucaramanga, Santander',
            precio: null,
            moneda: 'COP',
            capacidad: 180,
            registrados: 0,
            disponibilidad: 180,
            porcentajeOcupacion: 0,
            descripcion: 'Celebración oficial con rodada y agenda local. Precio por definir.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'aniversario-cartagena-2026',
            nombre: 'Aniversario L.A.M.A Cartagena',
            fecha: '2026-11-13',
            fechaFin: '2026-11-14',
            ubicacion: 'Cartagena, Bolívar',
            precio: null,
            moneda: 'COP',
            capacidad: 200,
            registrados: 0,
            disponibilidad: 200,
            porcentajeOcupacion: 0,
            descripcion: 'Evento de aniversario con actividades costeras y ceremonia oficial. Precio por definir.',
            destacado: false,
            lleno: false,
            agenda: []
        },
        {
            id: 'aniversario-puerto-colombia-2026',
            nombre: 'Aniversario L.A.M.A Puerto Colombia',
            fecha: '2026-11-15',
            fechaFin: '2026-11-16',
            ubicacion: 'Puerto Colombia, Atlántico',
            precio: null,
            moneda: 'COP',
            capacidad: 180,
            registrados: 0,
            disponibilidad: 180,
            porcentajeOcupacion: 0,
            descripcion: 'Encuentro de aniversario con rodada costera. Precio por definir.',
            destacado: false,
            lleno: false,
            agenda: []
        }
    ];
}

// Eventos
app.get('/eventos', (req, res) => {
    const events = obtenerEventosDemo();

    res.render('events/list', {
        title: 'Eventos L.A.M.A.',
        events
    });
});

// Detalle de evento
app.get('/eventos/:id', (req, res) => {
    const events = obtenerEventosDemo();

    const event = events.find((item) => item.id === req.params.id);

    if (!event) {
        return res.status(404).render('404', {
            title: 'Evento no encontrado',
            message: 'El evento que buscas no existe'
        });
    }

    res.render('events/detail', {
        title: event.nombre,
        event
    });
});

// Registro de evento (demo)
app.post('/eventos/:id/registro', (req, res) => {
    const confirmationCode = Math.floor(100000 + Math.random() * 900000);
    res.json({
        success: true,
        message: 'Registro recibido exitosamente',
        confirmationCode
    });
});

// Capítulos
app.get('/capitulos', (req, res) => {
    res.render('capitulos', {
        title: 'Nuestros Capítulos',
        description: '9 Capítulos Oficiales en Colombia'
    });
});

// Club
app.get('/club', (req, res) => {
    res.render('club', {
        title: 'Sobre Nosotros',
        nombre: 'L.A.M.A.',
        nombreCompleto: 'LATIN AMERICAN MOTORCYCLE ASSOCIATION',
        fundacion: '2010',
        mision: 'Impulsar una cultura de motociclismo apasionada, segura y responsable en toda Latinoamérica.',
        vision: 'Consolidarnos como la organización referente y la voz autorizada del motociclismo en la región.',
        valores: [
            'Hermandad',
            'Respeto',
            'Pasión',
            'Seguridad',
            'Solidaridad'
        ],
        regiones: [
            { nombre: 'Región Norte', descripcion: 'Capítulos de la Costa Caribe' },
            { nombre: 'Región Centro', descripcion: 'Capítulos del interior' },
            { nombre: 'Región Sur', descripcion: 'Capítulos del sur del país' },
            { nombre: 'Región Internacional', descripcion: 'Capítulos fuera de Colombia' }
        ]
    });
});

// Contacto
app.get('/contacto', (req, res) => {
    res.render('contact', {
        title: 'Contacto',
        success: false,
        error: false
    });
});

// Itinerario - Ruta del Campeonato
app.get('/itinerario', (req, res) => {
    res.render('itinerario', {
        title: 'Itinerario - Ruta del V Campeonato',
        description: 'Conoce la ruta completa del V Campeonato Regional en San Andrés'
    });
});

// ==================== ADMINISTRACIÓN ====================

// Middleware para verificar autenticación
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/admin/login');
}

// Login - Página
app.get('/admin/login', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/admin/dashboard');
    }
    res.render('admin/login', {
        title: 'Login - Admin',
        error: null
    });
});

// Login - Procesar
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    // Credenciales (en producción usar BD y hash)
    const ADMIN_USER = 'admin';
    const ADMIN_PASS = 'lama2026';
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.userId = username;
        req.session.username = username;
        return res.redirect('/admin/dashboard');
    }
    
    res.render('admin/login', {
        title: 'Login - Admin',
        error: 'Usuario o contraseña incorrectos'
    });
});

// Logout
app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// Dashboard Admin (con autenticación)
app.get('/admin/dashboard', requireAuth, (req, res) => {
    res.render('admin/dashboard', {
        title: 'Panel de Administración',
        user: { username: req.session.username },
        inscripciones: [
            {
                id_inscripcion: 1,
                nombre_completo: 'Juan Pérez',
                documento_numero: '1234567890',
                tipo_participante: 'DAMA L.A.M.A. FULL COLOR MEMBER',
                capitulo: 'Barranquilla',
                valor_total_pagar: 190000,
                servicios_adicionales: '[{"servicio":"jet-ski","precio":400000},{"servicio":"lancha-lujo","precio":80000}]',
                estado_validacion: 'Pendiente'
            },
            {
                id_inscripcion: 2,
                nombre_completo: 'María García',
                documento_numero: '9876543210',
                tipo_participante: 'DAMA L.A.M.A. FULL COLOR MEMBER',
                capitulo: 'Cartagena',
                valor_total_pagar: 150000,
                servicios_adicionales: '[]',
                estado_validacion: 'Aprobado'
            }
        ],
        stats: {
            total_inscripciones: 2,
            pagos_confirmados: 1,
            pagos_pendientes: 1,
            total_recaudado: 310000,
            total_jerseys: 1,
            total_acompanantes: 1,
            servicios_premium: {
                jet_ski: { cantidad: 1, total: 400000 },
                lancha_lujo: { cantidad: 1, total: 80000 },
                regata_veleros: { cantidad: 0, total: 0 },
                mula_golfcart: { cantidad: 0, total: 0 }
            }
        }
    });
});

// ==================== GESTIÓN DE EVENTOS ====================

// Listar eventos (API para el admin)
app.get('/admin/api/eventos', requireAuth, (req, res) => {
    const eventos = obtenerEventosDemo();
    res.json({ success: true, data: eventos });
});

// Crear nuevo evento
app.post('/admin/api/eventos', requireAuth, (req, res) => {
    const nuevoEvento = req.body;
    // En producción, guardar en BD
    console.log('Nuevo evento creado:', nuevoEvento);
    res.json({ success: true, message: 'Evento creado exitosamente', data: nuevoEvento });
});

// Actualizar evento
app.put('/admin/api/eventos/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const eventoActualizado = req.body;
    // En producción, actualizar en BD
    console.log(`Evento ${id} actualizado:`, eventoActualizado);
    res.json({ success: true, message: 'Evento actualizado exitosamente' });
});

// Eliminar evento
app.delete('/admin/api/eventos/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    // En producción, eliminar de BD
    console.log(`Evento ${id} eliminado`);
    res.json({ success: true, message: 'Evento eliminado exitosamente' });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor DEMO activo - Sin base de datos',
        timestamp: new Date().toISOString()
    });
});

// POST - Registro (demo sin BD)
app.post('/api/register', (req, res) => {
    console.log('Datos recibidos:', req.body);
    
    // Generar código de confirmación
    const codigoConfirmacion = Math.floor(100000 + Math.random() * 900000);
    
    res.json({
        success: true,
        message: 'Inscripción registrada exitosamente',
        codigo_confirmacion: codigoConfirmacion,
        datos: req.body
    });
});

// GET - Verificar si documento ya existe (validación en tiempo real)
app.get('/api/check-documento/:documento', (req, res) => {
    const documento = req.params.documento;
    
    // Obtener registros almacenados en localStorage simulado (en servidor)
    // Para demo, usamos una lista de documentos ya registrados
    const registrosGuardados = req.session?.registros || [];
    
    // También verificamos documentos de ejemplo para demo
    const documentosRegistrados = [
        '1000000001', // Ejemplo de documento ya registrado
        '1234567890'  // Otro ejemplo
    ];
    
    // Combinar registros guardados en sesión con ejemplos
    const todosLosDocumentos = [...documentosRegistrados, ...registrosGuardados.map(r => r.documento)];
    
    const existe = todosLosDocumentos.includes(documento);
    
    res.json({
        existe: existe,
        documento: documento,
        mensaje: existe ? 'Este documento ya está registrado para el V Campeonato Regional' : 'Documento disponible'
    });
});

// 404 - DEBE IR AL FINAL
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Página No Encontrada',
        message: 'La ruta que buscas no existe'
    });
});

// ============================================
// Inicio del servidor
// ============================================
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   L.A.M.A. HARDCORE TROPICAL           ║
    ║  SERVIDOR DEMO (Sin Base de Datos)    ║
    ║  Puerto: ${PORT}                          ║
    ║  URL: http://localhost:${PORT}            ║
    ╚════════════════════════════════════════╝
    
    Ver el sitio con el logo oficial en:
       - http://localhost:${PORT}/
       - http://localhost:${PORT}/registro
       - http://localhost:${PORT}/admin/dashboard
    `);
});
