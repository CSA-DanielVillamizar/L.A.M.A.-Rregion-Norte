/**
 * CAPA DE DOMINIO: Servicio de Capítulos
 * Maneja la lógica de negocio y datos de los capítulos L.A.M.A.
 * 
 * Clean Architecture: Esta capa contiene la lógica de negocio
 * y no depende de frameworks externos
 */

/**
 * Base de datos en memoria para capítulos
 * En producción, esto debe migrar a una base de datos real
 */
let capitulos = [
    {
        id: 1,
        nombre: 'Barranquilla',
        departamento: 'Atlántico',
        miembros: 28,
        fundado: 2013,
        imagen: '/img/capitulos/barranquilla.jpg',
        descripcion: 'Capítulo fundador en la capital del Atlántico',
        activo: true
    },
    {
        id: 2,
        nombre: 'Bucaramanga',
        departamento: 'Santander',
        miembros: 22,
        fundado: 2013,
        imagen: '/img/capitulos/bucaramanga.jpg',
        descripcion: 'Capítulo fundador en la ciudad bonita',
        activo: true
    },
    {
        id: 3,
        nombre: 'Cartagena',
        departamento: 'Bolívar',
        miembros: 18,
        fundado: 2017,
        imagen: '/img/capitulos/cartagena.jpg',
        descripcion: 'Capítulo en la heroica ciudad amurallada',
        activo: true
    },
    {
        id: 4,
        nombre: 'Cúcuta',
        departamento: 'Norte de Santander',
        miembros: 19,
        fundado: 2013,
        imagen: '/img/capitulos/cucuta.jpg',
        descripcion: 'Capítulo fundador en la perla del norte',
        activo: true
    },
    {
        id: 5,
        nombre: 'Floridablanca',
        departamento: 'Santander',
        miembros: 39,
        fundado: 2019,
        imagen: '/img/capitulos/floridablanca.jpg',
        descripcion: 'El capítulo más grande del club',
        activo: true
    },
    {
        id: 6,
        nombre: 'Medellín',
        departamento: 'Antioquia',
        miembros: 24,
        fundado: 2013,
        imagen: '/img/capitulos/medellin.jpg',
        descripcion: 'Capítulo fundador en la ciudad de la eterna primavera',
        activo: true
    },
    {
        id: 7,
        nombre: 'Puerto Colombia',
        departamento: 'Atlántico',
        miembros: 24,
        fundado: 2021,
        imagen: '/img/capitulos/puerto-colombia.jpg',
        descripcion: 'Capítulo costero en Puerto Colombia',
        activo: true
    },
    {
        id: 8,
        nombre: 'Valle de Aburrá',
        departamento: 'Antioquia',
        miembros: 26,
        fundado: 2020,
        imagen: '/img/capitulos/valle-aburra.jpg',
        descripcion: 'Capítulo metropolitano del Valle de Aburrá',
        activo: true
    },
    {
        id: 9,
        nombre: 'Zenú',
        departamento: 'Córdoba',
        miembros: 16,
        fundado: 2025,
        imagen: '/img/capitulos/zenu.jpg',
        descripcion: 'Nuestro capítulo más reciente',
        activo: true
    }
];

/**
 * Obtiene todos los capítulos activos
 * @returns {Array} Array de capítulos
 */
exports.getAllCapitulos = () => {
    return capitulos.filter(cap => cap.activo).sort((a, b) => a.nombre.localeCompare(b.nombre));
};

/**
 * Obtiene un capítulo por ID
 * @param {number} id - ID del capítulo
 * @returns {Object|null} Capítulo encontrado o null
 */
exports.getCapituloById = (id) => {
    return capitulos.find(cap => cap.id === parseInt(id)) || null;
};

/**
 * Crea un nuevo capítulo
 * @param {Object} data - Datos del nuevo capítulo
 * @returns {Object} Capítulo creado
 */
exports.createCapitulo = (data) => {
    const nuevoCapitulo = {
        id: capitulos.length > 0 ? Math.max(...capitulos.map(c => c.id)) + 1 : 1,
        nombre: data.nombre,
        departamento: data.departamento,
        miembros: parseInt(data.miembros) || 0,
        fundado: parseInt(data.fundado) || new Date().getFullYear(),
        imagen: data.imagen || '/img/capitulos/default.jpg',
        descripcion: data.descripcion || '',
        activo: true
    };
    
    capitulos.push(nuevoCapitulo);
    return nuevoCapitulo;
};

/**
 * Actualiza un capítulo existente
 * @param {number} id - ID del capítulo
 * @param {Object} data - Datos a actualizar
 * @returns {Object|null} Capítulo actualizado o null
 */
exports.updateCapitulo = (id, data) => {
    const index = capitulos.findIndex(cap => cap.id === parseInt(id));
    
    if (index === -1) return null;
    
    capitulos[index] = {
        ...capitulos[index],
        nombre: data.nombre || capitulos[index].nombre,
        departamento: data.departamento || capitulos[index].departamento,
        miembros: data.miembros !== undefined ? parseInt(data.miembros) : capitulos[index].miembros,
        fundado: data.fundado ? parseInt(data.fundado) : capitulos[index].fundado,
        imagen: data.imagen || capitulos[index].imagen,
        descripcion: data.descripcion !== undefined ? data.descripcion : capitulos[index].descripcion,
        activo: data.activo !== undefined ? data.activo : capitulos[index].activo
    };
    
    return capitulos[index];
};

/**
 * Elimina (desactiva) un capítulo
 * @param {number} id - ID del capítulo
 * @returns {boolean} True si se eliminó correctamente
 */
exports.deleteCapitulo = (id) => {
    const index = capitulos.findIndex(cap => cap.id === parseInt(id));
    
    if (index === -1) return false;
    
    // Soft delete - solo marcamos como inactivo
    capitulos[index].activo = false;
    return true;
};

/**
 * Obtiene estadísticas de capítulos
 * @returns {Object} Estadísticas
 */
exports.getEstadisticas = () => {
    const activos = capitulos.filter(cap => cap.activo);
    
    return {
        total_capitulos: activos.length,
        total_miembros: activos.reduce((sum, cap) => sum + cap.miembros, 0),
        capitulo_mas_grande: activos.reduce((max, cap) => cap.miembros > max.miembros ? cap : max, activos[0]),
        capitulo_mas_nuevo: activos.reduce((newest, cap) => cap.fundado > newest.fundado ? cap : newest, activos[0]),
        promedio_miembros: Math.round(activos.reduce((sum, cap) => sum + cap.miembros, 0) / activos.length)
    };
};

/**
 * Obtiene capítulos agrupados por departamento
 * @returns {Object} Capítulos agrupados
 */
exports.getCapitulosPorDepartamento = () => {
    const activos = capitulos.filter(cap => cap.activo);
    const grouped = {};
    
    activos.forEach(cap => {
        if (!grouped[cap.departamento]) {
            grouped[cap.departamento] = [];
        }
        grouped[cap.departamento].push(cap);
    });
    
    return grouped;
};
