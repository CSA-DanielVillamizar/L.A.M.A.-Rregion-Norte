/**
 * Servicio de Servicios Premium
 * Gestiona los servicios premium disponibles en la plataforma
 */

class ServiciosPremiumService {
    constructor() {
        // Datos en memoria (inicialmente vacío)
        this.servicios = [
            {
                id: 1,
                nombre: 'Jet Ski',
                descripcion: 'Experiencia emocionante en jet ski para dos personas',
                precio: 150000,
                disponible: 1,
                categoria: 'actividades',
                limite_reservas: null,
                fecha_creacion: new Date()
            },
            {
                id: 2,
                nombre: 'Lancha de Lujo',
                descripcion: 'Tours privados en lancha de lujo por las islas',
                precio: 500000,
                disponible: 1,
                categoria: 'transporte',
                limite_reservas: 5,
                fecha_creacion: new Date()
            },
            {
                id: 3,
                nombre: 'Regata de Veleros',
                descripcion: 'Competencia de vela con instrucción profesional',
                precio: 250000,
                disponible: 1,
                categoria: 'actividades',
                limite_reservas: 10,
                fecha_creacion: new Date()
            },
            {
                id: 4,
                nombre: 'Mula (Golf Cart)',
                descripcion: 'Transporte diario en isla con golf cart',
                precio: 75000,
                disponible: 1,
                categoria: 'transporte',
                limite_reservas: null,
                fecha_creacion: new Date()
            }
        ];
        this.nextId = 5;
    }

    /**
     * Obtiene todos los servicios premium
     * @returns {Array} Lista de servicios
     */
    getAllServicios() {
        return this.servicios;
    }

    /**
     * Obtiene un servicio por ID
     * @param {number} id - ID del servicio
     * @returns {Object|null} Servicio encontrado o null
     */
    getServicioById(id) {
        return this.servicios.find(s => s.id === id) || null;
    }

    /**
     * Crea un nuevo servicio
     * @param {Object} datos - Datos del servicio
     * @returns {Object} Servicio creado
     */
    createServicio(datos) {
        const nuevoServicio = {
            id: this.nextId++,
            nombre: datos.nombre,
            descripcion: datos.descripcion,
            precio: datos.precio,
            disponible: datos.disponible,
            categoria: datos.categoria,
            limite_reservas: datos.limite_reservas || null,
            fecha_creacion: new Date()
        };
        this.servicios.push(nuevoServicio);
        return nuevoServicio;
    }

    /**
     * Actualiza un servicio existente
     * @param {number} id - ID del servicio
     * @param {Object} datos - Datos a actualizar
     * @returns {Object|null} Servicio actualizado o null
     */
    updateServicio(id, datos) {
        const servicio = this.getServicioById(id);
        if (!servicio) return null;

        servicio.nombre = datos.nombre || servicio.nombre;
        servicio.descripcion = datos.descripcion || servicio.descripcion;
        servicio.precio = datos.precio !== undefined ? datos.precio : servicio.precio;
        servicio.disponible = datos.disponible !== undefined ? datos.disponible : servicio.disponible;
        servicio.categoria = datos.categoria || servicio.categoria;
        servicio.limite_reservas = datos.limite_reservas !== undefined ? datos.limite_reservas : servicio.limite_reservas;
        servicio.fecha_actualizacion = new Date();

        return servicio;
    }

    /**
     * Elimina un servicio
     * @param {number} id - ID del servicio
     * @returns {boolean} True si se eliminó, false si no existe
     */
    deleteServicio(id) {
        const index = this.servicios.findIndex(s => s.id === id);
        if (index === -1) return false;
        this.servicios.splice(index, 1);
        return true;
    }

    /**
     * Obtiene servicios por categoría
     * @param {string} categoria - Categoría
     * @returns {Array} Servicios de esa categoría
     */
    getServiciosByCategoria(categoria) {
        return this.servicios.filter(s => s.categoria === categoria);
    }

    /**
     * Obtiene servicios disponibles
     * @returns {Array} Servicios disponibles
     */
    getServiciosDisponibles() {
        return this.servicios.filter(s => s.disponible === 1);
    }

    /**
     * Obtiene total de ingresos por servicio
     * @returns {Object} Ingresos por servicio
     */
    getIngresosPorServicio() {
        const ingresos = {};
        this.servicios.forEach(s => {
            ingresos[s.id] = {
                nombre: s.nombre,
                precio: s.precio,
                categoria: s.categoria
            };
        });
        return ingresos;
    }
}

// Exportar singleton
module.exports = new ServiciosPremiumService();
