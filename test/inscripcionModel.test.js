const { InscripcionModel } = require('../src/models/inscripcionModel');

describe('InscripcionModel — normalización y cálculos (funciones puras, sin BD)', () => {
    describe('normalizarTipoParticipante', () => {
        test('acepta los valores exactos permitidos, incluyendo ESPOSA (o)', () => {
            expect(InscripcionModel.normalizarTipoParticipante('ESPOSA (o)')).toBe('ESPOSA (o)');
            expect(InscripcionModel.normalizarTipoParticipante('FULL COLOR MEMBER')).toBe('FULL COLOR MEMBER');
        });

        test('ya no reconoce la forma antigua "ESPOSA (a)" como valor exacto', () => {
            // Se corrige al vuelo por heurística de texto ("esposa" -> ESPOSA (o)),
            // pero ya no debe existir como valor permitido de salida.
            expect(InscripcionModel.normalizarTipoParticipante('ESPOSA (a)')).toBe('ESPOSA (o)');
        });

        test('normaliza variantes de texto libre por heurística', () => {
            expect(InscripcionModel.normalizarTipoParticipante('prospecto')).toBe('PROSPECT');
            expect(InscripcionModel.normalizarTipoParticipante('hijo')).toBe('HIJA (o)');
            expect(InscripcionModel.normalizarTipoParticipante('')).toBe('INVITADA (O)');
        });
    });

    describe('calcularCantidadAcompanantes', () => {
        test('cuenta acompañantes desde el JSON cuando existe', () => {
            const inscripcion = { acompanantes_json: JSON.stringify([{ nombre: 'A' }, { nombre: 'B' }]) };
            expect(InscripcionModel.calcularCantidadAcompanantes(inscripcion)).toBe(2);
        });

        test('cae al flag booleano legado cuando no hay JSON', () => {
            expect(InscripcionModel.calcularCantidadAcompanantes({ asiste_con_acompanante: true })).toBe(1);
            expect(InscripcionModel.calcularCantidadAcompanantes({ asiste_con_acompanante: false })).toBe(0);
        });
    });

    describe('calcularTotalReal', () => {
        test('suma inscripción base + jersey + acompañantes + servicios + merchandising', () => {
            const inscripcion = {
                valor_base: 100000,
                adquiere_jersey: true,
                valor_jersey: 70000,
                asiste_con_acompanante: true,
                total_servicios: 50000,
                total_merchandising: 25000
            };

            // 100000 + 70000 + (1 acompañante * 100000) + 50000 + 25000
            expect(InscripcionModel.calcularTotalReal(inscripcion)).toBe(345000);
        });

        test('sin jersey ni acompañantes ni extras, solo cobra la inscripción base', () => {
            expect(InscripcionModel.calcularTotalReal({})).toBe(100000);
        });
    });

    describe('obtenerClaveServicio', () => {
        test('reconoce variantes de nombre de servicio premium', () => {
            expect(InscripcionModel.obtenerClaveServicio({ servicio: 'jet ski' })).toBe('jet_ski');
            expect(InscripcionModel.obtenerClaveServicio({ nombre: 'Lancha de lujo' })).toBe('lancha_lujo');
            expect(InscripcionModel.obtenerClaveServicio({ slug: 'regata_veleros' })).toBe('regata_veleros');
            expect(InscripcionModel.obtenerClaveServicio({ nombre: 'algo desconocido' })).toBeNull();
        });
    });

    describe('construirResumenMerchandising', () => {
        test('agrupa por item + talla y suma cantidades/totales', () => {
            const inscripciones = [
                { merchandising_json: JSON.stringify([{ item: 'gorra', precio_total: 25000, cantidad: 1 }]) },
                { merchandising_json: JSON.stringify([{ item: 'gorra', precio_total: 25000, cantidad: 1 }]) }
            ];

            const resumen = InscripcionModel.construirResumenMerchandising(inscripciones);
            expect(resumen.gorra).toEqual({ cantidad: 2, total: 50000 });
        });

        test('ignora JSON inválido sin lanzar error', () => {
            const inscripciones = [{ merchandising_json: 'no-es-json-valido' }];
            expect(() => InscripcionModel.construirResumenMerchandising(inscripciones)).not.toThrow();
        });
    });

    describe('generarTokenQr', () => {
        test('genera un token hexadecimal de alta entropía, distinto en cada llamada', () => {
            const tokenA = InscripcionModel.generarTokenQr();
            const tokenB = InscripcionModel.generarTokenQr();

            expect(tokenA).toMatch(/^[0-9a-f]{48}$/);
            expect(tokenA).not.toBe(tokenB);
        });
    });
});
