const ciudadesColombia = require('colombia-cities');
const UbicacionModel = require('../models/ubicacionModel');

const normalizarTexto = (texto = '') => {
    return texto
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
};

class UbicacionService {
    static inicializacionEnCurso = null;

    static construirCatalogoMunicipios() {
        const departamentos = ciudadesColombia.getDepartments() || [];
        const registros = [];

        for (const departamentoInfo of departamentos) {
            const departamento = (departamentoInfo?.nombre || '').toString().trim();
            if (!departamento) {
                continue;
            }

            const ciudades = ciudadesColombia.getCitiesByDepartment(departamento) || [];
            for (const ciudad of ciudades) {
                const municipio = (ciudad?.nombre || '').toString().trim();
                if (!municipio) {
                    continue;
                }

                const nombreCompleto = `${municipio}, ${departamento}`;
                registros.push({
                    departamento,
                    municipio,
                    departamentoNormalizado: normalizarTexto(departamento),
                    municipioNormalizado: normalizarTexto(municipio),
                    nombreCompleto,
                    nombreCompletoNormalizado: normalizarTexto(nombreCompleto),
                    codigoDane: (ciudad?.codigo || '').toString().trim() || null,
                    provincia: (ciudad?.provincia || '').toString().trim() || null
                });
            }
        }

        const deduplicados = new Map();
        for (const registro of registros) {
            const clave = `${registro.departamentoNormalizado}|${registro.municipioNormalizado}`;
            if (!deduplicados.has(clave)) {
                deduplicados.set(clave, registro);
            }
        }

        return Array.from(deduplicados.values());
    }

    static async asegurarCatalogoMunicipios() {
        if (UbicacionService.inicializacionEnCurso) {
            return UbicacionService.inicializacionEnCurso;
        }

        UbicacionService.inicializacionEnCurso = (async () => {
            await UbicacionModel.asegurarTablaMunicipios();
            const totalActual = await UbicacionModel.contarMunicipios();

            if (totalActual > 0) {
                return;
            }

            const catalogoMunicipios = UbicacionService.construirCatalogoMunicipios();
            if (!catalogoMunicipios.length) {
                throw new Error('No fue posible construir catálogo de municipios de Colombia');
            }

            await UbicacionModel.reemplazarMunicipios(catalogoMunicipios);
        })();

        try {
            await UbicacionService.inicializacionEnCurso;
        } finally {
            UbicacionService.inicializacionEnCurso = null;
        }
    }

    static async resembrarCatalogoMunicipios() {
        await UbicacionModel.asegurarTablaMunicipios();

        const catalogoMunicipios = UbicacionService.construirCatalogoMunicipios();
        if (!catalogoMunicipios.length) {
            throw new Error('No fue posible construir catálogo de municipios de Colombia');
        }

        await UbicacionModel.reemplazarMunicipios(catalogoMunicipios);
        return {
            totalRegistros: catalogoMunicipios.length
        };
    }

    static async buscarMunicipios(textoBusqueda, limite = 12) {
        const texto = (textoBusqueda || '').toString().trim();
        if (texto.length < 2) {
            return [];
        }

        await UbicacionService.asegurarCatalogoMunicipios();

        const limiteSeguro = Math.max(1, Math.min(parseInt(limite, 10) || 12, 20));
        const resultados = await UbicacionModel.buscarMunicipiosPorTexto(normalizarTexto(texto), limiteSeguro);

        return resultados.map((registro) => ({
            valor: registro.nombre_completo,
            municipio: registro.municipio,
            departamento: registro.departamento,
            codigoDane: registro.codigo_dane || null
        }));
    }
}

module.exports = UbicacionService;
