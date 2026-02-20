/**
 * CAPA DE DOMINIO: Servicio de eventos
 * Gestiona la lógica de negocio relacionada con eventos del campeonato
 */

const { getPool, sql } = require('../config/database');

// Simulación de base de datos en memoria
const eventsDB = [
    {
        id: 'vnorte-2026',
        nombre: 'V Campeonato Región Norte',
        fecha: '2026-09-12',
        fechaFin: '2026-09-13',
        ubicacion: 'San Andrés Islas, Colombia',
        hotel: 'Mangrove Bay Hotel, San Andres Islas',
        descripcion: 'La Gran Regata L.A.M.A. - Evento cumbre de la Región Norte con competencia de Jet Ski, rodadas náuticas y terrestres, gala de integración y premiación regional.',
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
                    { descripcion: 'Burro Tour', valor: 140000, moneda: 'COP', unidad: 'por persona (2 horas)' }
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
                titulo: 'SÁBADO 12 DE SEPTIEMBRE - LA GRAN REGATA L.A.M.A.',
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
                        nota: 'IMPORTANTE: Si deseas participar en Lancha de Lujo/Pontón o Velero, debes seleccionarlas en el formulario de inscripción. Estas experiencias están disponibles tanto para miembros como para acompañantes.',
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
                titulo: 'DOMINGO 13 DE SEPTIEMBRE - VUELTA A LA ISLA',
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
                        unidad: 'por persona',
                        nota: 'IMPORTANTE: Selecciona "Velero Mar 7 Colores" en el formulario de inscripción para participar. Disponible para miembros y acompañantes.'
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
                        nota: 'IMPORTANTE: Si deseas participar, selecciona "Cupo en Chiva" o "Mula (Golf Cart)" en el formulario de inscripción. Estas experiencias están disponibles tanto para miembros como para acompañantes.',
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
                        detalles: 'Entrega de trofeos y reconocimientos: Campeón de los Juegos Playeros, Capítulo con mayor asistencia, Mención Honorífica al "Motero de Ultramar" (Asistente más lejano).',
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
        ]
    },
    {
        id: 'aniversario-2026',
        nombre: 'XVI Aniversario L.A.M.A.',
        fecha: '2026-11-20',
        fechaFin: '2026-11-22',
        ubicacion: 'Bogotá, Colombia',
        descripcion: 'Celebración del aniversario con rodada nacional y encuentro de capítulos.',
        capacidad: 300,
        registrados: 245,
        precio: 250000,
        imagen: '/images/events/aniversario-2026.jpg',
        destacado: true,
        agenda: []
    },
    {
        id: 'aniversario-barranquilla-2026',
        nombre: 'Aniversario Capítulo Barranquilla',
        fecha: '2026-02-05',
        fechaFin: '2026-02-07',
        ubicacion: 'Barranquilla, Atlántico',
        descripcion: 'Encuentro oficial del capítulo Barranquilla con rodada urbana y acto protocolario.',
        capacidad: 180,
        registrados: 0,
        precio: 120000,
        imagen: '/images/events/aniversario-barranquilla.jpg',
        destacado: false,
        agenda: []
    },
    {
        id: 'aniversario-bucaramanga-2026',
        nombre: 'Aniversario Capítulo Bucaramanga',
        fecha: '2026-03-21',
        fechaFin: '2026-03-23',
        ubicacion: 'San Martín, Cesar',
        descripcion: 'Celebración anual del capítulo Bucaramanga con actividades de integración regional.',
        capacidad: 160,
        registrados: 0,
        precio: 120000,
        imagen: '/images/events/aniversario-bucaramanga.jpg',
        destacado: false,
        agenda: []
    },
    {
        id: 'aniversario-valle-aburra-2026',
        nombre: 'Aniversario Capítulo Valle de Aburrá',
        fecha: '2026-07-18',
        fechaFin: '2026-07-20',
        ubicacion: 'Medellín, Antioquia',
        descripcion: 'Aniversario con caravana metropolitana y noche de hermandad L.A.M.A.',
        capacidad: 170,
        registrados: 0,
        precio: 120000,
        imagen: '/images/events/aniversario-valle-aburra.jpg',
        destacado: false,
        agenda: []
    },
    {
        id: 'aniversario-cartagena-2026',
        nombre: 'Aniversario Capítulo Cartagena',
        fecha: '2026-11-13',
        fechaFin: '2026-11-14',
        ubicacion: 'Cartagena, Bolívar',
        descripcion: 'Evento con recorrido costero, actividad social y ceremonia de aniversario.',
        capacidad: 160,
        registrados: 0,
        precio: 120000,
        imagen: '/images/events/aniversario-cartagena.jpg',
        destacado: false,
        agenda: []
    },
    {
        id: 'aniversario-cucuta-2026',
        nombre: 'Aniversario Capítulo Cúcuta',
        fecha: '2026-10-24',
        fechaFin: '2026-10-25',
        ubicacion: 'Cúcuta, Norte de Santander',
        descripcion: 'Conmemoración anual del capítulo con rodada binacional e integración.',
        capacidad: 150,
        registrados: 0,
        precio: 120000,
        imagen: '/images/events/aniversario-cucuta.jpg',
        destacado: false,
        agenda: []
    },
    {
        id: 'aniversario-medellin-2026',
        nombre: 'Aniversario Capítulo Medellín',
        fecha: '2026-06-19',
        fechaFin: '2026-06-21',
        ubicacion: 'Sabaneta, Antioquia',
        descripcion: 'Aniversario del capítulo Medellín con agenda de reconocimiento institucional.',
        capacidad: 200,
        registrados: 0,
        precio: 120000,
        imagen: '/images/events/aniversario-medellin.jpg',
        destacado: false,
        agenda: []
    },
    {
        id: 'aniversario-floridablanca-2026',
        nombre: 'Aniversario Capítulo Floridablanca',
        fecha: '2026-10-30',
        fechaFin: '2026-10-30',
        ubicacion: 'Floridablanca, Santander',
        descripcion: 'Celebración del capítulo con actividades de carretera y networking institucional.',
        capacidad: 140,
        registrados: 0,
        precio: 120000,
        imagen: '/images/events/aniversario-floridablanca.jpg',
        destacado: false,
        agenda: []
    },
    {
        id: 'aniversario-puerto-colombia-2026',
        nombre: 'Aniversario Capítulo Puerto Colombia',
        fecha: '2026-11-15',
        fechaFin: '2026-11-16',
        ubicacion: 'Puerto Colombia, Atlántico',
        descripcion: 'Encuentro conmemorativo en la costa atlántica con agenda de hermandad biker.',
        capacidad: 140,
        registrados: 0,
        precio: 120000,
        imagen: '/images/events/aniversario-puerto-colombia.jpg',
        destacado: false,
        agenda: []
    },
    {
        id: 'rally-nacional-colombia-2026',
        nombre: 'XII Rally Nacional Colombia',
        fecha: '2026-08-14',
        fechaFin: '2026-08-16',
        ubicacion: 'Villavicencio, Meta',
        descripcion: 'Rally nacional oficial con presencia de capítulos de todo el país.',
        capacidad: 350,
        registrados: 0,
        precio: 300000,
        imagen: '/images/events/rally-nacional-colombia.jpg',
        destacado: true,
        agenda: []
    },
    {
        id: 'rally-continental-2026',
        nombre: 'VII Rally Continental',
        fecha: '2026-09-30',
        fechaFin: '2026-10-04',
        ubicacion: 'Valparaiso, Chile',
        descripcion: 'Rally regional de integración con delegaciones de múltiples países.',
        capacidad: 450,
        registrados: 0,
        precio: 420000,
        imagen: '/images/events/rally-continental.jpg',
        destacado: true,
        agenda: []
    },
    {
        id: 'rally-internacional-2026',
        nombre: 'XXIX Rally Internacional',
        fecha: '2026-04-22',
        fechaFin: '2026-04-29',
        ubicacion: 'El Salvador',
        descripcion: 'Cierre anual con el rally internacional y participación global de miembros L.A.M.A.',
        capacidad: 600,
        registrados: 0,
        precio: 520000,
        imagen: '/images/events/rally-internacional.jpg',
        destacado: true,
        agenda: []
    },
    {
        id: 'damas-lama-2026',
        nombre: 'IV Evento DAMAS LAMA',
        fecha: '2026-05-16',
        fechaFin: '2026-05-17',
        ubicacion: 'Ibagué, Tolima',
        descripcion: 'Encuentro nacional de DAMAS LAMA con actividades de integración y representación institucional.',
        capacidad: 220,
        registrados: 0,
        precio: 180000,
        imagen: '/images/events/damas-lama-2026.jpg',
        destacado: true,
        agenda: []
    },
    {
        id: 'ruta-cafe-2026',
        nombre: 'Ruta del Café',
        fecha: '2026-10-15',
        fechaFin: '2026-10-17',
        ubicacion: 'Eje Cafetero, Colombia',
        descripcion: 'Recorrido por el paisaje cultural cafetero con degustaciones y alojamiento.',
        capacidad: 80,
        registrados: 52,
        precio: 350000,
        imagen: '/images/events/ruta-cafe.jpg',
        destacado: false,
        agenda: []
    }
];

let tablaEventosAsegurada = false;

const parsearJSONSeguro = (texto, valorDefecto) => {
    try {
        if (!texto) {
            return valorDefecto;
        }
        return JSON.parse(texto);
    } catch (error) {
        return valorDefecto;
    }
};

const mapearFilaEvento = (fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    fecha: fila.fecha,
    fechaFin: fila.fechaFin,
    ubicacion: fila.ubicacion,
    hotel: fila.hotel,
    descripcion: fila.descripcion,
    capacidad: fila.capacidad,
    registrados: fila.registrados,
    precio: fila.precio,
    moneda: fila.moneda,
    imagen: fila.imagen,
    destacado: Boolean(fila.destacado),
    ordenVisual: fila.ordenVisual,
    agenda: parsearJSONSeguro(fila.agendaJson, []),
    paqueteOficial: parsearJSONSeguro(fila.paqueteJson, null),
    costos_adicionales: parsearJSONSeguro(fila.costosJson, []),
    contactos: parsearJSONSeguro(fila.contactosJson, []),
    recomendaciones: parsearJSONSeguro(fila.recomendacionesJson, []),
    disponibilidad: fila.capacidad - fila.registrados,
    porcentajeOcupacion: fila.capacidad > 0 ? Math.round((fila.registrados / fila.capacidad) * 100) : 0,
    lleno: fila.registrados >= fila.capacidad
});

const asegurarTablaEventos = async () => {
    if (tablaEventosAsegurada) {
        return;
    }

    const pool = await getPool();
    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EventosLama')
        BEGIN
            CREATE TABLE EventosLama (
                id_evento VARCHAR(120) NOT NULL PRIMARY KEY,
                nombre NVARCHAR(200) NOT NULL,
                fecha_inicio DATE NOT NULL,
                fecha_fin DATE NOT NULL,
                ubicacion NVARCHAR(250) NOT NULL,
                hotel NVARCHAR(250) NULL,
                descripcion NVARCHAR(MAX) NULL,
                capacidad INT NOT NULL,
                registrados INT NOT NULL DEFAULT 0,
                precio INT NULL,
                moneda VARCHAR(10) NULL,
                imagen NVARCHAR(300) NULL,
                destacado BIT NOT NULL DEFAULT 0,
                orden_visual INT NOT NULL DEFAULT 1,
                agenda_json NVARCHAR(MAX) NULL,
                paquete_json NVARCHAR(MAX) NULL,
                costos_json NVARCHAR(MAX) NULL,
                contactos_json NVARCHAR(MAX) NULL,
                recomendaciones_json NVARCHAR(MAX) NULL,
                activo BIT NOT NULL DEFAULT 1,
                fecha_creacion DATETIME2 NOT NULL DEFAULT GETDATE(),
                fecha_actualizacion DATETIME2 NOT NULL DEFAULT GETDATE()
            );
        END
    `);

    const totalActivos = await pool.request().query(`
        SELECT COUNT(1) AS total
        FROM EventosLama
        WHERE activo = 1
    `);

    if ((totalActivos.recordset[0]?.total || 0) === 0) {
        for (let index = 0; index < eventsDB.length; index += 1) {
            const evento = eventsDB[index];
            const request = pool.request();
            request.input('id_evento', sql.VarChar(120), evento.id);
            request.input('nombre', sql.NVarChar(200), evento.nombre);
            request.input('fecha_inicio', sql.Date, evento.fecha);
            request.input('fecha_fin', sql.Date, evento.fechaFin || evento.fecha);
            request.input('ubicacion', sql.NVarChar(250), evento.ubicacion);
            request.input('hotel', sql.NVarChar(250), evento.hotel || null);
            request.input('descripcion', sql.NVarChar(sql.MAX), evento.descripcion || null);
            request.input('capacidad', sql.Int, Number.isFinite(evento.capacidad) ? evento.capacidad : 0);
            request.input('registrados', sql.Int, Number.isFinite(evento.registrados) ? evento.registrados : 0);
            request.input('precio', sql.Int, Number.isFinite(evento.precio) ? evento.precio : null);
            request.input('moneda', sql.VarChar(10), evento.moneda || 'COP');
            request.input('imagen', sql.NVarChar(300), evento.imagen || '/images/events/default.jpg');
            request.input('destacado', sql.Bit, evento.destacado ? 1 : 0);
            request.input('orden_visual', sql.Int, index + 1);
            request.input('agenda_json', sql.NVarChar(sql.MAX), JSON.stringify(evento.agenda || []));
            request.input('paquete_json', sql.NVarChar(sql.MAX), evento.paqueteOficial ? JSON.stringify(evento.paqueteOficial) : null);
            request.input('costos_json', sql.NVarChar(sql.MAX), JSON.stringify(evento.costos_adicionales || []));
            request.input('contactos_json', sql.NVarChar(sql.MAX), JSON.stringify(evento.contactos || []));
            request.input('recomendaciones_json', sql.NVarChar(sql.MAX), JSON.stringify(evento.recomendaciones || []));

            await request.query(`
                INSERT INTO EventosLama (
                    id_evento, nombre, fecha_inicio, fecha_fin, ubicacion, hotel, descripcion,
                    capacidad, registrados, precio, moneda, imagen, destacado, orden_visual,
                    agenda_json, paquete_json, costos_json, contactos_json, recomendaciones_json, activo
                )
                VALUES (
                    @id_evento, @nombre, @fecha_inicio, @fecha_fin, @ubicacion, @hotel, @descripcion,
                    @capacidad, @registrados, @precio, @moneda, @imagen, @destacado, @orden_visual,
                    @agenda_json, @paquete_json, @costos_json, @contactos_json, @recomendaciones_json, 1
                )
            `);
        }
    }

    tablaEventosAsegurada = true;
};

/**
 * Obtiene todos los eventos disponibles
 * @returns {Array} Lista de eventos
 */
exports.getAllEvents = async () => {
    await asegurarTablaEventos();

    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT
            id_evento AS id,
            nombre,
            CONVERT(VARCHAR(10), fecha_inicio, 23) AS fecha,
            CONVERT(VARCHAR(10), fecha_fin, 23) AS fechaFin,
            ubicacion,
            hotel,
            descripcion,
            capacidad,
            registrados,
            precio,
            moneda,
            imagen,
            destacado,
            orden_visual AS ordenVisual,
            agenda_json AS agendaJson,
            paquete_json AS paqueteJson,
            costos_json AS costosJson,
            contactos_json AS contactosJson,
            recomendaciones_json AS recomendacionesJson
        FROM EventosLama
        WHERE activo = 1
        ORDER BY
            CASE WHEN destacado = 1 THEN 0 ELSE 1 END,
            orden_visual ASC,
            fecha_inicio ASC,
            id_evento ASC
    `);

    return result.recordset.map(mapearFilaEvento);
};

/**
 * Obtiene un evento por su ID
 * @param {String} eventId - ID del evento
 * @returns {Object|null} Datos del evento o null si no existe
 */
exports.getEventById = async (eventId) => {
    await asegurarTablaEventos();

    const pool = await getPool();
    const request = pool.request();
    request.input('id_evento', sql.VarChar(120), eventId);

    const result = await request.query(`
        SELECT TOP 1
            id_evento AS id,
            nombre,
            CONVERT(VARCHAR(10), fecha_inicio, 23) AS fecha,
            CONVERT(VARCHAR(10), fecha_fin, 23) AS fechaFin,
            ubicacion,
            hotel,
            descripcion,
            capacidad,
            registrados,
            precio,
            moneda,
            imagen,
            destacado,
            orden_visual AS ordenVisual,
            agenda_json AS agendaJson,
            paquete_json AS paqueteJson,
            costos_json AS costosJson,
            contactos_json AS contactosJson,
            recomendaciones_json AS recomendacionesJson
        FROM EventosLama
        WHERE activo = 1 AND id_evento = @id_evento
    `);

    if (!result.recordset.length) {
        return null;
    }

    return mapearFilaEvento(result.recordset[0]);
};

/**
 * Registra un participante a un evento
 * @param {String} eventId - ID del evento
 * @param {Object} participantData - Datos del participante
 * @returns {Object} Resultado de la operación
 */
exports.registerParticipant = async (eventId, participantData) => {
    await asegurarTablaEventos();

    const pool = await getPool();
    const request = pool.request();
    request.input('id_evento', sql.VarChar(120), eventId);

    const actualizacion = await request.query(`
        UPDATE EventosLama
        SET registrados = registrados + 1,
            fecha_actualizacion = GETDATE()
        WHERE id_evento = @id_evento
          AND activo = 1
          AND registrados < capacidad
    `);

    if ((actualizacion.rowsAffected[0] || 0) === 0) {
        const verificacion = await exports.getEventById(eventId);
        if (!verificacion) {
            return {
                success: false,
                message: 'Evento no encontrado'
            };
        }

        return {
            success: false,
            message: 'Evento lleno. No hay cupos disponibles'
        };
    }

    console.log('Nuevo registro:', {
        evento: eventId,
        participante: participantData
    });

    return {
        success: true,
        message: 'Registro exitoso',
        confirmationCode: `LAMA-${eventId.toUpperCase()}-${Date.now()}`
    };
};

/**
 * Crea un nuevo evento en memoria
 * @param {Object} data - Datos del evento
 * @returns {Object} Evento creado
 */
exports.createEvent = async (data) => {
    await asegurarTablaEventos();

    const id = data.id || `evt-${Date.now()}`;

    const pool = await getPool();
    const request = pool.request();
    request.input('id_evento', sql.VarChar(120), id);
    request.input('nombre', sql.NVarChar(200), data.nombre || 'Nuevo Evento');
    request.input('fecha_inicio', sql.Date, data.fecha || new Date().toISOString().split('T')[0]);
    request.input('fecha_fin', sql.Date, data.fechaFin || data.fecha || new Date().toISOString().split('T')[0]);
    request.input('ubicacion', sql.NVarChar(250), data.ubicacion || 'Por definir');
    request.input('hotel', sql.NVarChar(250), data.hotel || null);
    request.input('descripcion', sql.NVarChar(sql.MAX), data.descripcion || '');
    request.input('capacidad', sql.Int, parseInt(data.capacidad || 0, 10));
    request.input('registrados', sql.Int, parseInt(data.registrados || 0, 10));
    request.input('precio', sql.Int, Number.isFinite(parseInt(data.precio, 10)) ? parseInt(data.precio, 10) : null);
    request.input('moneda', sql.VarChar(10), data.moneda || 'COP');
    request.input('imagen', sql.NVarChar(300), data.imagen || '/images/events/default.jpg');
    request.input('destacado', sql.Bit, data.destacado ? 1 : 0);
    request.input('agenda_json', sql.NVarChar(sql.MAX), JSON.stringify(Array.isArray(data.agenda) ? data.agenda : []));
    request.input('paquete_json', sql.NVarChar(sql.MAX), data.paqueteOficial ? JSON.stringify(data.paqueteOficial) : null);
    request.input('costos_json', sql.NVarChar(sql.MAX), JSON.stringify(data.costos_adicionales || []));
    request.input('contactos_json', sql.NVarChar(sql.MAX), JSON.stringify(data.contactos || []));
    request.input('recomendaciones_json', sql.NVarChar(sql.MAX), JSON.stringify(data.recomendaciones || []));

    const result = await request.query(`
        INSERT INTO EventosLama (
            id_evento, nombre, fecha_inicio, fecha_fin, ubicacion, hotel, descripcion,
            capacidad, registrados, precio, moneda, imagen, destacado, orden_visual,
            agenda_json, paquete_json, costos_json, contactos_json, recomendaciones_json, activo
        )
        OUTPUT
            INSERTED.id_evento AS id,
            INSERTED.nombre,
            CONVERT(VARCHAR(10), INSERTED.fecha_inicio, 23) AS fecha,
            CONVERT(VARCHAR(10), INSERTED.fecha_fin, 23) AS fechaFin,
            INSERTED.ubicacion,
            INSERTED.hotel,
            INSERTED.descripcion,
            INSERTED.capacidad,
            INSERTED.registrados,
            INSERTED.precio,
            INSERTED.moneda,
            INSERTED.imagen,
            INSERTED.destacado,
            INSERTED.orden_visual AS ordenVisual,
            INSERTED.agenda_json AS agendaJson,
            INSERTED.paquete_json AS paqueteJson,
            INSERTED.costos_json AS costosJson,
            INSERTED.contactos_json AS contactosJson,
            INSERTED.recomendaciones_json AS recomendacionesJson
        VALUES (
            @id_evento, @nombre, @fecha_inicio, @fecha_fin, @ubicacion, @hotel, @descripcion,
            @capacidad, @registrados, @precio, @moneda, @imagen, @destacado,
            ISNULL((SELECT MAX(orden_visual) + 1 FROM EventosLama WHERE activo = 1), 1),
            @agenda_json, @paquete_json, @costos_json, @contactos_json, @recomendaciones_json, 1
        )
    `);

    return mapearFilaEvento(result.recordset[0]);
};

/**
 * Actualiza un evento existente
 * @param {String} eventId - ID del evento
 * @param {Object} data - Datos a actualizar
 * @returns {Object|null} Evento actualizado o null
 */
exports.updateEvent = async (eventId, data) => {
    await asegurarTablaEventos();

    const actual = await exports.getEventById(eventId);
    if (!actual) {
        return null;
    }

    const pool = await getPool();
    const request = pool.request();
    request.input('id_evento', sql.VarChar(120), eventId);
    request.input('nombre', sql.NVarChar(200), data.nombre ?? actual.nombre);
    request.input('fecha_inicio', sql.Date, data.fecha ?? actual.fecha);
    request.input('fecha_fin', sql.Date, data.fechaFin ?? actual.fechaFin);
    request.input('ubicacion', sql.NVarChar(250), data.ubicacion ?? actual.ubicacion);
    request.input('hotel', sql.NVarChar(250), data.hotel ?? actual.hotel ?? null);
    request.input('descripcion', sql.NVarChar(sql.MAX), data.descripcion ?? actual.descripcion ?? '');
    request.input('capacidad', sql.Int, data.capacidad !== undefined ? parseInt(data.capacidad, 10) : actual.capacidad);
    request.input('registrados', sql.Int, data.registrados !== undefined ? parseInt(data.registrados, 10) : actual.registrados);
    request.input('precio', sql.Int, data.precio !== undefined ? parseInt(data.precio, 10) : actual.precio);
    request.input('moneda', sql.VarChar(10), data.moneda ?? actual.moneda ?? 'COP');
    request.input('imagen', sql.NVarChar(300), data.imagen ?? actual.imagen ?? '/images/events/default.jpg');
    request.input('destacado', sql.Bit, data.destacado !== undefined ? (data.destacado ? 1 : 0) : (actual.destacado ? 1 : 0));
    request.input('agenda_json', sql.NVarChar(sql.MAX), JSON.stringify(Array.isArray(data.agenda) ? data.agenda : (actual.agenda || [])));
    request.input('paquete_json', sql.NVarChar(sql.MAX), data.paqueteOficial ? JSON.stringify(data.paqueteOficial) : (actual.paqueteOficial ? JSON.stringify(actual.paqueteOficial) : null));
    request.input('costos_json', sql.NVarChar(sql.MAX), JSON.stringify(data.costos_adicionales || actual.costos_adicionales || []));
    request.input('contactos_json', sql.NVarChar(sql.MAX), JSON.stringify(data.contactos || actual.contactos || []));
    request.input('recomendaciones_json', sql.NVarChar(sql.MAX), JSON.stringify(data.recomendaciones || actual.recomendaciones || []));

    const result = await request.query(`
        UPDATE EventosLama
        SET
            nombre = @nombre,
            fecha_inicio = @fecha_inicio,
            fecha_fin = @fecha_fin,
            ubicacion = @ubicacion,
            hotel = @hotel,
            descripcion = @descripcion,
            capacidad = @capacidad,
            registrados = @registrados,
            precio = @precio,
            moneda = @moneda,
            imagen = @imagen,
            destacado = @destacado,
            agenda_json = @agenda_json,
            paquete_json = @paquete_json,
            costos_json = @costos_json,
            contactos_json = @contactos_json,
            recomendaciones_json = @recomendaciones_json,
            fecha_actualizacion = GETDATE()
        OUTPUT
            INSERTED.id_evento AS id,
            INSERTED.nombre,
            CONVERT(VARCHAR(10), INSERTED.fecha_inicio, 23) AS fecha,
            CONVERT(VARCHAR(10), INSERTED.fecha_fin, 23) AS fechaFin,
            INSERTED.ubicacion,
            INSERTED.hotel,
            INSERTED.descripcion,
            INSERTED.capacidad,
            INSERTED.registrados,
            INSERTED.precio,
            INSERTED.moneda,
            INSERTED.imagen,
            INSERTED.destacado,
            INSERTED.orden_visual AS ordenVisual,
            INSERTED.agenda_json AS agendaJson,
            INSERTED.paquete_json AS paqueteJson,
            INSERTED.costos_json AS costosJson,
            INSERTED.contactos_json AS contactosJson,
            INSERTED.recomendaciones_json AS recomendacionesJson
        WHERE id_evento = @id_evento AND activo = 1
    `);

    return result.recordset.length ? mapearFilaEvento(result.recordset[0]) : null;
};

/**
 * Reordena eventos activos actualizando su orden visual
 * @param {string[]} idsOrdenados - IDs en el orden final
 * @returns {Array} Lista de eventos reordenados
 */
exports.reorderEvents = async (idsOrdenados) => {
    await asegurarTablaEventos();

    if (!Array.isArray(idsOrdenados) || idsOrdenados.length === 0) {
        return exports.getAllEvents();
    }

    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        for (let indice = 0; indice < idsOrdenados.length; indice += 1) {
            const idEvento = String(idsOrdenados[indice]);
            const request = new sql.Request(transaction);
            request.input('id_evento', sql.VarChar(120), idEvento);
            request.input('orden_visual', sql.Int, indice + 1);

            await request.query(`
                UPDATE EventosLama
                SET orden_visual = @orden_visual,
                    fecha_actualizacion = GETDATE()
                WHERE id_evento = @id_evento
                  AND activo = 1
            `);
        }

        await transaction.commit();
    } catch (error) {
        if (transaction._aborted !== true) {
            await transaction.rollback();
        }
        throw error;
    }

    return exports.getAllEvents();
};

/**
 * Elimina un evento
 * @param {String} eventId - ID del evento
 * @returns {boolean} True si se eliminó
 */
exports.deleteEvent = async (eventId) => {
    await asegurarTablaEventos();

    const pool = await getPool();
    const request = pool.request();
    request.input('id_evento', sql.VarChar(120), eventId);

    const result = await request.query(`
        UPDATE EventosLama
        SET activo = 0,
            fecha_actualizacion = GETDATE()
        WHERE id_evento = @id_evento AND activo = 1
    `);

    return (result.rowsAffected[0] || 0) > 0;
};
