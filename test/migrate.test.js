const { extraerVersion, listarArchivosMigracion } = require('../scripts/ops/migrate');

describe('scripts/ops/migrate — funciones puras (sin BD)', () => {
    describe('extraerVersion', () => {
        test('toma los primeros 3 caracteres del nombre de archivo como version', () => {
            expect(extraerVersion('001_crear_tabla_x.sql')).toBe('001');
            expect(extraerVersion('042_agregar_columna_y.sql')).toBe('042');
        });
    });

    describe('listarArchivosMigracion', () => {
        test('devuelve arreglo vacio si la carpeta no tiene migraciones aun', () => {
            const archivos = listarArchivosMigracion();
            expect(Array.isArray(archivos)).toBe(true);
        });

        test('solo acepta el patron NNN_descripcion.sql', () => {
            const archivos = listarArchivosMigracion();
            archivos.forEach((nombre) => {
                expect(nombre).toMatch(/^\d{3}_.+\.sql$/);
            });
        });
    });
});
