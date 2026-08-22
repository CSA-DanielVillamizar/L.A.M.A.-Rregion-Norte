/**
 * CAPA DE DOMINIO: Cálculo de distancia entre capítulo y evento para las
 * planillas de asistencia (campo "Distancia Evento según LAMA-IMA distance
 * system").
 *
 * Regla de negocio (definida por el club): si el capítulo de origen y el
 * evento quedan en el mismo continente, la distancia es la de viaje por
 * carretera (se usa Google Maps Distance Matrix API, en millas). Si quedan
 * en continentes distintos, se asume viaje en avión y se usa la distancia
 * en línea recta (fórmula de Haversine), que es el estándar de millas
 * aéreas. La línea recta también se usa como respaldo automático si Google
 * Maps no puede calcular una ruta (islas, tramos sin carretera como el Tapón
 * del Darién, o si no hay API key configurada todavía).
 */

const logger = require('../utils/logger');
const { mismoContinente } = require('../data/paisesContinentes');

const KM_A_MILLAS = 0.621371;
const RADIO_TIERRA_KM = 6371;

/**
 * Distancia en línea recta entre dos puntos (fórmula de Haversine).
 * @returns {number} Millas
 */
function calcularDistanciaLineaRecta(origen, destino) {
    const radianes = (grados) => (grados * Math.PI) / 180;

    const dLat = radianes(destino.lat - origen.lat);
    const dLng = radianes(destino.lng - origen.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(radianes(origen.lat)) * Math.cos(radianes(destino.lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaKm = RADIO_TIERRA_KM * c;

    return distanciaKm * KM_A_MILLAS;
}

/**
 * Distancia real por carretera vía Google Maps Distance Matrix API.
 * @returns {Promise<number|null>} Millas, o null si la API no está
 * configurada o no pudo calcular una ruta.
 */
async function calcularDistanciaGoogleMaps(origen, destino) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    try {
        const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
        url.searchParams.set('origins', `${origen.lat},${origen.lng}`);
        url.searchParams.set('destinations', `${destino.lat},${destino.lng}`);
        url.searchParams.set('units', 'imperial');
        url.searchParams.set('key', apiKey);

        const respuesta = await fetch(url.toString());
        const datos = await respuesta.json();

        const elemento = datos?.rows?.[0]?.elements?.[0];
        if (datos.status !== 'OK' || !elemento || elemento.status !== 'OK') {
            logger.warn('Google Maps Distance Matrix no encontró ruta, se usará línea recta', {
                status: datos.status,
                elementoStatus: elemento?.status
            });
            return null;
        }

        // distance.value viene en metros incluso con units=imperial
        const metros = elemento.distance.value;
        return metros / 1000 * KM_A_MILLAS;
    } catch (error) {
        logger.error('Error al consultar Google Maps Distance Matrix API', { error });
        return null;
    }
}

/**
 * Calcula la distancia en millas entre un capítulo y la sede de un evento.
 * @param {{lat: number, lng: number, pais: string}} origen - Coordenadas de la alcaldía del capítulo
 * @param {{lat: number, lng: number, pais: string}} destino - Coordenadas de la sede del evento
 * @returns {Promise<number|null>} Millas redondeadas al entero más cercano, o null si faltan coordenadas
 */
async function calcularDistanciaMillas(origen, destino) {
    if (!origen || !destino) return null;
    if (!Number.isFinite(origen.lat) || !Number.isFinite(origen.lng)) return null;
    if (!Number.isFinite(destino.lat) || !Number.isFinite(destino.lng)) return null;

    const puedeUsarCarretera = mismoContinente(origen.pais, destino.pais);

    let millas = null;
    if (puedeUsarCarretera) {
        millas = await calcularDistanciaGoogleMaps(origen, destino);
    }

    if (millas === null) {
        millas = calcularDistanciaLineaRecta(origen, destino);
    }

    return Math.round(millas);
}

module.exports = {
    calcularDistanciaMillas,
    calcularDistanciaLineaRecta,
    calcularDistanciaGoogleMaps
};
