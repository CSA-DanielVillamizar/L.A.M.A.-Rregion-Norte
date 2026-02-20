const fs = require('fs');
const path = require('path');
const PdfFormularioNacionalService = require('../src/services/pdfFormularioNacionalService');

async function main() {
    const outputName = process.argv[2] || 'pdf-prueba-daniel-uniforme.pdf';
    const body = {
        capitulo: 'Medellín (Antioquia)',
        nombres: 'Daniel Andrey',
        apellidos: 'Villamizar Araque',
        identificacion: '8106002',
        expedida_en: 'Sabaneta',
        tipo_documento: 'Cédula',
        tipo_sangre: 'O+',
        fecha_nacimiento: '2002-04-05',
        lugar_nacimiento: 'Pamplona, Norte de Santander',
        direccion_residencia: 'Calle 48 F Sur # 40-55 Apto 1308 Puerto Luna, Envigado',
        direccion_laboral: 'Calle 48 F Sur # 40-55 Apto 1308 Puerto Luna, Envigado',
        telefono_residencia: '3106328171',
        telefono_laboral: '',
        celular: '3106328171',
        actividad_laboral: 'Arquitecto de Software',
        pareja_nombre: 'Laura Viviana Salazar Moreno',
        pareja_identificacion: '1090419626',
        pareja_expedida_en: 'Cúcuta',
        pareja_tipo_documento: 'Cédula',
        pareja_tipo_sangre: 'A+',
        pareja_fecha_nacimiento: '1990-02-24',
        pareja_lugar: 'Chitagá',
        'hijos[0][nombre]': 'Amelia Villamizar Salazar',
        'hijos[0][fecha_nacimiento]': '2011-06-09',
        moto_marca: 'BMW',
        moto_modelo: 'GSA',
        moto_anio: '2024',
        moto_cilindraje: '1250',
        moto_color: 'Azul Tormenta',
        moto_placa: 'SYN25G',
        moto_experiencia: '19',
        certifico: 'on',
        firma_dia: '18',
        firma_mes: 'Febrero',
        firma_anio: '2026',
        firma_nombre: 'Daniel Andrey Villamizar Araque'
    };

    const fotoPath = path.join(process.cwd(), 'public', 'img', 'capitulos', 'capitulo-1771308335025-384267209.jpeg');
    const fotoBuffer = fs.readFileSync(fotoPath);

    const pdfBuffer = await PdfFormularioNacionalService.generarPdfFormularioNacional({
        body,
        fotoBuffer,
        fotoNombre: 'Daniel.jpg'
    });

    const outPath = path.join(process.cwd(), outputName);
    fs.writeFileSync(outPath, pdfBuffer);
    console.log(`PDF_GENERADO:${outPath}`);
    console.log(`PDF_BYTES:${pdfBuffer.length}`);
}

main().catch((error) => {
    console.error('ERROR_GENERANDO_PDF', error);
    process.exit(1);
});
