-- CMS para el contenido de Alojamiento y Turismo de home.ejs, que hasta
-- ahora vivia hardcodeado como HTML estatico en la plantilla. Se crean las
-- tablas y se puebla con el contenido actual (5 hoteles, 3 destinos) para
-- no perder nada al pasar a edicion desde el panel admin.

IF OBJECT_ID('dbo.Hoteles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Hoteles (
        id_hotel INT IDENTITY(1,1) PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        etiqueta VARCHAR(100) NULL,
        es_sede_oficial BIT NOT NULL DEFAULT 0,
        icono VARCHAR(50) NULL,
        ubicacion VARCHAR(300) NULL,
        descripcion NVARCHAR(MAX) NULL,
        imagenes_json NVARCHAR(MAX) NULL,
        tarifas_json NVARCHAR(MAX) NULL,
        nota NVARCHAR(500) NULL,
        google_maps_url VARCHAR(500) NULL,
        whatsapp_telefono VARCHAR(20) NULL,
        whatsapp_mensaje VARCHAR(500) NULL,
        orden INT NOT NULL DEFAULT 0,
        activo BIT NOT NULL DEFAULT 1,
        fecha_actualizacion DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

IF OBJECT_ID('dbo.DestinosTuristicos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DestinosTuristicos (
        id_destino INT IDENTITY(1,1) PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        icono VARCHAR(50) NULL,
        color_icono VARCHAR(20) NULL,
        descripcion NVARCHAR(MAX) NULL,
        orden INT NOT NULL DEFAULT 0,
        activo BIT NOT NULL DEFAULT 1,
        fecha_actualizacion DATETIME2 NOT NULL DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Hoteles)
BEGIN
    INSERT INTO dbo.Hoteles (
        nombre, etiqueta, es_sede_oficial, icono, ubicacion, descripcion,
        imagenes_json, tarifas_json, nota, google_maps_url,
        whatsapp_telefono, whatsapp_mensaje, orden
    ) VALUES
    (
        'Hotel Playa Coveñas', 'HOTEL SEDE OFICIAL', 1, 'hotel',
        'Segunda Ensenada de Coveñas, frente a la playa · a 300 m del nuevo Malecón',
        'Alojamiento con piscina (9:30 AM - 7:00 PM), quioscos frente al mar y parqueadero interno gratuito.',
        N'["/img/hoteles/exterior.jpg","/img/hoteles/habitaciones.jpg","/img/hoteles/zonascomunes.jpg"]',
        N'[{"nombre":"Tarifa Doble","valor":"$280.000","unidad":"por pareja/noche"},{"nombre":"Tarifa Familiar","valor":"$130.000","unidad":"por persona/noche"}]',
        'Incluye desayuno y almuerzo por noche de estadía. Tienda y coctelería con cargo adicional.',
        'https://maps.google.com/maps/search/Hotel%20Playa%20Cove%C3%B1as/@9.42020034790039,-75.64330291748047,17z?hl=es',
        '573186991222', 'Hola, quiero consultar disponibilidad en Hotel Playa Coveñas para el V Campeonato', 1
    ),
    (
        'Hotel Poblado Coveñas', 'ALTA DENSIDAD · SEGURIDAD TÁCTICA', 0, 'security',
        'Coveñas',
        'Parqueadero de altísima capacidad y acomodaciones desde 2 hasta 10 personas para optimizar tu presupuesto. Ideal para binomios y escuadrones de capítulos numerosos.',
        NULL, NULL, NULL, NULL,
        '573138984956', 'Hola, quiero consultar disponibilidad en Hotel Poblado Covenas para el V Campeonato', 2
    ),
    (
        'Hotel Playa Blanca', 'SATÉLITE · PROXIMIDAD TÁCTICA', 0, 'near_me',
        'Coveñas (0,2 km del Hotel Playa Coveñas)',
        'Proximidad táctica a la sede principal, ideal para presupuestos ajustados sin alejarse del comando central.',
        NULL, NULL, NULL, NULL,
        '573153538994', 'Hola, quiero consultar disponibilidad en Hotel Playa Blanca para el V Campeonato', 3
    ),
    (
        'Ciela Hotel & Beach Club', 'ALTA GAMA', 0, 'star',
        'Coveñas',
        'El vértice del lujo. Club de playa sofisticado, restaurantes de autor y política dog-friendly.',
        NULL, NULL, NULL, NULL,
        '573103709860', 'Hola, quiero consultar disponibilidad en Ciela Hotel & Beach Club para el V Campeonato', 4
    ),
    (
        'Hotel Semar', 'BASE URBANA · EQUIPO DE AVANZADA', 0, 'location_city',
        'San Antero',
        'Base urbana eficiente, pulcra y económica en el corazón del municipio, ideal para el equipo de avanzada (MTO).',
        NULL, NULL, NULL, NULL,
        '573105882315', 'Hola, quiero consultar disponibilidad en Hotel Semar para el V Campeonato', 5
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DestinosTuristicos)
BEGIN
    INSERT INTO dbo.DestinosTuristicos (nombre, icono, color_icono, descripcion, orden) VALUES
    ('Ciénaga de la Caimanera', 'kayaking', 'lamaNeon',
     'Navegación a remo, avistamiento de fauna y silencio terapéutico a minutos de Coveñas.', 1),
    ('Volcán de Lodo El Tesoro', 'volcano', 'lamaGold',
     'Geotermia pasiva en San Antero. El barro sulfuroso es ideal para la recuperación muscular lumbar y cervical post-rodada.', 2),
    ('Archipiélago de San Bernardo', 'sailing', 'lamaNeon',
     'Pasadías offshore hacia Isla Múcura y Tintipán, opción ideal para los acompañantes de los pilotos.', 3);
END
GO
