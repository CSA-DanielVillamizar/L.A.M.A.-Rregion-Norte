/**
 * CAPA DE PRESENTACIÓN: Generador de PDF de la planilla de asistencia LAMA
 * ("REGISTRO DE ASISTENCIA A EVENTOS"), a partir de los datos ya ensamblados
 * por planillaAsistenciaService. Replica el formato oficial del club:
 * encabezado, tabla de oficiales asistentes, tabla de inscripciones y caja
 * de totales/distancia.
 */

const PDFDocument = require('pdfkit');

const CARGOS_OFICIALES = [
    'Oficial Regional',
    'Oficial Int/Cont/Nac/Reg',
    'Presidente',
    'Vice Presidente',
    'Tesorero',
    'Gerente Negocios',
    'Secretario',
    'Oficial de Mototurismo'
];

function formatearFecha(valor) {
    if (!valor) return '';
    const fecha = new Date(`${valor}T12:00:00`);
    if (Number.isNaN(fecha.getTime())) return String(valor);
    return fecha.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

function dibujarCelda(doc, texto, x, y, ancho, alto, opciones = {}) {
    doc.rect(x, y, ancho, alto).strokeColor('#999999').lineWidth(0.5).stroke();
    if (texto) {
        doc.font(opciones.bold ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(opciones.fontSize || 8)
            .fillColor('#000000')
            .text(String(texto), x + 3, y + (alto - (opciones.fontSize || 8)) / 2 - 1, {
                width: ancho - 6,
                align: opciones.align || 'left'
            });
    }
}

function generarPdfPlanilla(datos) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'LETTER', margin: 36 });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            const anchoContenido = doc.page.width - 72;
            let y = 40;

            // ENCABEZADO
            doc.font('Helvetica-Bold').fontSize(16).fillColor('#000000')
                .text('LATIN AMERICAN MOTORCYCLE ASSOC. — L.A.M.A.', 36, y, { width: anchoContenido, align: 'center' });
            y += 20;
            doc.font('Helvetica-Bold').fontSize(11)
                .text('REGISTRO DE ASISTENCIA A EVENTOS', 36, y, { width: anchoContenido, align: 'center' });
            y += 26;

            doc.font('Helvetica-Bold').fontSize(9).text('CAPÍTULO/CLUB: ', 36, y, { continued: true })
                .font('Helvetica').text(`${datos.capitulo} (${datos.pais || 'País no definido'})`);
            y += 14;
            doc.font('Helvetica-Bold').text('Nombre Evento: ', 36, y, { continued: true })
                .font('Helvetica').text(String(datos.evento.nombre || '').toUpperCase());
            y += 14;
            doc.font('Helvetica-Bold').text('Ubicación: ', 36, y, { continued: true })
                .font('Helvetica').text(datos.evento.ubicacion || '');
            y += 14;
            doc.font('Helvetica-Bold').text('Fecha: ', 36, y, { continued: true })
                .font('Helvetica').text(
                    datos.evento.fechaFin && datos.evento.fechaFin !== datos.evento.fecha
                        ? `${formatearFecha(datos.evento.fecha)} al ${formatearFecha(datos.evento.fechaFin)}`
                        : formatearFecha(datos.evento.fecha)
                );
            y += 22;

            // TABLA OFICIALES ASISTENTES
            doc.font('Helvetica-Bold').fontSize(10).text('Oficiales asistentes', 36, y);
            y += 14;

            const colCargoAncho = anchoContenido - 60 - 60 - 60;
            const filaAlto = 16;
            dibujarCelda(doc, 'Cargo / Nombre', 36, y, colCargoAncho, filaAlto, { bold: true });
            dibujarCelda(doc, 'Hombre', 36 + colCargoAncho, y, 60, filaAlto, { bold: true, align: 'center' });
            dibujarCelda(doc, 'Dama', 36 + colCargoAncho + 60, y, 60, filaAlto, { bold: true, align: 'center' });
            dibujarCelda(doc, 'M C A', 36 + colCargoAncho + 120, y, 60, filaAlto, { bold: true, align: 'center' });
            y += filaAlto;

            for (const cargo of CARGOS_OFICIALES) {
                const oficial = datos.oficiales.find((o) => o.cargo === cargo);
                const nombre = oficial?.nombre ? `${cargo}: ${oficial.nombre}` : `${cargo}:`;
                dibujarCelda(doc, nombre, 36, y, colCargoAncho, filaAlto);
                dibujarCelda(doc, oficial?.asistio && oficial.columnaMiembro === 'hombre' ? oficial.codigo : '', 36 + colCargoAncho, y, 60, filaAlto, { align: 'center' });
                dibujarCelda(doc, oficial?.asistio && oficial.columnaMiembro === 'dama' ? oficial.codigo : '', 36 + colCargoAncho + 60, y, 60, filaAlto, { align: 'center' });
                dibujarCelda(doc, oficial?.asistio ? oficial.vehiculo || '' : '', 36 + colCargoAncho + 120, y, 60, filaAlto, { align: 'center' });
                y += filaAlto;
            }

            y += 6;
            doc.font('Helvetica').fontSize(6.5).fillColor('#333333').text(
                'FCM = Miembro Full Color · P = Prospecto o Probante · ASC = Miembro Asociado · HNR = Miembro Honorario · RTR = Miembro Retirado · M = Moto · C = Carro · A = Avión',
                36, y, { width: anchoContenido }
            );
            y += 18;

            // TABLA INSCRIPCIONES
            doc.font('Helvetica-Bold').fontSize(10).fillColor('#000000').text('Inscripciones', 36, y);
            y += 14;

            const colAncho = {
                num: 22,
                nombre: anchoContenido - 22 - 32 - 32 - 32 - 40 - 32 - 32 - 32 - 40,
                hombre: 32,
                dama: 32,
                mca: 32,
                conyuge: 40,
                hijos: 32,
                assoc: 32,
                invitado: 32,
                miembroDia: 40
            };

            const dibujarEncabezadoRoster = () => {
                let x = 36;
                dibujarCelda(doc, '#', x, y, colAncho.num, filaAlto, { bold: true, align: 'center' }); x += colAncho.num;
                dibujarCelda(doc, 'Nombre del Miembro o Invitado', x, y, colAncho.nombre, filaAlto, { bold: true }); x += colAncho.nombre;
                dibujarCelda(doc, 'Hom.', x, y, colAncho.hombre, filaAlto, { bold: true, align: 'center', fontSize: 7 }); x += colAncho.hombre;
                dibujarCelda(doc, 'Dama', x, y, colAncho.dama, filaAlto, { bold: true, align: 'center', fontSize: 7 }); x += colAncho.dama;
                dibujarCelda(doc, 'MCA', x, y, colAncho.mca, filaAlto, { bold: true, align: 'center', fontSize: 7 }); x += colAncho.mca;
                dibujarCelda(doc, 'Cóny.', x, y, colAncho.conyuge, filaAlto, { bold: true, align: 'center', fontSize: 7 }); x += colAncho.conyuge;
                dibujarCelda(doc, 'Hijos', x, y, colAncho.hijos, filaAlto, { bold: true, align: 'center' }); x += colAncho.hijos;
                dibujarCelda(doc, 'Assoc.', x, y, colAncho.assoc, filaAlto, { bold: true, align: 'center' }); x += colAncho.assoc;
                dibujarCelda(doc, 'Invit.', x, y, colAncho.invitado, filaAlto, { bold: true, align: 'center' }); x += colAncho.invitado;
                dibujarCelda(doc, 'Al día', x, y, colAncho.miembroDia, filaAlto, { bold: true, align: 'center' });
                y += filaAlto;
            };

            dibujarEncabezadoRoster();

            datos.roster.forEach((persona, indice) => {
                if (y > doc.page.height - 140) {
                    doc.addPage({ size: 'LETTER', margin: 36 });
                    y = 40;
                    dibujarEncabezadoRoster();
                }

                let x = 36;
                dibujarCelda(doc, String(indice + 1), x, y, colAncho.num, filaAlto, { align: 'center' }); x += colAncho.num;
                dibujarCelda(doc, persona.nombre, x, y, colAncho.nombre, filaAlto); x += colAncho.nombre;
                dibujarCelda(doc, persona.columnaMiembro === 'hombre' ? persona.codigo : '', x, y, colAncho.hombre, filaAlto, { align: 'center' }); x += colAncho.hombre;
                dibujarCelda(doc, persona.columnaMiembro === 'dama' ? persona.codigo : '', x, y, colAncho.dama, filaAlto, { align: 'center' }); x += colAncho.dama;
                dibujarCelda(doc, persona.vehiculo || '', x, y, colAncho.mca, filaAlto, { align: 'center' }); x += colAncho.mca;
                dibujarCelda(doc, persona.conyuge ? 'X' : '', x, y, colAncho.conyuge, filaAlto, { align: 'center' }); x += colAncho.conyuge;
                dibujarCelda(doc, persona.invitadoSubcolumna === 'hijos' ? 'X' : '', x, y, colAncho.hijos, filaAlto, { align: 'center' }); x += colAncho.hijos;
                dibujarCelda(doc, persona.invitadoSubcolumna === 'assoc' ? 'X' : '', x, y, colAncho.assoc, filaAlto, { align: 'center' }); x += colAncho.assoc;
                dibujarCelda(doc, persona.invitadoSubcolumna === 'invitado' ? 'X' : '', x, y, colAncho.invitado, filaAlto, { align: 'center' }); x += colAncho.invitado;
                dibujarCelda(doc, '', x, y, colAncho.miembroDia, filaAlto, { align: 'center' });
                y += filaAlto;
            });

            y += 14;

            // DISTANCIA
            doc.font('Helvetica-Bold').fontSize(9).text('Distancia Evento según LAMA-IMA distance system: ', 36, y, { continued: true })
                .font('Helvetica-Bold').fillColor('#B8860B')
                .text(datos.distanciaPendiente ? 'PENDIENTE (falta coordenadas del capítulo o del evento)' : `${datos.distanciaMillas} MILLAS`);
            doc.fillColor('#000000');
            y += 20;

            // TOTALES
            const totalesFilas = [
                ['Total Miembros hombres:', datos.totales.miembrosHombres, 'Total Prospectos:', datos.totales.prospectos],
                ['Total Damas LAMA:', datos.totales.damasLama, 'Total Hijos:', datos.totales.hijos],
                ['Total cónyuges de Miembros (con chaleco):', datos.totales.conyuges, 'Total Miembros asociados:', datos.totales.asociados],
                ['Total Miembros honorarios:', datos.totales.honorarios, 'Total Invitados:', datos.totales.invitados]
            ];

            const mitad = anchoContenido / 2;
            for (const [labelA, valorA, labelB, valorB] of totalesFilas) {
                dibujarCelda(doc, labelA, 36, y, mitad - 40, filaAlto, { bold: true });
                dibujarCelda(doc, String(valorA), 36 + mitad - 40, y, 40, filaAlto, { align: 'center' });
                dibujarCelda(doc, labelB, 36 + mitad, y, mitad - 40, filaAlto, { bold: true });
                dibujarCelda(doc, String(valorB), 36 + mitad + (mitad - 40), y, 40, filaAlto, { align: 'center' });
                y += filaAlto;
            }

            y += 14;
            doc.font('Helvetica').fontSize(7).fillColor('#666666')
                .text('Generado automáticamente por el sistema L.A.M.A. Región Norte a partir de las inscripciones con asistencia validada por el MTO en el punto de control. El campo "Al día" queda en blanco: se diligencia a mano según el estado de cuotas del capítulo.', 36, y, { width: anchoContenido });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generarPdfPlanilla };
