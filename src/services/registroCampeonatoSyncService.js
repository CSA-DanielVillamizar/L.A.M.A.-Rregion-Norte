const FormularioModel = require('../models/formularioModel');
const { InscripcionModel } = require('../models/inscripcionModel');

const MAPA_CAPITULOS = {
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

const CAPITULOS_VALIDOS = [
    'Barranquilla', 'Bucaramanga', 'Cartagena', 'Cúcuta', 'Floridablanca',
    'Medellín', 'Puerto Colombia', 'Valle Aburrá', 'Zenu'
];

const TIPOS_PARTICIPANTE_VALIDOS = [
    'DAMA L.A.M.A.',
    'FULL COLOR MEMBER',
    'ROCKET PROSPECT',
    'PROSPECT',
    'ESPOSA (a)',
    'CONYUGUE',
    'PAREJA',
    'HIJA (o)',
    'INVITADA (O)'
];

function obtenerNombrePrimerAcompanante(acompanantesJson) {
    if (!acompanantesJson) return null;

    try {
        const acompanantes = JSON.parse(acompanantesJson);
        if (!Array.isArray(acompanantes) || acompanantes.length === 0) {
            return null;
        }

        const primerAcompanante = acompanantes[0];
        if (!primerAcompanante || typeof primerAcompanante.nombre !== 'string') {
            return null;
        }

        const nombre = primerAcompanante.nombre.trim();
        return nombre.length > 0 ? nombre : null;
    } catch (error) {
        return null;
    }
}

function mapearRegistroAInscripcion(registro) {
    const categoriaNormalizada = String(registro.categoria || '').trim();
    const textoCategoria = categoriaNormalizada.toLowerCase();
    let tipoParticipante = 'INVITADA (O)';

    if (TIPOS_PARTICIPANTE_VALIDOS.includes(categoriaNormalizada)) {
        tipoParticipante = categoriaNormalizada;
    } else if (textoCategoria.includes('dama')) {
        tipoParticipante = 'DAMA L.A.M.A.';
    } else if (textoCategoria.includes('full')) {
        tipoParticipante = 'FULL COLOR MEMBER';
    } else if (textoCategoria.includes('rocket')) {
        tipoParticipante = 'ROCKET PROSPECT';
    } else if (textoCategoria.includes('prospect')) {
        tipoParticipante = 'PROSPECT';
    } else if (textoCategoria.includes('esposa')) {
        tipoParticipante = 'ESPOSA (a)';
    } else if (textoCategoria.includes('conyuge')) {
        tipoParticipante = 'CONYUGUE';
    } else if (textoCategoria.includes('pareja')) {
        tipoParticipante = 'PAREJA';
    } else if (textoCategoria.includes('hija') || textoCategoria.includes('hijo')) {
        tipoParticipante = 'HIJA (o)';
    }

    const capituloNormalizado = MAPA_CAPITULOS[registro.capitulo] || registro.capitulo;
    const capituloValido = CAPITULOS_VALIDOS.includes(capituloNormalizado);

    const parsearJsonSeguro = (value, fallback) => {
        if (!value) return fallback;
        try {
            const data = JSON.parse(value);
            return Array.isArray(data) ? data : fallback;
        } catch (error) {
            return fallback;
        }
    };

    const esDirectivo = String(registro.directivo || '').toLowerCase() === 'sí' || String(registro.directivo || '').toLowerCase() === 'si';
    const cargoDirectivo = esDirectivo
        ? [registro.cargo, registro.ambito].filter(Boolean).join(' - ') || 'Directivo'
        : null;

    return {
        tipo_participante: tipoParticipante,
        nombre_completo: registro.nombre_completo || 'Sin nombre',
        documento_numero: registro.documento_numero || 'SIN-DOCUMENTO',
        eps: registro.eps || 'No especificada',
        emergencia_nombre: registro.emergencia_nombre || 'No especificado',
        emergencia_telefono: registro.emergencia_telefono || 'No especificado',
        capitulo: capituloValido ? capituloNormalizado : 'Otros',
        capitulo_otro: capituloValido ? null : String(registro.capitulo || '').slice(0, 100),
        cargo_directivo: cargoDirectivo ? cargoDirectivo.toString().slice(0, 150) : null,
        fecha_llegada_isla: registro.fecha_llegada || new Date().toISOString().split('T')[0],
        condicion_medica: registro.condicion_medica || null,
        adquiere_jersey: registro.jersey === true || registro.jersey === 1,
        talla_jersey: registro.talla || null,
        asiste_con_acompanante: registro.acompana === true || registro.acompana === 1,
        nombre_acompanante: obtenerNombrePrimerAcompanante(registro.acompanantes_json),
        evento_id: registro.evento_id || 'vnorte-2026',
        origen_registro: 'legacy-registro-campeonato',
        acompanantes: parsearJsonSeguro(registro.acompanantes_json, []),
        servicios_principal: parsearJsonSeguro(registro.servicios_principal_json, []),
        servicios_acompanantes: parsearJsonSeguro(registro.servicios_acompanantes_json, []),
        total_servicios: Number.isFinite(Number(registro.total_servicios)) ? Number(registro.total_servicios) : 0
    };
}

class RegistroCampeonatoSyncService {
    static async sincronizarRegistrosCampeonatoAInscripciones(eventoId = 'vnorte-2026') {
        try {
            const [registrosCampeonato, inscripcionesExistentes] = await Promise.all([
                FormularioModel.listarRegistrosCampeonato(eventoId),
                InscripcionModel.getAll()
            ]);

            if (!Array.isArray(registrosCampeonato) || registrosCampeonato.length === 0) {
                return { sincronizados: 0 };
            }

            const documentosExistentes = new Set(
                (inscripcionesExistentes || [])
                    .map((inscripcion) => (inscripcion.documento_numero || '').toString().trim())
                    .filter(Boolean)
            );

            let totalSincronizados = 0;

            for (const registro of registrosCampeonato) {
                const documento = (registro.documento_numero || '').toString().trim();
                if (!documento || documentosExistentes.has(documento)) {
                    continue;
                }

                const payloadInscripcion = mapearRegistroAInscripcion(registro);
                await InscripcionModel.create(payloadInscripcion);
                documentosExistentes.add(documento);
                totalSincronizados += 1;
            }

            return { sincronizados: totalSincronizados };
        } catch (error) {
            console.error('Error en RegistroCampeonatoSyncService.sincronizarRegistrosCampeonatoAInscripciones:', error);
            return { sincronizados: 0, error: error.message };
        }
    }
}

module.exports = RegistroCampeonatoSyncService;
