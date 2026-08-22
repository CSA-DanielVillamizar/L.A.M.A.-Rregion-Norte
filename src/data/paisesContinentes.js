/**
 * CAPA DE DOMINIO: Mapa País -> Continente (modelo de 5 continentes)
 * Usado por distanciaService para decidir si dos capítulos comparten
 * continente (distancia terrestre/Google Maps) o no (distancia aérea en
 * línea recta). Debe cubrir exactamente los países de
 * src/data/paisesCapitulos.js.
 */

const PAISES_CONTINENTES = {
    'Alemania': 'Europa',
    'Argentina': 'América',
    'Bolivia': 'América',
    'Brasil': 'América',
    'Canadá': 'América',
    'Chile': 'América',
    'Colombia': 'América',
    'Costa Rica': 'América',
    'Cuba': 'América',
    'República Dominicana': 'América',
    'Ecuador': 'América',
    'Egypto': 'África',
    'España': 'Europa',
    'Honduras': 'América',
    'México': 'América',
    'Nicaragua': 'América',
    'Panamá': 'América',
    'Philipinas': 'Asia',
    'Perú': 'América',
    'Puerto Rico': 'América',
    'Turkia': 'Asia',
    'Uruguay': 'América',
    'USA': 'América',
    'Venezuela': 'América'
};

function obtenerContinente(pais) {
    return PAISES_CONTINENTES[pais] || null;
}

function mismoContinente(paisA, paisB) {
    const continenteA = obtenerContinente(paisA);
    const continenteB = obtenerContinente(paisB);
    return Boolean(continenteA) && continenteA === continenteB;
}

module.exports = { PAISES_CONTINENTES, obtenerContinente, mismoContinente };
