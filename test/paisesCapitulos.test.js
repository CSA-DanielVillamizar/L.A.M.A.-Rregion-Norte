const { PAISES_CAPITULOS, esParPaisCapituloValido } = require('../src/data/paisesCapitulos');

describe('paisesCapitulos (diccionario global País -> Capítulo)', () => {
    test('Colombia incluye Rionegro (regresión: capítulo agregado en Antioquia)', () => {
        expect(PAISES_CAPITULOS['Colombia']).toContain('Rionegro');
    });

    test('esParPaisCapituloValido acepta pares reales', () => {
        expect(esParPaisCapituloValido('Colombia', 'Rionegro')).toBe(true);
        expect(esParPaisCapituloValido('Colombia', 'Medellín')).toBe(true);
    });

    test('esParPaisCapituloValido rechaza combinaciones inventadas', () => {
        expect(esParPaisCapituloValido('Colombia', 'Capítulo Inexistente')).toBe(false);
        expect(esParPaisCapituloValido('País Inexistente', 'Rionegro')).toBe(false);
    });

    test('cada país tiene al menos un capítulo listado', () => {
        Object.entries(PAISES_CAPITULOS).forEach(([pais, capitulos]) => {
            expect(Array.isArray(capitulos)).toBe(true);
            expect(capitulos.length).toBeGreaterThan(0);
        });
    });
});
