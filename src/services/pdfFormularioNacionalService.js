const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const RUTA_LOGO_COLOMBIA = path.join(process.cwd(), 'public', 'img', 'logotipos', 'LAMA_Colombia.jpg');
const TEXTO_CERTIFICACION_BASE = 'Que conozco, entiendo y acepto en toda su extensión, los estatutos, normas y reglamentos que rigen en la Asociación a la cual me estoy afiliando libre y voluntariamente, y estos serán acatados en su totalidad. Acepto mi completa responsabilidad en caso de accidentes, lesiones personales, daños a terceros, daños en bien ajeno, que pudiesen llegar a ocurrir con el vehículo bajo mi conducción. LAMA COLOMBIA, Capítulo {capitulo} no se hace responsable bajo ninguna circunstancia, por accidentes que ocurrieren a miembros, invitados y/o terceros, acaecidos en carretera, vías urbanas, eventos, reuniones o moto paseos, que sean programados o no por la asociación, así como tampoco es responsable por partes y/o comparendos en que pueda incurrir el afiliado.';

const valorTexto = (valor) => {
    if (valor === null || valor === undefined) {
        return 'N/A';
    }

    if (typeof valor === 'boolean') {
        return valor ? 'Sí' : 'No';
    }

    const texto = String(valor).trim();
    return texto.length ? texto : 'N/A';
};

const normalizarBooleano = (valor) => {
    if (typeof valor === 'boolean') {
        return valor;
    }

    if (typeof valor === 'string') {
        const texto = valor.trim().toLowerCase();
        return texto === 'on' || texto === 'true' || texto === '1' || texto === 'si' || texto === 'sí';
    }

    return false;
};

const normalizarFecha = (valor) => {
    if (!valor) {
        return 'N/A';
    }

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) {
        return valorTexto(valor);
    }

    return fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: '2-digit'
    });
};

const resolverRutaLogo = () => {
    if (fs.existsSync(RUTA_LOGO_COLOMBIA)) {
        return RUTA_LOGO_COLOMBIA;
    }

    return path.join(process.cwd(), 'public', 'img', 'LAMARegionNorte.png');
};

const formatearCapituloCertificacion = (capitulo) => {
    const texto = valorTexto(capitulo);
    return texto.replace(/\s*\([^)]*\)/g, '').trim();
};

const acortarTexto = (valor, maximo = 40) => {
    const texto = valorTexto(valor);
    if (texto.length <= maximo) {
        return texto;
    }
    return `${texto.slice(0, maximo - 3)}...`;
};

const extraerHijos = (camposPlano = {}) => {
    const hijosPorIndice = {};

    Object.keys(camposPlano).forEach((clave) => {
        const coincidencia = clave.match(/^hijos\[(\d+)\]\[(nombre|fecha_nacimiento)\]$/);
        if (!coincidencia) {
            return;
        }

        const indice = Number.parseInt(coincidencia[1], 10);
        const campo = coincidencia[2];

        if (!hijosPorIndice[indice]) {
            hijosPorIndice[indice] = { nombre: '', fecha_nacimiento: '' };
        }

        hijosPorIndice[indice][campo] = camposPlano[clave];
    });

    return Object.keys(hijosPorIndice)
        .map((indice) => ({
            indice: Number.parseInt(indice, 10),
            ...hijosPorIndice[indice]
        }))
        .sort((a, b) => a.indice - b.indice)
        .filter((hijo) => valorTexto(hijo.nombre) !== 'N/A' || valorTexto(hijo.fecha_nacimiento) !== 'N/A');
};

const construirPayloadFormulario = (body = {}, fotoNombre = '') => {
    const hijos = extraerHijos(body);
    const capitulo = valorTexto(body.capitulo);
    const textoCertificacion = TEXTO_CERTIFICACION_BASE.replace('{capitulo}', capitulo);

    return {
        capitulo,
        fotografia: valorTexto(fotoNombre),
        nombres: valorTexto(body.nombres),
        apellidos: valorTexto(body.apellidos),
        identificacion: valorTexto(body.identificacion),
        expedida_en: valorTexto(body.expedida_en),
        tipo_documento: valorTexto(body.tipo_documento),
        tipo_sangre: valorTexto(body.tipo_sangre),
        fecha_nacimiento: normalizarFecha(body.fecha_nacimiento),
        lugar_nacimiento: valorTexto(body.lugar_nacimiento),
        direccion_residencia: valorTexto(body.direccion_residencia),
        direccion_laboral: valorTexto(body.direccion_laboral),
        telefono_residencia: valorTexto(body.telefono_residencia),
        telefono_laboral: valorTexto(body.telefono_laboral),
        celular: valorTexto(body.celular),
        actividad_laboral: valorTexto(body.actividad_laboral),
        pareja_nombre: valorTexto(body.pareja_nombre),
        pareja_identificacion: valorTexto(body.pareja_identificacion),
        pareja_expedida_en: valorTexto(body.pareja_expedida_en),
        pareja_tipo_documento: valorTexto(body.pareja_tipo_documento),
        pareja_tipo_sangre: valorTexto(body.pareja_tipo_sangre),
        pareja_fecha_nacimiento: normalizarFecha(body.pareja_fecha_nacimiento),
        pareja_lugar: valorTexto(body.pareja_lugar),
        hijos,
        moto_marca: valorTexto(body.moto_marca),
        moto_modelo: valorTexto(body.moto_modelo),
        moto_anio: valorTexto(body.moto_anio),
        moto_cilindraje: valorTexto(body.moto_cilindraje),
        moto_color: valorTexto(body.moto_color),
        moto_placa: valorTexto(body.moto_placa),
        moto_experiencia: valorTexto(body.moto_experiencia),
        certifico: normalizarBooleano(body.certifico),
        firma_dia: valorTexto(body.firma_dia),
        firma_mes: valorTexto(body.firma_mes),
        firma_anio: valorTexto(body.firma_anio),
        firma_nombre: valorTexto(body.firma_nombre),
        hijos_resumen: hijos.length
            ? hijos.map((hijo, indice) => `${indice + 1}) ${valorTexto(hijo.nombre)} (${normalizarFecha(hijo.fecha_nacimiento)})`).join(' | ')
            : 'No registra',
        hijos_detalle: hijos.length
            ? hijos.map((hijo, indice) => `Hijo ${indice + 1}: ${valorTexto(hijo.nombre)} - ${normalizarFecha(hijo.fecha_nacimiento)}`).join(' | ')
            : 'No registra',
        texto_certificacion: textoCertificacion,
        fecha_generacion: new Date().toLocaleString('es-CO')
    };
};

const dibujarEncabezadoSeccion = (doc, { x, y, ancho, titulo }) => {
    doc.roundedRect(x, y, ancho, 14, 2).fillAndStroke('#2F2F2F', '#2F2F2F');
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.2).text(titulo.toUpperCase(), x, y + 4, {
        width: ancho,
        align: 'center'
    });
    return y + 18;
};

const dibujarFilaGrid = (doc, {
    x,
    y,
    ancho,
    columnas,
    gap = 6,
    minAlto = 19,
    tamEtiqueta = 6.2,
    tamValor = 6.8,
    paddingX = 4,
    paddingY = 2
}) => {
    const totalUnidades = columnas.reduce((acumulado, columna) => acumulado + (columna.span || 1), 0);
    const anchoUnidad = (ancho - (gap * (columnas.length - 1))) / totalUnidades;

    let cursorX = x;
    let maxAlto = minAlto;
    const celdas = [];

    columnas.forEach((columna) => {
        const span = columna.span || 1;
        const anchoCelda = (anchoUnidad * span) + (gap * (span - 1));
        const etiqueta = valorTexto(columna.label);
        const valor = valorTexto(columna.value);

        doc.font('Helvetica-Bold').fontSize(tamEtiqueta);
        const altoEtiqueta = doc.heightOfString(etiqueta.toUpperCase(), { width: anchoCelda - (paddingX * 2) });
        doc.font('Helvetica').fontSize(tamValor);
        const altoValor = doc.heightOfString(valor, { width: anchoCelda - (paddingX * 2), lineGap: 0.5 });

        const altoCelda = Math.max(minAlto, paddingY + altoEtiqueta + 2 + altoValor + paddingY);
        maxAlto = Math.max(maxAlto, altoCelda);

        celdas.push({ cursorX, anchoCelda, etiqueta, valor });
        cursorX += anchoCelda + gap;
    });

    celdas.forEach((celda) => {
        doc.roundedRect(celda.cursorX, y, celda.anchoCelda, maxAlto, 1.5).lineWidth(0.5).strokeColor('#CFCFCF').stroke();
        doc.fillColor('#4A4A4A').font('Helvetica-Bold').fontSize(tamEtiqueta).text(celda.etiqueta.toUpperCase(), celda.cursorX + paddingX, y + paddingY, {
            width: celda.anchoCelda - (paddingX * 2)
        });
        doc.fillColor('#151515').font('Helvetica').fontSize(tamValor).text(celda.valor, celda.cursorX + paddingX, y + paddingY + 8, {
            width: celda.anchoCelda - (paddingX * 2),
            lineGap: 0.5
        });
    });

    return y + maxAlto;
};

const ESPACIO_FIRMA_MANUAL = 52;

const medirBloqueCertificacion = (doc, {
    ancho,
    texto,
    firma,
    capitulo,
    dia,
    mes,
    anio
}) => {
    const capituloCertificacion = formatearCapituloCertificacion(capitulo);
    const textoFinal = texto.replace(`Capítulo ${valorTexto(capitulo)}`, `Capítulo ${capituloCertificacion}`);
    const textoFirmaFecha = `Firmado hoy  ${valorTexto(dia)}   del mes de ${valorTexto(mes)} del año  ${valorTexto(anio)}`;

    doc.font('Helvetica').fontSize(7.1);
    const altoTexto = doc.heightOfString(textoFinal, { width: ancho - 12, align: 'justify', lineGap: 1.1 });
    doc.font('Helvetica').fontSize(7.2);
    const altoFirmaFecha = doc.heightOfString(textoFirmaFecha, { width: ancho - 12 });
    doc.font('Helvetica-Bold').fontSize(7.4);
    const altoFirma = doc.heightOfString(`Firma:  ${valorTexto(firma)}`, { width: ancho - 12 });

    return 16 + 6 + altoTexto + 9 + altoFirmaFecha + ESPACIO_FIRMA_MANUAL + altoFirma + 10;
};

const dibujarParrafoCertificacion = (doc, {
    y,
    x,
    ancho,
    texto,
    firma,
    capitulo,
    dia,
    mes,
    anio
}) => {
    const altoEncabezado = 16;

    doc.roundedRect(x, y, ancho, altoEncabezado, 2).fillAndStroke('#2F2F2F', '#2F2F2F');
    doc.font('Helvetica-Bold').fontSize(8.7).fillColor('#111111').text('CERTIFICO:', x + 6, y + 3);
    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8.2).text('CERTIFICO:', x + 6, y + 4);

    const capituloCertificacion = formatearCapituloCertificacion(capitulo);
    const textoFinal = texto.replace(`Capítulo ${valorTexto(capitulo)}`, `Capítulo ${capituloCertificacion}`);

    const yTexto = y + altoEncabezado + 6;
    doc.font('Helvetica').fontSize(7.1).fillColor('#222222').text(textoFinal, x + 6, yTexto, {
        width: ancho - 12,
        align: 'justify',
        lineGap: 1.1
    });

    const altoTexto = doc.heightOfString(textoFinal, {
        width: ancho - 12,
        align: 'justify',
        lineGap: 1.1
    });

    const yFirmaFecha = yTexto + altoTexto + 8;
    const textoFirmaFecha = `Firmado hoy  ${valorTexto(dia)}   del mes de ${valorTexto(mes)} del año  ${valorTexto(anio)}`;
    doc.font('Helvetica').fontSize(7.2).fillColor('#222222').text(textoFirmaFecha, x + 6, yFirmaFecha, {
        width: ancho - 12,
        align: 'left'
    });

    const yFirma = yFirmaFecha + ESPACIO_FIRMA_MANUAL;
    doc.font('Helvetica-Bold').fontSize(7.3).fillColor('#111111').text(`Firma:  ${valorTexto(firma)}`, x + 6, yFirma, {
        width: ancho - 12,
        align: 'left'
    });

    return yFirma + 10;
};

class PdfFormularioNacionalService {
    static async generarPdfFormularioNacional({ body, fotoBuffer, fotoNombre }) {
        const payload = construirPayloadFormulario(body, fotoNombre);

        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 50
                });

                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                const logoPath = resolverRutaLogo();
                const anchoPagina = doc.page.width;
                const altoPagina = doc.page.height;
                const anchoContenido = anchoPagina - 80;

                doc.rect(30, 30, anchoPagina - 60, altoPagina - 60).lineWidth(1).strokeColor('#D8D8D8').stroke();

                if (fs.existsSync(logoPath)) {
                    doc.image(logoPath, 42, 40, { fit: [125, 95], align: 'left', valign: 'top' });
                }

                const anchoFotoHeader = 100;
                const altoFotoHeader = 133;
                const fotoX = anchoPagina - 42 - anchoFotoHeader;
                const fotoY = 40;
                if (fotoBuffer) {
                    const imagenFoto = doc.openImage(fotoBuffer);
                    const escalaFoto = Math.max(
                        anchoFotoHeader / imagenFoto.width,
                        altoFotoHeader / imagenFoto.height
                    );
                    const anchoRenderFoto = imagenFoto.width * escalaFoto;
                    const altoRenderFoto = imagenFoto.height * escalaFoto;
                    const renderX = fotoX - ((anchoRenderFoto - anchoFotoHeader) / 2);
                    const renderY = fotoY - ((altoRenderFoto - altoFotoHeader) / 2);

                    doc.save();
                    doc.rect(fotoX, fotoY, anchoFotoHeader, altoFotoHeader).clip();
                    doc.image(fotoBuffer, renderX, renderY, {
                        width: anchoRenderFoto,
                        height: altoRenderFoto
                    });
                    doc.restore();
                } else {
                    doc.rect(fotoX, fotoY, anchoFotoHeader, altoFotoHeader).strokeColor('#BBBBBB').stroke();
                    doc.font('Helvetica').fontSize(8).fillColor('#666666').text('Sin foto', fotoX + 30, fotoY + 58);
                }

                doc.font('Helvetica-Bold').fontSize(14).fillColor('#111111').text('FORMULARIO NACIONAL', 190, 44, {
                    width: anchoPagina - 380,
                    align: 'center'
                });
                doc.font('Helvetica-Bold').fontSize(12).fillColor('#111111').text('L.A.M.A. COLOMBIA', 190, 62, {
                    width: anchoPagina - 380,
                    align: 'center'
                });
                doc.font('Helvetica').fontSize(8.5).fillColor('#444444').text(`Capítulo: ${acortarTexto(payload.capitulo, 32)}`, 190, 86, {
                    width: anchoPagina - 380,
                    align: 'center'
                });
                doc.font('Helvetica').fontSize(8.5).fillColor('#444444').text(`Generado: ${payload.fecha_generacion}`, 190, 100, {
                    width: anchoPagina - 380,
                    align: 'center'
                });

                const xContenido = 40;
                const yInicio = Math.max(168, fotoY + altoFotoHeader + 8);
                const yFooterFijo = altoPagina - 68;
                const margenSuperiorCertificacion = 10;

                const altoCertificacion = medirBloqueCertificacion(doc, {
                    ancho: anchoContenido,
                    texto: payload.texto_certificacion,
                    firma: payload.firma_nombre,
                    capitulo: payload.capitulo,
                    dia: payload.firma_dia,
                    mes: payload.firma_mes,
                    anio: payload.firma_anio
                });

                const espacioSuperiorDisponible = Math.max(120, (yFooterFijo - margenSuperiorCertificacion - altoCertificacion) - yInicio);

                let cursorY = yInicio;

                cursorY = dibujarEncabezadoSeccion(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoContenido,
                    titulo: 'DATOS PERSONALES'
                });

                const anchoDatosPersonales = anchoContenido;

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoDatosPersonales,
                    columnas: [
                        { label: 'Nombres', value: payload.nombres },
                        { label: 'Apellidos', value: payload.apellidos },
                        { label: 'Identificación', value: payload.identificacion }
                    ],
                    minAlto: 19
                }) + 2;

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoDatosPersonales,
                    columnas: [
                        { label: 'Expedida en', value: payload.expedida_en },
                        { label: 'Tipo Doc', value: payload.tipo_documento },
                        { label: 'RH', value: payload.tipo_sangre }
                    ],
                    minAlto: 19
                }) + 2;

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoDatosPersonales,
                    columnas: [
                        { label: 'Fecha Nacimiento', value: payload.fecha_nacimiento },
                        { label: 'Lugar Nacimiento', value: payload.lugar_nacimiento, span: 2 }
                    ],
                    minAlto: 19
                }) + 2;

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoDatosPersonales,
                    columnas: [
                        { label: 'Dirección Residencia', value: payload.direccion_residencia, span: 2 },
                        { label: 'Celular', value: payload.celular }
                    ],
                    minAlto: 19
                }) + 2;

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoDatosPersonales,
                    columnas: [
                        { label: 'Dirección Laboral', value: payload.direccion_laboral, span: 2 },
                        { label: 'Tel. Residencia', value: payload.telefono_residencia }
                    ],
                    minAlto: 19
                }) + 2;

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoDatosPersonales,
                    columnas: [
                        { label: 'Actividad Laboral', value: payload.actividad_laboral, span: 2 },
                        { label: 'Tel. Laboral', value: payload.telefono_laboral }
                    ],
                    minAlto: 19
                });

                cursorY += 5;

                cursorY = dibujarEncabezadoSeccion(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoContenido,
                    titulo: 'DATOS FAMILIARES'
                });

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoContenido,
                    columnas: [
                        { label: 'Nombre Pareja', value: payload.pareja_nombre, span: 2 },
                        { label: 'Identificación', value: payload.pareja_identificacion },
                        { label: 'Tipo Sangre', value: payload.pareja_tipo_sangre }
                    ],
                    minAlto: 19
                }) + 2;

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoContenido,
                    columnas: [
                        { label: 'Expedida en', value: payload.pareja_expedida_en },
                        { label: 'Tipo Documento', value: payload.pareja_tipo_documento },
                        { label: 'Fecha Nacimiento', value: payload.pareja_fecha_nacimiento },
                        { label: 'Lugar Nacimiento', value: payload.pareja_lugar }
                    ],
                    minAlto: 19
                }) + 2;

                if (payload.hijos.length) {
                    payload.hijos.forEach((hijo, indice) => {
                        cursorY = dibujarFilaGrid(doc, {
                            x: xContenido,
                            y: cursorY,
                            ancho: anchoContenido,
                            columnas: [
                                { label: `Hijo ${indice + 1}`, value: hijo.nombre, span: 3 },
                                { label: 'Fecha Nacimiento', value: normalizarFecha(hijo.fecha_nacimiento) }
                            ],
                            minAlto: 18
                        }) + 1;
                    });
                } else {
                    cursorY = dibujarFilaGrid(doc, {
                        x: xContenido,
                        y: cursorY,
                        ancho: anchoContenido,
                        columnas: [
                            { label: 'Hijos', value: 'No registra', span: 4 }
                        ],
                            minAlto: 18
                        }) + 1;
                }

                cursorY = dibujarEncabezadoSeccion(doc, {
                    x: xContenido,
                    y: cursorY + 1,
                    ancho: anchoContenido,
                    titulo: 'DATOS DE VEHÍCULO ACTUAL'
                });

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoContenido,
                    columnas: [
                        { label: 'Marca', value: payload.moto_marca },
                        { label: 'Modelo', value: payload.moto_modelo },
                        { label: 'Año', value: payload.moto_anio },
                        { label: 'Cilindraje', value: payload.moto_cilindraje }
                    ],
                    minAlto: 18
                }) + 2;

                cursorY = dibujarFilaGrid(doc, {
                    x: xContenido,
                    y: cursorY,
                    ancho: anchoContenido,
                    columnas: [
                        { label: 'Color', value: payload.moto_color },
                        { label: 'Placa', value: payload.moto_placa },
                        { label: 'Años Experiencia', value: payload.moto_experiencia },
                        { label: 'Capítulo', value: payload.capitulo }
                    ],
                    minAlto: 18
                });

                const yObjetivoCertificacion = yFooterFijo - altoCertificacion - margenSuperiorCertificacion;
                cursorY = Math.min(Math.max(cursorY + 4, yInicio), yObjetivoCertificacion);

                cursorY = dibujarParrafoCertificacion(doc, {
                    y: cursorY,
                    x: xContenido,
                    ancho: anchoContenido,
                    texto: payload.texto_certificacion,
                    firma: payload.firma_nombre,
                    capitulo: payload.capitulo,
                    dia: payload.firma_dia,
                    mes: payload.firma_mes,
                    anio: payload.firma_anio
                });

                const yFooter = yFooterFijo;

                doc.font('Helvetica').fontSize(7.3).fillColor('#666666').text(
                    'Este documento fue generado automáticamente a partir del formulario digital de aspirantes.',
                    40,
                    yFooter,
                    {
                        width: anchoContenido,
                        align: 'center',
                        lineBreak: false
                    }
                );

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = PdfFormularioNacionalService;
