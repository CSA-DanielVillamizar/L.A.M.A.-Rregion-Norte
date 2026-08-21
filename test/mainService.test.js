// getHomeData ahora trae hoteles/destinos turisticos desde la BD (antes
// hardcodeados en home.ejs). Se mockea el modelo para probar el resto del
// contenido sin depender de una conexion real a Azure SQL.
jest.mock('../src/models/contenidoTuristicoModel', () => ({
    getHoteles: jest.fn().mockResolvedValue([]),
    getDestinos: jest.fn().mockResolvedValue([])
}));

const mainService = require('../src/services/mainService');
const capitulosService = require('../src/services/capitulosService');

describe('mainService.getHomeData', () => {
    test('el contador de capítulos coincide dinámicamente con capitulosService (regresión: no debe volver a quedar hardcodeado)', async () => {
        const data = await mainService.getHomeData();
        expect(data.stats.capitulos).toBe(String(capitulosService.getAllCapitulos().length));
    });

    test('las features de "LA EXPERIENCIA" ya no mencionan Jet Skis ni "LUJO/VIP" (contenido retirado)', async () => {
        const data = await mainService.getHomeData();
        const textoCompleto = JSON.stringify(data.features);

        expect(textoCompleto).not.toMatch(/jet\s*ski/i);
        expect(textoCompleto).not.toMatch(/VIP/i);
    });

    test('devuelve exactamente 3 features, cada una con icon/title/description', async () => {
        const data = await mainService.getHomeData();
        expect(data.features).toHaveLength(3);
        data.features.forEach((feature) => {
            expect(feature).toEqual(expect.objectContaining({
                icon: expect.any(String),
                title: expect.any(String),
                description: expect.any(String)
            }));
        });
    });

    test('incluye hoteles y destinosTuristicos como arreglos', async () => {
        const data = await mainService.getHomeData();
        expect(Array.isArray(data.hoteles)).toBe(true);
        expect(Array.isArray(data.destinosTuristicos)).toBe(true);
    });
});
