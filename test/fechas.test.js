const { formatearRangoFechas } = require('../src/utils/fechas');

describe('formatearRangoFechas', () => {
    test('formatea un rango de varios dias como "MES DD-DD, AAAA"', () => {
        expect(formatearRangoFechas('2026-09-11', '2026-09-13')).toBe('SEP 11-13, 2026');
    });

    test('formatea un solo dia sin rango cuando fecha y fechaFin coinciden', () => {
        expect(formatearRangoFechas('2027-05-01', '2027-05-01')).toBe('MAY 1, 2027');
    });

    test('usa fecha como fechaFin si no se provee fechaFin', () => {
        expect(formatearRangoFechas('2027-05-01')).toBe('MAY 1, 2027');
    });

    test('devuelve cadena vacia si no hay fecha', () => {
        expect(formatearRangoFechas(null, null)).toBe('');
    });
});
