-- Primero, creamos la tabla de Usuarios
CREATE TABLE IF NOT EXISTS `Usuarios` (
  `ID_Usuarios` INT NOT NULL AUTO_INCREMENT UNIQUE,
  `Nombre` VARCHAR(255),
  `Apellidos` VARCHAR(255),
  `Contrasenya` VARCHAR(255),
  `Correo` VARCHAR(255),
  `Telefono` VARCHAR(20),
  `Distancia` INT DEFAULT 0,
  `Verificado` INT DEFAULT 0,
  PRIMARY KEY(`ID_Usuarios`)
);

-- Luego, creamos la tabla de Gases
CREATE TABLE IF NOT EXISTS `Gases` (
  `ID_Gases` INT NOT NULL AUTO_INCREMENT UNIQUE,
  `Nombre` VARCHAR(255) NOT NULL UNIQUE,
  `Medida_min` INT NOT NULL,
  `Medida_max` INT NOT NULL,
  `Info` TEXT,
  PRIMARY KEY(`ID_Gases`)
);

-- Ahora, creamos la tabla de Sensor, que hace referencia a Usuarios
CREATE TABLE IF NOT EXISTS `Sensor` (
  `ID_Sensor` INT NOT NULL AUTO_INCREMENT,
  `Usuario` INT NOT NULL,
  PRIMARY KEY(`ID_Sensor`),
  FOREIGN KEY(`Usuario`) REFERENCES `Usuarios`(`ID_Usuarios`)
);

-- Finalmente, creamos la tabla de Medidas, que hace referencia a Gases y Sensor
CREATE TABLE IF NOT EXISTS `Medidas` (
  `ID_Medidas` INT NOT NULL AUTO_INCREMENT UNIQUE,
  `Gas` VARCHAR(255),
  `Latitud` FLOAT,
  `Longitud` FLOAT,
  `Hora` DATETIME,
  `Valor` INT,
  `Sensor` INT,
  PRIMARY KEY(`ID_Medidas`),
  FOREIGN KEY(`Gas`) REFERENCES `Gases`(`Nombre`),
  FOREIGN KEY(`Sensor`) REFERENCES `Sensor`(`ID_Sensor`)
);
