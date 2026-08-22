const { InscripcionModel } = require('../src/models/inscripcionModel');

describe('InscripcionModel — normalización y cálculos (funciones puras, sin BD)', () => {
    describe('normalizarTipoParticipante', () => {
        test('acepta los valores exactos permitidos del catálogo oficial L.A.M.A.', () => {
            expect(InscripcionModel.normalizarTipoParticipante('ESPOSA (O)')).toBe('ESPOSA (O)');
            expect(InscripcionModel.normalizarTipoParticipante('MIEMBRO FULL COLOR (FCM)')).toBe('MIEMBRO FULL COLOR (FCM)');
            expect(InscripcionModel.normalizarTipoParticipante('DAMA L.A.M.A. - FULL COLOR (FCM)')).toBe('DAMA L.A.M.A. - FULL COLOR (FCM)');
            expect(InscripcionModel.normalizarTipoParticipante('DAMA L.A.M.A. - PROSPECTO (P)')).toBe('DAMA L.A.M.A. - PROSPECTO (P)');
        });

        test('ya no reconoce las formas antiguas consolidadas (CONYUGUE, PAREJA) como valores exactos', () => {
            // Se corrigen al vuelo por heurística de texto ("esposa"/"conyuge"/"pareja" -> ESPOSA (O)),
            // pero ya no deben existir como valores permitidos de salida.
            expect(InscripcionModel.normalizarTipoParticipante('CONYUGUE')).toBe('ESPOSA (O)');
            expect(InscripcionModel.normalizarTipoParticipante('PAREJA')).toBe('ESPOSA (O)');
        });

        test('distingue DAMA L.A.M.A. Full Color de DAMA L.A.M.A. Prospecto por heurística de texto', () => {
            expect(InscripcionModel.normalizarTipoParticipante('dama full color')).toBe('DAMA L.A.M.A. - FULL COLOR (FCM)');
            expect(InscripcionModel.normalizarTipoParticipante('dama prospecto')).toBe('DAMA L.A.M.A. - PROSPECTO (P)');
        });

        test('normaliza variantes de texto libre por heurística', () => {
            expect(InscripcionModel.normalizarTipoParticipante('prospecto')).toBe('PROSPECTO (P)');
            expect(InscripcionModel.normalizarTipoParticipante('asociado')).toBe('ASOCIADO (A) (ASC)');
            expect(InscripcionModel.normalizarTipoParticipante('honorario')).toBe('MIEMBRO HONORARIO (HNR)');
            expect(InscripcionModel.normalizarTipoParticipante('retirado')).toBe('MIEMBRO RETIRADO (RTR)');
            expect(InscripcionModel.normalizarTipoParticipante('hijo')).toBe('HIJO (A) (H)');
            expect(InscripcionModel.normalizarTipoParticipante('')).toBe('INVITADO (A) (I)');
        });
    });

    describe('normalizarTipoVehiculo', () => {
        test('acepta los valores exactos permitidos', () => {
            expect(InscripcionModel.normalizarTipoVehiculo('MOTO (M)')).toBe('MOTO (M)');
            expect(InscripcionModel.normalizarTipoVehiculo('CARRO (C)')).toBe('CARRO (C)');
            expect(InscripcionModel.normalizarTipoVehiculo('AVIÓN (A)')).toBe('AVIÓN (A)');
        });

        test('normaliza variantes de texto libre por heurística', () => {
            expect(InscripcionModel.normalizarTipoVehiculo('moto')).toBe('MOTO (M)');
            expect(InscripcionModel.normalizarTipoVehiculo('carro')).toBe('CARRO (C)');
            expect(InscripcionModel.normalizarTipoVehiculo('avion')).toBe('AVIÓN (A)');
        });

        test('devuelve null si no hay valor o no se reconoce', () => {
            expect(InscripcionModel.normalizarTipoVehiculo('')).toBeNull();
            expect(InscripcionModel.normalizarTipoVehiculo(null)).toBeNull();
            expect(InscripcionModel.normalizarTipoVehiculo('bicicleta')).toBeNull();
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
