/**
 * CAPA DE APLICACIÓN: Ensamblado de datos de la planilla de asistencia LAMA
 * ("REGISTRO DE ASISTENCIA A EVENTOS") a partir de las inscripciones con
 * check-in validado por el MTO en el punto de control. Reemplaza el
 * diligenciamiento manual en Excel: toma la pre-inscripción ya aprobada y la
 * asistencia ya validada, y arma directamente la estructura que consume el
 * generador de PDF.
 */

const eventService = require('./eventService');
const { InscripcionModel } = require('../models/inscripcionModel');
const { CapituloModel } = require('../models/capituloModel');
const { obtenerMapeoCategoria } = require('../data/categoriaPlanillaMapa');
const { calcularDistanciaMillas } = require('./distanciaService');
const logger = require('../utils/logger');

function extraerCodigoVehiculo(tipoVehiculo) {
    const match = String(tipoVehiculo || '').match(/\(([MCA])\)/);
    return match ? match[1] : null;
}

function nombreCapituloEfectivo(inscripcion) {
    if (inscripcion.capitulo === 'Otros' && inscripcion.capitulo_otro) {
        return inscripcion.capitulo_otro;
    }
    return inscripcion.capitulo;
}

/**
 * Lista, para un evento, los capítulos que tienen al menos un asistente con
 * check-in validado (para poblar el selector "Generar planilla de...").
 */
async function listarCapitulosConAsistencia(eventoId) {
    const checkins = await InscripcionModel.obtenerCheckinValidadoPorEvento(eventoId);
    const conteoPorCapitulo = new Map();

    for (const inscripcion of checkins) {
        const nombre = nombreCapituloEfectivo(inscripcion);
        if (!nombre) continue;
        const clave = `${nombre}||${inscripcion.pais || ''}`;
        const actual = conteoPorCapitulo.get(clave) || { capitulo: nombre, pais: inscripcion.pais || null, asistentes: 0 };
        actual.asistentes += 1;
        conteoPorCapitulo.set(clave, actual);
    }

    return Array.from(conteoPorCapitulo.values()).sort((a, b) => a.capitulo.localeCompare(b.capitulo));
}

/**
 * Arma la estructura completa de la planilla de un capítulo para un evento.
 */
async function generarDatosPlanilla({ eventoId, capitulo, pais }) {
    const evento = await eventService.getEventById(eventoId);
    if (!evento) {
        throw new Error('Evento no encontrado');
    }

    const todosLosCheckins = await InscripcionModel.obtenerCheckinValidadoPorEvento(eventoId);
    const checkinsCapitulo = todosLosCheckins.filter((inscripcion) => {
        const coincideCapitulo = nombreCapituloEfectivo(inscripcion) === capitulo;
        const coincidePais = !pais || inscripcion.pais === pais;
        return coincideCapitulo && coincidePais;
    });

    if (checkinsCapitulo.length === 0) {
        throw new Error('No hay asistentes con check-in validado para ese capítulo en este evento');
    }

    const paisCapitulo = pais || checkinsCapitulo[0].pais;
    const capituloInfo = await CapituloModel.getByNombrePais(capitulo, paisCapitulo);

    // Distancia: si falta alguna coordenada (capítulo o evento sin cargar
    // aún en el panel admin), queda null y el PDF lo muestra como pendiente.
    let distanciaMillas = null;
    if (capituloInfo?.latitud && capituloInfo?.longitud && evento.latitud && evento.longitud) {
        try {
            distanciaMillas = await calcularDistanciaMillas(
                { lat: capituloInfo.latitud, lng: capituloInfo.longitud, pais: paisCapitulo },
                { lat: evento.latitud, lng: evento.longitud, pais: evento.pais || paisCapitulo }
            );
        } catch (error) {
            logger.error('Error al calcular distancia para la planilla', { error });
        }
    }

    // Emparejar oficiales del capítulo contra quienes hicieron check-in
    // (por documento primero, por nombre como respaldo), para no duplicarlos
    // también en el roster general.
    const idsAsignadosAOficiales = new Set();
    const oficialesConAsistencia = (capituloInfo?.oficiales || []).map((oficial) => {
        if (!oficial.nombre_completo && !oficial.documento_numero) {
            return { cargo: oficial.cargo, nombre: null, asistio: false };
        }

        const inscripcion = checkinsCapitulo.find((item) => {
            if (oficial.documento_numero && item.documento_numero === oficial.documento_numero) return true;
            if (oficial.nombre_completo && item.nombre_completo.trim().toLowerCase() === oficial.nombre_completo.trim().toLowerCase()) return true;
            return false;
        });

        if (inscripcion) {
            idsAsignadosAOficiales.add(inscripcion.id_inscripcion);
            const mapeo = obtenerMapeoCategoria(inscripcion.tipo_participante);
            return {
                cargo: oficial.cargo,
                nombre: inscripcion.nombre_completo,
                asistio: true,
                columnaMiembro: mapeo.columnaMiembro,
                codigo: mapeo.codigo,
                vehiculo: extraerCodigoVehiculo(inscripcion.tipo_vehiculo)
            };
        }

        return { cargo: oficial.cargo, nombre: oficial.nombre_completo, asistio: false };
    });

    const roster = checkinsCapitulo
        .filter((inscripcion) => !idsAsignadosAOficiales.has(inscripcion.id_inscripcion))
        .map((inscripcion) => {
            const mapeo = obtenerMapeoCategoria(inscripcion.tipo_participante);
            return {
                nombre: inscripcion.nombre_completo,
                columnaMiembro: mapeo.columnaMiembro,
                codigo: mapeo.codigo,
                vehiculo: extraerCodigoVehiculo(inscripcion.tipo_vehiculo),
                conyuge: Boolean(mapeo.conyuge),
                invitadoSubcolumna: mapeo.invitadoSubcolumna || null
            };
        });

    const entradasParaTotales = [...oficialesConAsistencia.filter((o) => o.asistio), ...roster];

    const totales = {
        miembrosHombres: entradasParaTotales.filter((e) => e.columnaMiembro === 'hombre').length,
        damasLama: entradasParaTotales.filter((e) => e.columnaMiembro === 'dama').length,
        conyuges: roster.filter((e) => e.conyuge).length,
        honorarios: entradasParaTotales.filter((e) => e.codigo === 'HNR').length,
        prospectos: entradasParaTotales.filter((e) => e.codigo === 'P').length,
        hijos: roster.filter((e) => e.invitadoSubcolumna === 'hijos').length,
        asociados: roster.filter((e) => e.invitadoSubcolumna === 'assoc').length,
        invitados: roster.filter((e) => e.invitadoSubcolumna === 'invitado').length
    };

    return {
        evento: {
            nombre: evento.nombre,
            ubicacion: evento.ubicacion,
            fecha: evento.fecha,
            fechaFin: evento.fechaFin
        },
        capitulo,
        pais: paisCapitulo,
        distanciaMillas,
        distanciaPendiente: distanciaMillas === null,
        oficiales: oficialesConAsistencia,
        roster,
        totales
    };
}

module.exports = { generarDatosPlanilla, listarCapitulosConAsistencia };
