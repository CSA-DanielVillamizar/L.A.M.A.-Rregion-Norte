require('dotenv').config();
const fs = require('fs');
const { getPool, sql } = require('../src/config/database');

const parseArgs = () => {
    const args = process.argv.slice(2);
    const config = {
        confirmar: false,
        dryRun: false,
        idInscripcion: null,
        idRegistroPdf: null
    };

    for (const arg of args) {
        if (arg === '--confirmar') {
            config.confirmar = true;
            continue;
        }

        if (arg === '--dry-run') {
            config.dryRun = true;
            continue;
        }

        if (arg.startsWith('--inscripcion=')) {
            const valor = Number.parseInt(arg.split('=')[1], 10);
            if (Number.isFinite(valor) && valor > 0) {
                config.idInscripcion = valor;
            }
            continue;
        }

        if (arg.startsWith('--pdf=')) {
            const valor = Number.parseInt(arg.split('=')[1], 10);
            if (Number.isFinite(valor) && valor > 0) {
                config.idRegistroPdf = valor;
            }
        }
    }

    return config;
};

async function ejecutarLimpiezaParametrizada() {
    const { confirmar, dryRun, idInscripcion, idRegistroPdf } = parseArgs();

    if (!confirmar) {
        console.error('Uso: node scripts/cleanup_records_by_id.js --confirmar [--dry-run] [--inscripcion=<id>] [--pdf=<id>]');
        process.exit(1);
    }

    if (!idInscripcion && !idRegistroPdf) {
        console.error('Debes enviar al menos un identificador: --inscripcion=<id> o --pdf=<id>.');
        process.exit(1);
    }

    const pool = await getPool();
    const transaccion = new sql.Transaction(pool);
    await transaccion.begin();

    try {
        let rutaPdf = null;
        let pdfEncontrado = 0;
        let inscripcionEncontrada = 0;
        let pdfEliminados = 0;
        let inscripcionesEliminadas = 0;

        if (idRegistroPdf) {
            const consultaPdf = await new sql.Request(transaccion)
                .input('id_registro_pdf', sql.Int, idRegistroPdf)
                .query(`
                    SELECT id_registro_pdf, ruta_archivo
                    FROM FormulariosNacionalesPDF
                    WHERE id_registro_pdf = @id_registro_pdf;
                `);

            const filasPdf = consultaPdf.recordset || [];
            pdfEncontrado = filasPdf.length;
            rutaPdf = filasPdf[0]?.ruta_archivo || null;

            if (dryRun) {
                pdfEliminados = pdfEncontrado;
            } else {
                const eliminarPdf = await new sql.Request(transaccion)
                    .input('id_registro_pdf', sql.Int, idRegistroPdf)
                    .query(`
                        DELETE FROM FormulariosNacionalesPDF
                        WHERE id_registro_pdf = @id_registro_pdf;
                    `);

                pdfEliminados = eliminarPdf.rowsAffected?.[0] || 0;
            }
        }

        if (idInscripcion) {
            const consultaInscripcion = await new sql.Request(transaccion)
                .input('id_inscripcion', sql.Int, idInscripcion)
                .query(`
                    SELECT id_inscripcion, documento_numero
                    FROM InscripcionesCampeonato
                    WHERE id_inscripcion = @id_inscripcion;
                `);

            inscripcionEncontrada = (consultaInscripcion.recordset || []).length;

            if (dryRun) {
                inscripcionesEliminadas = inscripcionEncontrada;
            } else {
                const eliminarInscripcion = await new sql.Request(transaccion)
                    .input('id_inscripcion', sql.Int, idInscripcion)
                    .query(`
                        DELETE FROM InscripcionesCampeonato
                        WHERE id_inscripcion = @id_inscripcion;
                    `);

                inscripcionesEliminadas = eliminarInscripcion.rowsAffected?.[0] || 0;
            }
        }

        if (dryRun) {
            await transaccion.rollback();
        } else {
            await transaccion.commit();
        }

        let archivoPdfEliminado = false;
        if (!dryRun && rutaPdf && fs.existsSync(rutaPdf)) {
            fs.unlinkSync(rutaPdf);
            archivoPdfEliminado = true;
        }

        console.log(JSON.stringify({
            success: true,
            parametros: {
                idInscripcion,
                idRegistroPdf,
                dryRun
            },
            resultado: {
                pdfEncontrado,
                inscripcionEncontrada,
                pdfEliminados,
                inscripcionesEliminadas,
                rutaPdf,
                archivoPdfEliminado
            }
        }, null, 2));
    } catch (error) {
        try {
            await transaccion.rollback();
        } catch (rollbackError) {
            console.error('Error en rollback cleanup_records_by_id:', rollbackError.message);
        }

        console.error('Error en cleanup_records_by_id:', error);
        process.exit(1);
    }
}

void ejecutarLimpiezaParametrizada();
