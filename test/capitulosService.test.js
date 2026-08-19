const capitulosService = require('../src/services/capitulosService');

describe('capitulosService', () => {
    test('incluye Rionegro (Antioquia) entre los capítulos activos', () => {
        const capitulos = capitulosService.getAllCapitulos();
        const rionegro = capitulos.find((c) => c.nombre === 'Rionegro');

        expect(rionegro).toBeDefined();
        expect(rionegro.departamento).toBe('Antioquia');
        expect(rionegro.miembros).toBe(14);
    });

    test('getAllCapitulos devuelve solo capítulos activos, ordenados alfabéticamente', () => {
        const capitulos = capitulosService.getAllCapitulos();
        const nombres = capitulos.map((c) => c.nombre);
        const nombresOrdenados = [...nombres].sort((a, b) => a.localeCompare(b));

        expect(capitulos.every((c) => c.activo)).toBe(true);
        expect(nombres).toEqual(nombresOrdenados);
    });

    test('createCapitulo agrega un capítulo nuevo con id incremental', () => {
        const antes = capitulosService.getAllCapitulos().length;
        const nuevo = capitulosService.createCapitulo({
            nombre: 'Capítulo Prueba',
            departamento: 'Test',
            miembros: 5,
            fundado: 2026
        });

        expect(nuevo.id).toBeGreaterThan(0);
        expect(nuevo.activo).toBe(true);
        expect(capitulosService.getAllCapitulos().length).toBe(antes + 1);
    });

    test('deleteCapitulo hace soft-delete (no lo elimina, lo marca inactivo)', () => {
        const nuevo = capitulosService.createCapitulo({ nombre: 'Temporal', departamento: 'X', miembros: 1 });
        const eliminado = capitulosService.deleteCapitulo(nuevo.id);

        expect(eliminado).toBe(true);
        expect(capitulosService.getAllCapitulos().find((c) => c.id === nuevo.id)).toBeUndefined();
        expect(capitulosService.getCapituloById(nuevo.id).activo).toBe(false);
    });

    test('getEstadisticas calcula totales coherentes con getAllCapitulos', () => {
        const capitulos = capitulosService.getAllCapitulos();
        const stats = capitulosService.getEstadisticas();

        expect(stats.total_capitulos).toBe(capitulos.length);
        expect(stats.total_miembros).toBe(capitulos.reduce((sum, c) => sum + c.miembros, 0));
    });
});
