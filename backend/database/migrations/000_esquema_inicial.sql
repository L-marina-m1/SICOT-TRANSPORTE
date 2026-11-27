-- Esquema inicial de SICOT (exportado de sicot_db)
-- Crea la base y todas las tablas desde cero, ya en utf8mb4.

CREATE DATABASE IF NOT EXISTS sicot_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sicot_db;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('gerencia','admin_ti','conductor') NOT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `conductores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `dni` varchar(15) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `licencia_conducir` varchar(30) NOT NULL,
  `categoria_licencia` varchar(20) DEFAULT NULL,
  `fecha_vencimiento_licencia` date DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `dni` (`dni`),
  UNIQUE KEY `licencia_conducir` (`licencia_conducir`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `fk_conductor_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contratos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conductor_id` int(11) NOT NULL,
  `numero_contrato` varchar(50) NOT NULL,
  `tipo_contrato` varchar(50) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT NULL,
  `descripcion` mediumtext DEFAULT NULL,
  `estado` enum('vigente','finalizado','cancelado') DEFAULT 'vigente',
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_contrato` (`numero_contrato`),
  KEY `idx_contrato_conductor` (`conductor_id`),
  CONSTRAINT `fk_contrato_conductor` FOREIGN KEY (`conductor_id`) REFERENCES `conductores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `vehiculos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `placa` varchar(15) NOT NULL,
  `marca` varchar(60) DEFAULT NULL,
  `modelo` varchar(60) DEFAULT NULL,
  `anio` year(4) DEFAULT NULL,
  `color` varchar(30) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `kilometraje` decimal(10,2) DEFAULT 0.00,
  `estado` enum('disponible','en_ruta','mantenimiento','inactivo') DEFAULT 'disponible',
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `placa` (`placa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `recorridos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conductor_id` int(11) NOT NULL,
  `vehiculo_id` int(11) NOT NULL,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `origen` varchar(200) NOT NULL,
  `destino` varchar(200) NOT NULL,
  `kilometros` decimal(10,2) DEFAULT 0.00,
  `estado` enum('pendiente','en_curso','finalizado','cancelado') DEFAULT 'pendiente',
  `observaciones` mediumtext DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_recorrido_conductor` (`conductor_id`),
  KEY `fk_recorrido_vehiculo` (`vehiculo_id`),
  KEY `idx_recorrido_fecha` (`fecha_inicio`),
  KEY `idx_recorrido_estado` (`estado`),
  CONSTRAINT `fk_recorrido_conductor` FOREIGN KEY (`conductor_id`) REFERENCES `conductores` (`id`),
  CONSTRAINT `fk_recorrido_vehiculo` FOREIGN KEY (`vehiculo_id`) REFERENCES `vehiculos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `asistencias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conductor_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora_entrada` time DEFAULT NULL,
  `hora_salida` time DEFAULT NULL,
  `estado` enum('presente','tardanza','falta','justificado') DEFAULT 'presente',
  `observaciones` mediumtext DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_asistencia_dia` (`conductor_id`,`fecha`),
  KEY `idx_asistencia_fecha` (`fecha`),
  CONSTRAINT `fk_asistencia_conductor` FOREIGN KEY (`conductor_id`) REFERENCES `conductores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ubicaciones_gps` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `recorrido_id` int(11) NOT NULL,
  `latitud` decimal(10,7) NOT NULL,
  `longitud` decimal(10,7) NOT NULL,
  `velocidad` decimal(7,2) DEFAULT 0.00,
  `fecha_hora` datetime NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_gps_recorrido_fecha` (`recorrido_id`,`fecha_hora`),
  CONSTRAINT `fk_gps_recorrido` FOREIGN KEY (`recorrido_id`) REFERENCES `recorridos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

