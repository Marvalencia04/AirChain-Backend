CREATE TABLE IF NOT EXISTS `Usuarios` (
  `ID-Usuarios` INT NOT NULL AUTO_INCREMENT UNIQUE,
  `Nombre` TEXT,
  `Apellidos` TEXT,
  `Contrasenya` TEXT,
  `Correo` TEXT,
  `Telefono` TEXT,
  `Distancia` INT,
  PRIMARY KEY(`ID-Usuarios`)
);

CREATE TABLE IF NOT EXISTS `Sensor` (
  `ID-Sensor` INT NOT NULL AUTO_INCREMENT,
  `Usuario` INT NOT NULL,
  PRIMARY KEY(`ID-Sensor`),
  FOREIGN KEY(`Usuario`) REFERENCES `Usuarios`(`ID-Usuarios`)
);

CREATE TABLE IF NOT EXISTS `Gases` (
  `ID-Gases` INT NOT NULL AUTO_INCREMENT UNIQUE,
  `Nombre` VARCHAR(255) NOT NULL UNIQUE,
  `Medida min` INT NOT NULL,
  `Medida max` INT NOT NULL,
  `Info` TEXT,
  PRIMARY KEY(`ID-Gases`)
);

CREATE TABLE IF NOT EXISTS `Medidas` (
  `ID-Medidas` INT NOT NULL AUTO_INCREMENT UNIQUE,
  `Gas` VARCHAR(255),  -- Usamos VARCHAR para permitir el uso en claves foráneas
  `Latitud` FLOAT,
  `Longitud` FLOAT,
  `Hora` DATETIME,
  `Valor` INT,
  `Sensor` INT,
  PRIMARY KEY(`ID-Medidas`),
  FOREIGN KEY(`Gas`) REFERENCES `Gases`(`Nombre`),
  FOREIGN KEY(`Sensor`) REFERENCES `Sensor`(`ID-Sensor`)
  );

  CREATE TABLE IF NOT EXISTS `No-registrados` (
  `ID-No-registrados` INT NOT NULL AUTO_INCREMENT UNIQUE,
  `Correo` TEXT,
  PRIMARY KEY(`ID-No-registrados`)
);
