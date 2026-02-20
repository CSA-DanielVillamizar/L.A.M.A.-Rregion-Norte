require('dotenv').config();
const UbicacionService = require('../src/services/ubicacionService');

async function ejecutar() {
    try {
        const confirmacion = (process.argv[2] || '').trim();
        if (confirmacion !== '--confirmar') {
            console.log('Uso: node scripts/reseed_municipios_catalogo.js --confirmar');
            process.exit(1);
        }

        const resultado = await UbicacionService.resembrarCatalogoMunicipios();
        console.log(JSON.stringify({
            success: true,
            message: 'Catálogo de municipios resembrado exitosamente',
            totalRegistros: resultado.totalRegistros
        }, null, 2));
    } catch (error) {
        console.error('Error en reseed_municipios_catalogo:', error);
        process.exit(1);
    }
}

void ejecutar();
