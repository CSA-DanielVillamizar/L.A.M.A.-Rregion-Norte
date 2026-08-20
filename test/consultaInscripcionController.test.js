// Portal público "Buscar mi inscripción": se mockea InscripcionModel para
// probar la lógica del controlador (validación, códigos de estado, mensajes)
// sin depender de una conexión real a Azure SQL.
jest.mock('../src/models/inscripcionModel', () => ({
    InscripcionModel: {
        buscarConVerificacion: jest.fn(),
        actualizarComprobante: jest.fn()
    }
}));

const { InscripcionModel } = require('../src/models/inscripcionModel');
const controller = require('../src/controllers/consultaInscripcionController');

function crearRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('consultaInscripcionController.buscarInscripcion', () => {
    afterEach(() => jest.clearAllMocks());

    test('rechaza con 400 si falta documento o email', async () => {
        const req = { body: { documento: '', email: '' } };
        const res = crearRes();

        await controller.buscarInscripcion(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(InscripcionModel.buscarConVerificacion).not.toHaveBeenCalled();
    });

    test('responde 404 con mensaje genérico cuando no hay coincidencia (no revela cuál dato falló)', async () => {
        InscripcionModel.buscarConVerificacion.mockResolvedValue(null);
        const req = { body: { documento: '123456', email: 'nadie@test.com' } };
        const res = crearRes();

        await controller.buscarInscripcion(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        const payload = res.json.mock.calls[0][0];
        expect(payload.success).toBe(false);
        expect(payload.message).not.toMatch(/documento inválido|email inválido/i);
    });

    test('responde 200 con la inscripción cuando documento+email coinciden', async () => {
        InscripcionModel.buscarConVerificacion.mockResolvedValue({
            nombre_completo: 'Juan Pérez',
            tiene_comprobante: false
        });
        const req = { body: { documento: '123456', email: 'juan@test.com' } };
        const res = crearRes();

        await controller.buscarInscripcion(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json.mock.calls[0][0].inscripcion.nombre_completo).toBe('Juan Pérez');
    });
});

describe('consultaInscripcionController.subirComprobante', () => {
    afterEach(() => jest.clearAllMocks());

    test('rechaza con 400 si no hay archivo adjunto', async () => {
        const req = { body: { documento: '123456', email: 'juan@test.com' }, file: undefined };
        const res = crearRes();

        await controller.subirComprobante(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(InscripcionModel.actualizarComprobante).not.toHaveBeenCalled();
    });

    test('responde 404 si documento+email no coinciden con ningún registro', async () => {
        InscripcionModel.actualizarComprobante.mockResolvedValue(null);
        const req = {
            body: { documento: '123456', email: 'juan@test.com' },
            file: { originalname: 'pago.pdf', mimetype: 'application/pdf', size: 1000, buffer: Buffer.from('x') }
        };
        const res = crearRes();

        await controller.subirComprobante(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('responde 200 y pasa documento+email a InscripcionModel.actualizarComprobante', async () => {
        InscripcionModel.actualizarComprobante.mockResolvedValue({ id_inscripcion: 1 });
        const req = {
            body: { documento: '123456', email: 'juan@test.com' },
            file: { originalname: 'pago.pdf', mimetype: 'application/pdf', size: 1000, buffer: Buffer.from('x') }
        };
        const res = crearRes();

        await controller.subirComprobante(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(InscripcionModel.actualizarComprobante).toHaveBeenCalledWith(
            '123456',
            'juan@test.com',
            expect.objectContaining({ nombreArchivo: 'pago.pdf' })
        );
    });
});
