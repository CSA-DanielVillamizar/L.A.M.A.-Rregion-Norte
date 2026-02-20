const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getPool, sql } = require('../config/database');

const DIRECTORIO_PDF_FORMULARIOS = path.join(process.cwd(), 'storage', 'formularios-pdf');
let tablaPdfAsegurada = false;

const asegurarTablaPdf = async () => {
    if (tablaPdfAsegurada) {
        return;
    }

    const pool = await getPool();
    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FormulariosNacionalesPDF')
        BEGIN
            CREATE TABLE FormulariosNacionalesPDF (
                id_registro_pdf INT IDENTITY(1,1) PRIMARY KEY,
                documento_numero VARCHAR(50) NOT NULL,
                nombres NVARCHAR(150) NULL,
                apellidos NVARCHAR(150) NULL,
                fecha_registro DATETIME2 NOT NULL DEFAULT GETDATE(),
                nombre_archivo NVARCHAR(260) NOT NULL,
                ruta_archivo NVARCHAR(600) NOT NULL,
                tamano_bytes INT NOT NULL,
                hash_sha256 VARCHAR(64) NOT NULL,
                nombre_archivo_matricula NVARCHAR(260) NULL,
                mime_matricula NVARCHAR(120) NULL,
                tamano_matricula_bytes INT NULL,
                contenido_matricula VARBINARY(MAX) NULL,
                nombre_archivo_licencia NVARCHAR(260) NULL,
                mime_licencia NVARCHAR(120) NULL,
                tamano_licencia_bytes INT NULL,
                contenido_licencia VARBINARY(MAX) NULL,
                contenido_pdf VARBINARY(MAX) NOT NULL
            );

            CREATE INDEX IX_FormulariosNacionalesPDF_DocumentoFecha
            ON FormulariosNacionalesPDF(documento_numero, fecha_registro DESC);
        END

        IF COL_LENGTH('FormulariosNacionalesPDF', 'nombre_archivo_matricula') IS NULL
            ALTER TABLE FormulariosNacionalesPDF ADD nombre_archivo_matricula NVARCHAR(260) NULL;

        IF COL_LENGTH('FormulariosNacionalesPDF', 'mime_matricula') IS NULL
            ALTER TABLE FormulariosNacionalesPDF ADD mime_matricula NVARCHAR(120) NULL;

        IF COL_LENGTH('FormulariosNacionalesPDF', 'tamano_matricula_bytes') IS NULL
            ALTER TABLE FormulariosNacionalesPDF ADD tamano_matricula_bytes INT NULL;

        IF COL_LENGTH('FormulariosNacionalesPDF', 'contenido_matricula') IS NULL
            ALTER TABLE FormulariosNacionalesPDF ADD contenido_matricula VARBINARY(MAX) NULL;

        IF COL_LENGTH('FormulariosNacionalesPDF', 'nombre_archivo_licencia') IS NULL
            ALTER TABLE FormulariosNacionalesPDF ADD nombre_archivo_licencia NVARCHAR(260) NULL;

        IF COL_LENGTH('FormulariosNacionalesPDF', 'mime_licencia') IS NULL
            ALTER TABLE FormulariosNacionalesPDF ADD mime_licencia NVARCHAR(120) NULL;

        IF COL_LENGTH('FormulariosNacionalesPDF', 'tamano_licencia_bytes') IS NULL
            ALTER TABLE FormulariosNacionalesPDF ADD tamano_licencia_bytes INT NULL;

        IF COL_LENGTH('FormulariosNacionalesPDF', 'contenido_licencia') IS NULL
            ALTER TABLE FormulariosNacionalesPDF ADD contenido_licencia VARBINARY(MAX) NULL;
    `);

    tablaPdfAsegurada = true;
};

const asegurarDirectorioLocal = async () => {
    await fs.promises.mkdir(DIRECTORIO_PDF_FORMULARIOS, { recursive: true });
};

const normalizarNombreArchivo = (texto) => String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

class PdfRegistroStorageService {
    static async guardarCopia({ body, pdfBuffer, nombreArchivo, adjuntos = {} }) {
        await asegurarTablaPdf();
        await asegurarDirectorioLocal();

        const documento = (body?.identificacion || body?.documento_numero || 'SIN-DOCUMENTO').toString().trim();
        const nombres = (body?.nombres || '').toString().trim();
        const apellidos = (body?.apellidos || '').toString().trim();

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const baseNombre = normalizarNombreArchivo(`${documento}-${nombres}-${apellidos}`) || 'formulario';
        const nombreFinal = `${baseNombre}-${timestamp}.pdf`;
        const rutaArchivo = path.join(DIRECTORIO_PDF_FORMULARIOS, nombreFinal);

        await fs.promises.writeFile(rutaArchivo, pdfBuffer);

        const hashSha256 = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

        const pool = await getPool();
        const request = pool.request();
        request.input('documento_numero', sql.VarChar(50), documento);
        request.input('nombres', sql.NVarChar(150), nombres || null);
        request.input('apellidos', sql.NVarChar(150), apellidos || null);
        request.input('nombre_archivo', sql.NVarChar(260), nombreArchivo || nombreFinal);
        request.input('ruta_archivo', sql.NVarChar(600), rutaArchivo);
        request.input('tamano_bytes', sql.Int, pdfBuffer.length);
        request.input('hash_sha256', sql.VarChar(64), hashSha256);
        request.input('nombre_archivo_matricula', sql.NVarChar(260), adjuntos?.matriculaMoto?.originalname || null);
        request.input('mime_matricula', sql.NVarChar(120), adjuntos?.matriculaMoto?.mimetype || null);
        request.input('tamano_matricula_bytes', sql.Int, Number.isFinite(adjuntos?.matriculaMoto?.size) ? adjuntos.matriculaMoto.size : null);
        request.input('contenido_matricula', sql.VarBinary(sql.MAX), adjuntos?.matriculaMoto?.buffer || null);
        request.input('nombre_archivo_licencia', sql.NVarChar(260), adjuntos?.licenciaConduccion?.originalname || null);
        request.input('mime_licencia', sql.NVarChar(120), adjuntos?.licenciaConduccion?.mimetype || null);
        request.input('tamano_licencia_bytes', sql.Int, Number.isFinite(adjuntos?.licenciaConduccion?.size) ? adjuntos.licenciaConduccion.size : null);
        request.input('contenido_licencia', sql.VarBinary(sql.MAX), adjuntos?.licenciaConduccion?.buffer || null);
        request.input('contenido_pdf', sql.VarBinary(sql.MAX), pdfBuffer);

        const result = await request.query(`
            INSERT INTO FormulariosNacionalesPDF (
                documento_numero,
                nombres,
                apellidos,
                nombre_archivo,
                ruta_archivo,
                tamano_bytes,
                hash_sha256,
                nombre_archivo_matricula,
                mime_matricula,
                tamano_matricula_bytes,
                contenido_matricula,
                nombre_archivo_licencia,
                mime_licencia,
                tamano_licencia_bytes,
                contenido_licencia,
                contenido_pdf
            )
            OUTPUT INSERTED.id_registro_pdf, INSERTED.fecha_registro
            VALUES (
                @documento_numero,
                @nombres,
                @apellidos,
                @nombre_archivo,
                @ruta_archivo,
                @tamano_bytes,
                @hash_sha256,
                @nombre_archivo_matricula,
                @mime_matricula,
                @tamano_matricula_bytes,
                @contenido_matricula,
                @nombre_archivo_licencia,
                @mime_licencia,
                @tamano_licencia_bytes,
                @contenido_licencia,
                @contenido_pdf
            )
        `);

        return {
            idRegistroPdf: result.recordset[0].id_registro_pdf,
            fechaRegistro: result.recordset[0].fecha_registro,
            rutaArchivo,
            hashSha256,
            tamanoBytes: pdfBuffer.length
        };
    }

    static async listarRegistros({ documento, fechaDesde, fechaHasta, limite = 100 } = {}) {
        await asegurarTablaPdf();

        const pool = await getPool();
        const request = pool.request();

        const documentoNormalizado = (documento || '').toString().trim();
        const fechaDesdeNormalizada = fechaDesde ? new Date(fechaDesde) : null;
        const fechaHastaNormalizada = fechaHasta ? new Date(fechaHasta) : null;
        const limiteSeguro = Number.isFinite(parseInt(limite, 10))
            ? Math.max(1, Math.min(parseInt(limite, 10), 500))
            : 100;

        request.input('documento_numero', sql.VarChar(50), documentoNormalizado || null);
        request.input('fecha_desde', sql.DateTime2, fechaDesdeNormalizada && !Number.isNaN(fechaDesdeNormalizada.getTime()) ? fechaDesdeNormalizada : null);
        request.input('fecha_hasta', sql.DateTime2, fechaHastaNormalizada && !Number.isNaN(fechaHastaNormalizada.getTime()) ? fechaHastaNormalizada : null);
        request.input('limite', sql.Int, limiteSeguro);

        const result = await request.query(`
            SELECT TOP (@limite)
                id_registro_pdf AS idRegistroPdf,
                documento_numero AS documento,
                nombres,
                apellidos,
                fecha_registro AS fechaRegistro,
                nombre_archivo AS nombreArchivo,
                ruta_archivo AS rutaArchivo,
                tamano_bytes AS tamanoBytes,
                hash_sha256 AS hashSha256,
                nombre_archivo_matricula AS nombreArchivoMatricula,
                mime_matricula AS mimeMatricula,
                tamano_matricula_bytes AS tamanoMatriculaBytes,
                nombre_archivo_licencia AS nombreArchivoLicencia,
                mime_licencia AS mimeLicencia,
                tamano_licencia_bytes AS tamanoLicenciaBytes
            FROM FormulariosNacionalesPDF
            WHERE
                (@documento_numero IS NULL OR documento_numero = @documento_numero)
                AND (@fecha_desde IS NULL OR fecha_registro >= @fecha_desde)
                AND (@fecha_hasta IS NULL OR fecha_registro <= @fecha_hasta)
            ORDER BY fecha_registro DESC, id_registro_pdf DESC
        `);

        return result.recordset;
    }

    static async obtenerRegistroPorId(idRegistroPdf) {
        await asegurarTablaPdf();

        const pool = await getPool();
        const request = pool.request();
        request.input('id_registro_pdf', sql.Int, idRegistroPdf);

        const result = await request.query(`
            SELECT TOP 1
                id_registro_pdf AS idRegistroPdf,
                documento_numero AS documento,
                nombres,
                apellidos,
                fecha_registro AS fechaRegistro,
                nombre_archivo AS nombreArchivo,
                ruta_archivo AS rutaArchivo,
                tamano_bytes AS tamanoBytes,
                hash_sha256 AS hashSha256,
                nombre_archivo_matricula AS nombreArchivoMatricula,
                mime_matricula AS mimeMatricula,
                tamano_matricula_bytes AS tamanoMatriculaBytes,
                contenido_matricula AS contenidoMatricula,
                nombre_archivo_licencia AS nombreArchivoLicencia,
                mime_licencia AS mimeLicencia,
                tamano_licencia_bytes AS tamanoLicenciaBytes,
                contenido_licencia AS contenidoLicencia,
                contenido_pdf AS contenidoPdf
            FROM FormulariosNacionalesPDF
            WHERE id_registro_pdf = @id_registro_pdf
        `);

        if (!result.recordset.length) {
            return null;
        }

        return result.recordset[0];
    }

    static async obtenerAdjuntoPorIdYTipo(idRegistroPdf, tipoAdjunto) {
        await asegurarTablaPdf();

        const tipoNormalizado = String(tipoAdjunto || '').toLowerCase();
        if (!['matricula', 'licencia'].includes(tipoNormalizado)) {
            return null;
        }

        const pool = await getPool();
        const request = pool.request();
        request.input('id_registro_pdf', sql.Int, idRegistroPdf);

        const consulta = tipoNormalizado === 'matricula'
            ? `
                SELECT TOP 1
                    id_registro_pdf AS idRegistroPdf,
                    documento_numero AS documento,
                    nombre_archivo_matricula AS nombreArchivo,
                    mime_matricula AS mimeTipo,
                    tamano_matricula_bytes AS tamanoBytes,
                    contenido_matricula AS contenidoAdjunto
                FROM FormulariosNacionalesPDF
                WHERE id_registro_pdf = @id_registro_pdf
            `
            : `
                SELECT TOP 1
                    id_registro_pdf AS idRegistroPdf,
                    documento_numero AS documento,
                    nombre_archivo_licencia AS nombreArchivo,
                    mime_licencia AS mimeTipo,
                    tamano_licencia_bytes AS tamanoBytes,
                    contenido_licencia AS contenidoAdjunto
                FROM FormulariosNacionalesPDF
                WHERE id_registro_pdf = @id_registro_pdf
            `;

        const result = await request.query(consulta);
        if (!result.recordset.length) {
            return null;
        }

        const registro = result.recordset[0];
        if (!registro.contenidoAdjunto || !registro.nombreArchivo) {
            return null;
        }

        return registro;
    }
}

module.exports = PdfRegistroStorageService;
