/**
 * CAPA DE DOMINIO: Generación de códigos QR para el check-in de participantes
 * El QR encierra únicamente un token opaco (sin datos personales) que se
 * resuelve contra la base de datos en el punto de control MTO.
 */

const QRCode = require('qrcode');

/**
 * Resuelve la URL base pública de la app. Usa APP_BASE_URL si está definida
 * (recomendado detrás de balanceadores/App Service); si no, la deriva de la
 * request entrante.
 * @param {import('express').Request} req
 * @returns {string}
 */
function resolveBaseUrl(req) {
    if (process.env.APP_BASE_URL) {
        return process.env.APP_BASE_URL.replace(/\/+$/, '');
    }
    return `${req.protocol}://${req.get('host')}`;
}

/**
 * Construye la URL que el punto de control MTO abrirá al escanear el QR.
 * @param {import('express').Request} req
 * @param {string} token
 * @returns {string}
 */
function construirUrlValidacion(req, token) {
    return `${resolveBaseUrl(req)}/checkin/validar/${token}`;
}

/**
 * Genera la imagen del QR como Data URL (PNG) lista para <img src="...">
 * @param {string} texto - Contenido a codificar (la URL de validación)
 * @returns {Promise<string>}
 */
async function generarImagenQrDataUrl(texto) {
    return QRCode.toDataURL(texto, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: {
            dark: '#0A0A0A',
            light: '#F5F5DC'
        }
    });
}

module.exports = {
    resolveBaseUrl,
    construirUrlValidacion,
    generarImagenQrDataUrl
};
