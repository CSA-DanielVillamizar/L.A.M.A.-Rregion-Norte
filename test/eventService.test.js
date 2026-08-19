// Se mockea la capa de BD para forzar el modo memoria de eventService de forma
// determinista y rápida, sin depender de conectividad real a Azure SQL.
jest.mock('../src/config/database', () => ({
    getPool: jest.fn().mockRejectedValue(new Error('mock: sin BD en tests')),
    sql: {}
}));

const eventService = require('../src/services/eventService');

describe('eventService (modo memoria, sin BD)', () => {
    test('getEventById("vnorte-2026") trae la agenda oficial de 3 días (regresión: ya no la agenda ficticia)', async () => {
        const evento = await eventService.getEventById('vnorte-2026');

        expect(evento).not.toBeNull();
        expect(evento.agenda).toHaveLength(3);

        const textoAgenda = JSON.stringify(evento.agenda);
        expect(textoAgenda).toContain('Villamizar Araque');
        expect(textoAgenda).not.toMatch(/Regata de Veleros|NOCHE BLANCA|Mulas/);
    });

    test('el paquete oficial incluye Cena, Gorra y Brazalete (regresión: ya no Camiseta/Parche)', async () => {
        const evento = await eventService.getEventById('vnorte-2026');

        expect(evento.paqueteOficial.incluye).toEqual(
            expect.arrayContaining(['Cena acto protocolario', 'Gorra', 'Brazalete identificador'])
        );
        expect(evento.paqueteOficial.incluye.join(' ')).not.toMatch(/Camiseta|Parche/);
    });

    test('la ubicación del evento ya no menciona San Antero como co-sede', async () => {
        const evento = await eventService.getEventById('vnorte-2026');
        expect(evento.ubicacion).not.toMatch(/San Antero/);
        expect(evento.ubicacion).toMatch(/Coveñas/);
    });

    test('el evento arranca el viernes 11 de septiembre (fecha de arribo)', async () => {
        const evento = await eventService.getEventById('vnorte-2026');
        expect(evento.fecha).toBe('2026-09-11');
        expect(evento.fechaFin).toBe('2026-09-13');
    });

    test('getEventById devuelve null para un evento inexistente', async () => {
        const evento = await eventService.getEventById('no-existe-2099');
        expect(evento).toBeNull();
    });

    test('getAllEvents incluye el V Campeonato entre los eventos semilla', async () => {
        const eventos = await eventService.getAllEvents();
        expect(eventos.some((e) => e.id === 'vnorte-2026')).toBe(true);
    });
});
