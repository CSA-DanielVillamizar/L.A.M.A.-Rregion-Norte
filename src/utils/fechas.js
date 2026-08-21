const MESES_ES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

/**
 * Formatea un rango de fechas tipo "SEP 11-13, 2026" (o "SEP 11, 2026"
 * si es un solo día), a partir de fechas en formato YYYY-MM-DD.
 */
function formatearRangoFechas(fecha, fechaFin) {
    if (!fecha) return '';
    const inicio = new Date(`${fecha}T12:00:00`);
    const fin = fechaFin ? new Date(`${fechaFin}T12:00:00`) : inicio;
    const mes = MESES_ES[inicio.getMonth()];
    const anio = inicio.getFullYear();

    if (inicio.getDate() === fin.getDate()) {
        return `${mes} ${inicio.getDate()}, ${anio}`;
    }
    return `${mes} ${inicio.getDate()}-${fin.getDate()}, ${anio}`;
}

module.exports = { formatearRangoFechas };
