const UbicacionService = require('../services/ubicacionService');

class UbicacionController {
    static async buscarMunicipios(req, res) {
        try {
            const q = req.query?.q || '';
            const limit = req.query?.limit;
            const data = await UbicacionService.buscarMunicipios(q, limit);

            return res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            console.error('Error en UbicacionController.buscarMunicipios:', error);
            return res.status(500).json({
                success: false,
                message: 'No fue posible consultar municipios',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = UbicacionController;
