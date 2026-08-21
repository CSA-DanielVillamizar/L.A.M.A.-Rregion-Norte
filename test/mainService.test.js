// getHomeData ahora trae hoteles/destinos turisticos y el evento
// "destacado" desde la BD (antes hardcodeados en home.ejs). Se mockean
// el modelo y el servicio de eventos para probar el resto del contenido
// sin depender de una conexion real a Azure SQL.
jest.mock('../src/models/contenidoTuristicoModel', () => ({
    getHoteles: jest.fn().mockResolvedValue([]),
    getDestinos: jest.fn().mockResolvedValue([])
}));

jest.mock('../src/services/eventService', () => ({
    getAllEvents: jest.fn().mockResolvedValue([
        {
            id: 'vnorte-2026',
            nombre: 'V Campeonato Región Norte 2026',
            ubicacion: 'Golfo de Morrosquillo · Coveñas, Colombia',
            fecha: '2026-09-11',
            fechaFin: '2026-09-13',
            destacado: true
        }
    ])
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

    test('el hero toma titulo/ubicacion/fecha del evento destacado (regresion: ya no queda fijo)', async () => {
        const data = await mainService.getHomeData();
        expect(data.eventoActivo.id).toBe('vnorte-2026');
        expect(data.hero.title).toBe('V Campeonato Región Norte 2026');
        expect(data.hero.location).toBe('Golfo de Morrosquillo · Coveñas, Colombia');
        expect(data.hero.eventDate).toBe('SEP 11-13, 2026');
    });
});
