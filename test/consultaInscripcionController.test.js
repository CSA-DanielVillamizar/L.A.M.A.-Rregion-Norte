// Portal público "Buscar mi inscripción": se mockea InscripcionModel para
// probar la lógica del controlador (validación, códigos de estado, mensajes)
// sin depender de una conexión real a Azure SQL.
jest.mock('../src/models/inscripcionModel', () => ({
    InscripcionModel: {
        buscarPorIdentificador: jest.fn(),
        actualizarComprobante: jest.fn(),
        asignarQrToken: jest.fn()
    }
}));

jest.mock('../src/services/qrService', () => ({
    construirUrlValidacion: jest.fn(() => 'https://ejemplo.test/checkin/validar/token-fake'),
    generarImagenQrDataUrl: jest.fn(() => Promise.resolve('data:image/png;base64,FAKE'))
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

    test('rechaza con 400 si falta el identificador', async () => {
        const req = { body: { identificador: '' } };
        const res = crearRes();

        await controller.buscarInscripcion(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(InscripcionModel.buscarPorIdentificador).not.toHaveBeenCalled();
    });

    test('responde 404 con mensaje genérico cuando no hay coincidencia', async () => {
        InscripcionModel.buscarPorIdentificador.mockResolvedValue(null);
        const req = { body: { identificador: 'nadie@test.com' } };
        const res = crearRes();

        await controller.buscarInscripcion(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json.mock.calls[0][0].success).toBe(false);
    });

    test('responde 200 con la inscripción y su QR cuando el documento coincide', async () => {
        InscripcionModel.buscarPorIdentificador.mockResolvedValue({
            id_inscripcion: 7,
            nombre_completo: 'Juan Pérez',
            estado_validacion: 'Pendiente',
            tiene_comprobante: false
        });
        InscripcionModel.asignarQrToken.mockResolvedValue('token-fake');
        const req = { body: { identificador: '123456' } };
        const res = crearRes();

        await controller.buscarInscripcion(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json.mock.calls[0][0].inscripcion.nombre_completo).toBe('Juan Pérez');
        expect(res.json.mock.calls[0][0].inscripcion.qr_data_url).toBe('data:image/png;base64,FAKE');
        expect(res.json.mock.calls[0][0].inscripcion.id_inscripcion).toBeUndefined();
        expect(InscripcionModel.buscarPorIdentificador).toHaveBeenCalledWith('123456');
        expect(InscripcionModel.asignarQrToken).toHaveBeenCalledWith(7);
    });

    test('responde 200 con la inscripción cuando el email coincide', async () => {
        InscripcionModel.buscarPorIdentificador.mockResolvedValue({
            id_inscripcion: 8,
            nombre_completo: 'Juan Pérez',
            estado_validacion: 'Aprobado',
            tiene_comprobante: true
        });
        InscripcionModel.asignarQrToken.mockResolvedValue('token-fake-2');
        const req = { body: { identificador: 'juan@test.com' } };
        const res = crearRes();

        await controller.buscarInscripcion(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(InscripcionModel.buscarPorIdentificador).toHaveBeenCalledWith('juan@test.com');
    });
});

describe('consultaInscripcionController.subirComprobante', () => {
    afterEach(() => jest.clearAllMocks());

    test('rechaza con 400 si no hay archivo adjunto', async () => {
        const req = { body: { identificador: '123456' }, file: undefined };
        const res = crearRes();

        await controller.subirComprobante(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(InscripcionModel.actualizarComprobante).not.toHaveBeenCalled();
    });

    test('responde 404 si el identificador no coincide con ningún registro', async () => {
        InscripcionModel.actualizarComprobante.mockResolvedValue(null);
        const req = {
            body: { identificador: '123456' },
            file: { originalname: 'pago.pdf', mimetype: 'application/pdf', size: 1000, buffer: Buffer.from('x') }
        };
        const res = crearRes();

        await controller.subirComprobante(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    test('responde 200 y pasa el identificador a InscripcionModel.actualizarComprobante', async () => {
        InscripcionModel.actualizarComprobante.mockResolvedValue({ id_inscripcion: 1 });
        const req = {
            body: { identificador: 'juan@test.com' },
            file: { originalname: 'pago.pdf', mimetype: 'application/pdf', size: 1000, buffer: Buffer.from('x') }
        };
        const res = crearRes();

        await controller.subirComprobante(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(InscripcionModel.actualizarComprobante).toHaveBeenCalledWith(
            'juan@test.com',
            expect.objectContaining({ nombreArchivo: 'pago.pdf' })
        );
    });
});
