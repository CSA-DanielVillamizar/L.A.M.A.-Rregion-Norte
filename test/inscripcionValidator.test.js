const { validateInscripcion } = require('../src/validators/inscripcionValidator');

function datosValidos(overrides = {}) {
    return {
        categoria: 'MIEMBRO FULL COLOR (FCM)',
        vehiculo: 'MOTO (M)',
        nombre: 'Juan Pérez',
        documento: '123456789',
        eps: 'Sura',
        email: 'juan@example.com',
        fecha_nacimiento: '1990-01-01',
        emergencia_nombre: 'María Pérez',
        emergencia_telefono: '3001234567',
        pais: 'Colombia',
        capitulo: 'Rionegro',
        directivo: 'No',
        fecha_llegada: '2026-09-12',
        jersey: false,
        acompanante: false,
        ...overrides
    };
}

describe('inscripcionValidator (esquema real de POST /eventos/vnorte-2026/registro)', () => {
    test('acepta un payload completo y válido', () => {
        const { error } = validateInscripcion(datosValidos());
        expect(error).toBeUndefined();
    });

    test('acepta "ESPOSA (O)" como categoría válida (consolida ESPOSA/CONYUGUE/PAREJA)', () => {
        const { error } = validateInscripcion(datosValidos({ categoria: 'ESPOSA (O)' }));
        expect(error).toBeUndefined();
    });

    test('acepta las dos variantes de DAMA L.A.M.A. (Full Color y Prospecto)', () => {
        const fcm = validateInscripcion(datosValidos({ categoria: 'DAMA L.A.M.A. - FULL COLOR (FCM)' }));
        expect(fcm.error).toBeUndefined();

        const prospecto = validateInscripcion(datosValidos({ categoria: 'DAMA L.A.M.A. - PROSPECTO (P)' }));
        expect(prospecto.error).toBeUndefined();
    });

    test('rechaza las categorías retiradas del catálogo (regresión: CONYUGUE, PAREJA, ROCKET PROSPECT y la DAMA sin variante ya no son válidas)', () => {
        ['CONYUGUE', 'PAREJA', 'ESPOSA (o)', 'ROCKET PROSPECT', 'DAMA L.A.M.A.', 'FULL COLOR MEMBER'].forEach((categoria) => {
            const { error } = validateInscripcion(datosValidos({ categoria }));
            expect(error).toBeDefined();
            expect(error.details.some((d) => d.path.includes('categoria'))).toBe(true);
        });
    });

    test('exige el tipo de vehículo y solo acepta Moto, Carro o Avión', () => {
        const sinVehiculo = validateInscripcion(datosValidos({ vehiculo: '' }));
        expect(sinVehiculo.error).toBeDefined();
        expect(sinVehiculo.error.details.some((d) => d.path.includes('vehiculo'))).toBe(true);

        const vehiculoInvalido = validateInscripcion(datosValidos({ vehiculo: 'BICICLETA' }));
        expect(vehiculoInvalido.error).toBeDefined();

        const carro = validateInscripcion(datosValidos({ vehiculo: 'CARRO (C)' }));
        expect(carro.error).toBeUndefined();

        const avion = validateInscripcion(datosValidos({ vehiculo: 'AVIÓN (A)' }));
        expect(avion.error).toBeUndefined();
    });

    test('acepta Rionegro como capítulo válido de Colombia (regresión: capítulo agregado hoy)', () => {
        const { error } = validateInscripcion(datosValidos({ pais: 'Colombia', capitulo: 'Rionegro' }));
        expect(error).toBeUndefined();
    });

    test('rechaza un capítulo que no pertenece al país seleccionado', () => {
        const { error } = validateInscripcion(datosValidos({ pais: 'Colombia', capitulo: 'Buenos Aires' }));
        expect(error).toBeDefined();
    });

    test('acepta cualquier fecha de llegada valida (el rango min/max ahora se valida dinamicamente contra el evento en eventController, no aqui - el schema es compartido por cualquier evento)', () => {
        const { error } = validateInscripcion(datosValidos({ fecha_llegada: '2026-09-20' }));
        expect(error).toBeUndefined();
    });

    test('rechaza una fecha de llegada invalida', () => {
        const { error } = validateInscripcion(datosValidos({ fecha_llegada: 'no-es-una-fecha' }));
        expect(error).toBeDefined();
    });

    test('exige talla si adquiere jersey, pero no si no lo adquiere', () => {
        const sinTalla = validateInscripcion(datosValidos({ jersey: true }));
        expect(sinTalla.error).toBeDefined();

        const conTalla = validateInscripcion(datosValidos({ jersey: true, talla: 'M' }));
        expect(conTalla.error).toBeUndefined();
    });

    test('exige al menos un acompañante si asiste con acompañante', () => {
        const sinAcompanantes = validateInscripcion(datosValidos({ acompanante: true }));
        expect(sinAcompanantes.error).toBeDefined();

        const conAcompanantes = validateInscripcion(datosValidos({
            acompanante: true,
            acompanantes: [{ nombre: 'Ana Pérez', documento: '987654321', telefono: '3009876543', jersey: false }]
        }));
        expect(conAcompanantes.error).toBeUndefined();
    });

    test('exige ámbito y cargo si es directivo', () => {
        const { error } = validateInscripcion(datosValidos({ directivo: 'Sí' }));
        expect(error).toBeDefined();

        const { error: sinError } = validateInscripcion(datosValidos({
            directivo: 'Sí',
            ambito: 'Capítulo',
            cargo: 'Presidente'
        }));
        expect(sinError).toBeUndefined();
    });
});
