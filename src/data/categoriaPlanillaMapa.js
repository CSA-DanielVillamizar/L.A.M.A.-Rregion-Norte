/**
 * CAPA DE DOMINIO: Mapeo de tipo_participante -> columnas de la planilla de
 * asistencia LAMA (formato oficial "REGISTRO DE ASISTENCIA A EVENTOS").
 *
 * Reglas de negocio confirmadas con el club:
 * - FULL COLOR MEMBER y PROSPECTO (sin la variante DAMA L.A.M.A.) son
 *   siempre hombres -> columna Hombre.
 * - DAMA L.A.M.A. (Full Color o Prospecto) son siempre mujeres -> columna Dama.
 * - Asociado, Honorario, Retirado e Hijo(a) no tienen distinción de género
 *   en el formulario de registro -> se listan siempre en la columna Hombre
 *   (no representa el género real de la persona, es solo dónde imprime la
 *   plantilla el código de categoría).
 * - Invitado(a) y Esposa(o) no son "Miembro" LAMA: no llevan código en
 *   Hombre/Dama, solo marcan su sub-columna correspondiente en Invitados o
 *   Cónyuge (chaleco).
 */

const CATEGORIA_PLANILLA_MAPA = {
    'MIEMBRO FULL COLOR (FCM)': { columnaMiembro: 'hombre', codigo: 'FCM' },
    'PROSPECTO (P)': { columnaMiembro: 'hombre', codigo: 'P' },
    'DAMA L.A.M.A. - FULL COLOR (FCM)': { columnaMiembro: 'dama', codigo: 'FCM' },
    'DAMA L.A.M.A. - PROSPECTO (P)': { columnaMiembro: 'dama', codigo: 'P' },
    'ASOCIADO (A) (ASC)': { columnaMiembro: 'hombre', codigo: 'ASC', invitadoSubcolumna: 'assoc' },
    'MIEMBRO HONORARIO (HNR)': { columnaMiembro: 'hombre', codigo: 'HNR' },
    'MIEMBRO RETIRADO (RTR)': { columnaMiembro: 'hombre', codigo: 'RTR' },
    'HIJO (A) (H)': { columnaMiembro: 'hombre', codigo: 'H', invitadoSubcolumna: 'hijos' },
    'INVITADO (A) (I)': { columnaMiembro: null, codigo: null, invitadoSubcolumna: 'invitado' },
    'ESPOSA (O)': { columnaMiembro: null, codigo: null, conyuge: true }
};

function obtenerMapeoCategoria(tipoParticipante) {
    return CATEGORIA_PLANILLA_MAPA[tipoParticipante] || { columnaMiembro: null, codigo: null };
}

module.exports = { CATEGORIA_PLANILLA_MAPA, obtenerMapeoCategoria };
