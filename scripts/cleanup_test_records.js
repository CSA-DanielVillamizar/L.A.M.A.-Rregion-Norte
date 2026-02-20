require('dotenv').config();
const fs = require('fs');
const { getPool, sql } = require('../src/config/database');

async function limpiarRegistrosPrueba() {
    const pool = await getPool();
    const transaccion = new sql.Transaction(pool);
    await transaccion.begin();

    try {
        const resultadoConsulta = await new sql.Request(transaccion).query(`
            SELECT id_registro_pdf, ruta_archivo
            FROM FormulariosNacionalesPDF
            WHERE id_registro_pdf = 4;

            SELECT id_inscripcion, documento_numero
            FROM InscripcionesCampeonato
            WHERE id_inscripcion = 30;
        `);

        const pdfRows = resultadoConsulta.recordsets?.[0] || [];
        const inscripcionRows = resultadoConsulta.recordsets?.[1] || [];
        const rutaPdf = pdfRows[0]?.ruta_archivo || null;

        const resultadoEliminarPdf = await new sql.Request(transaccion).query(`
            DELETE FROM FormulariosNacionalesPDF
            WHERE id_registro_pdf = 4;
        `);

        const resultadoEliminarInscripcion = await new sql.Request(transaccion).query(`
            DELETE FROM InscripcionesCampeonato
            WHERE id_inscripcion = 30;
        `);

        await transaccion.commit();

        let archivoEliminado = false;
        if (rutaPdf && fs.existsSync(rutaPdf)) {
            fs.unlinkSync(rutaPdf);
            archivoEliminado = true;
        }

        console.log(JSON.stringify({
            success: true,
            pdfEncontrado: pdfRows.length,
            inscripcionEncontrada: inscripcionRows.length,
            pdfEliminados: resultadoEliminarPdf.rowsAffected?.[0] || 0,
            inscripcionesEliminadas: resultadoEliminarInscripcion.rowsAffected?.[0] || 0,
            rutaPdf,
            archivoEliminado
        }, null, 2));
    } catch (error) {
        try {
            await transaccion.rollback();
        } catch (rollbackError) {
            console.error('Error en rollback cleanup_test_records:', rollbackError.message);
        }

        console.error('Error en cleanup_test_records:', error);
        process.exit(1);
    }
}

limpiarRegistrosPrueba();
