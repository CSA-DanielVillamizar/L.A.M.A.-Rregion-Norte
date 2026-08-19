const { validateInscripcion } = require('../src/validators/inscripcionValidator');

function datosValidos(overrides = {}) {
    return {
        categoria: 'FULL COLOR MEMBER',
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

    test('acepta "ESPOSA (o)" como categoría válida', () => {
        const { error } = validateInscripcion(datosValidos({ categoria: 'ESPOSA (o)' }));
        expect(error).toBeUndefined();
    });

    test('rechaza la forma antigua "ESPOSA (a)" (regresión: ya no es un valor permitido)', () => {
        const { error } = validateInscripcion(datosValidos({ categoria: 'ESPOSA (a)' }));
        expect(error).toBeDefined();
        expect(error.details.some((d) => d.path.includes('categoria'))).toBe(true);
    });

    test('acepta Rionegro como capítulo válido de Colombia (regresión: capítulo agregado hoy)', () => {
        const { error } = validateInscripcion(datosValidos({ pais: 'Colombia', capitulo: 'Rionegro' }));
        expect(error).toBeUndefined();
    });

    test('rechaza un capítulo que no pertenece al país seleccionado', () => {
        const { error } = validateInscripcion(datosValidos({ pais: 'Colombia', capitulo: 'Buenos Aires' }));
        expect(error).toBeDefined();
    });

    test('rechaza fechas de llegada fuera del rango del evento (11-13 sept. 2026)', () => {
        const { error } = validateInscripcion(datosValidos({ fecha_llegada: '2026-09-20' }));
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
