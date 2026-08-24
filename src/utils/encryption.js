/**
 * CAPA DE INFRAESTRUCTURA: Cifrado de PII en reposo (AES-256-GCM)
 *
 * Protege campos sensibles de InscripcionesCampeonato (condición médica,
 * contacto de emergencia, EPS, teléfono) que solo se leen/muestran, nunca
 * se buscan por igualdad en SQL — por eso no requieren cifrado
 * determinístico. La llave vive fuera del repo, en la variable de entorno
 * PII_ENCRYPTION_KEY (Application Setting en Azure App Service).
 *
 * Formato de almacenamiento: "v1:<iv-base64>:<authTag-base64>:<ciphertext-base64>"
 * El prefijo "v1:" permite distinguir un valor ya cifrado de texto plano
 * legado durante la migración de datos existentes.
 */

const crypto = require('crypto');
const logger = require('./logger');

const ALGORITMO = 'aes-256-gcm';
const PREFIJO = 'v1:';
const IV_BYTES = 12;

let claveCache = null;

function obtenerClave() {
    if (claveCache) return claveCache;

    const claveBase64 = process.env.PII_ENCRYPTION_KEY;
    if (!claveBase64) {
        throw new Error('PII_ENCRYPTION_KEY no está configurada');
    }

    const clave = Buffer.from(claveBase64, 'base64');
    if (clave.length !== 32) {
        throw new Error('PII_ENCRYPTION_KEY debe decodificar a 32 bytes (AES-256)');
    }

    claveCache = clave;
    return claveCache;
}

/**
 * Cifra un valor de texto. Devuelve null/'' tal cual (no hay nada que
 * proteger), y nunca vuelve a cifrar un valor que ya tiene el prefijo v1:.
 * @param {string|null|undefined} texto
 * @returns {string|null}
 */
function encrypt(texto) {
    if (texto === null || texto === undefined || texto === '') return texto;
    const valor = String(texto);
    if (valor.startsWith(PREFIJO)) return valor;

    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITMO, obtenerClave(), iv);
    const ciphertext = Buffer.concat([cipher.update(valor, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${PREFIJO}${iv.toString('base64')}:${authTag.toString('base64')}:${ciphertext.toString('base64')}`;
}

/**
 * Descifra un valor previamente cifrado con encrypt(). Si el valor no
 * tiene el prefijo v1: (texto plano legado, o vacío) lo devuelve tal cual
 * en vez de lanzar error — así los datos ya migrados y los que están en
 * proceso de migración conviven sin romper la lectura.
 * @param {string|null|undefined} valorAlmacenado
 * @returns {string|null}
 */
function decrypt(valorAlmacenado) {
    if (valorAlmacenado === null || valorAlmacenado === undefined || valorAlmacenado === '') return valorAlmacenado;
    const valor = String(valorAlmacenado);
    if (!valor.startsWith(PREFIJO)) return valor;

    try {
        const [, ivB64, authTagB64, ciphertextB64] = valor.split(':');
        const iv = Buffer.from(ivB64, 'base64');
        const authTag = Buffer.from(authTagB64, 'base64');
        const ciphertext = Buffer.from(ciphertextB64, 'base64');

        const decipher = crypto.createDecipheriv(ALGORITMO, obtenerClave(), iv);
        decipher.setAuthTag(authTag);
        const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return plaintext.toString('utf8');
    } catch (error) {
        logger.error('Error al descifrar valor PII', { error });
        return null;
    }
}

/**
 * @param {string|null|undefined} valor
 * @returns {boolean} true si el valor ya está cifrado (tiene el prefijo v1:)
 */
function estaCifrado(valor) {
    return typeof valor === 'string' && valor.startsWith(PREFIJO);
}

module.exports = { encrypt, decrypt, estaCifrado };
