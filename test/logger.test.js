const logger = require('../src/utils/logger');

describe('logger (JSON lines estructurado)', () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test('info() escribe una línea JSON válida con level/message/timestamp', () => {
        logger.info('mensaje de prueba', { userId: 42 });

        const linea = consoleLogSpy.mock.calls[0][0];
        const parsed = JSON.parse(linea);

        expect(parsed.level).toBe('info');
        expect(parsed.message).toBe('mensaje de prueba');
        expect(parsed.userId).toBe(42);
        expect(parsed.timestamp).toEqual(expect.any(String));
    });

    test('error() serializa instancias de Error a message/stack', () => {
        logger.error('algo falló', { error: new Error('boom') });

        const parsed = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
        expect(parsed.level).toBe('error');
        expect(parsed.error.message).toBe('boom');
        expect(parsed.error.stack).toEqual(expect.any(String));
    });
});
