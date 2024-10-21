CREATE TABLE IF NOT EXISTS `Usuarios` (
  `ID` INT NOT NULL AUTO_INCREMENT UNIQUE,
  `Nombre` TEXT,
  `Contrasenya` TEXT,
  `Correo` TEXT,
  PRIMARY KEY(`ID`)
);

CREATE TABLE IF NOT EXISTS `Sensor` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Usuario` INT NOT NULL,
  PRIMARY KEY(`ID`),
  FOREIGN KEY(`Usuario`) REFERENCES `Usuarios`(`ID`)
);

CREATE TABLE IF NOT EXISTS `Gases` (
  `Nombre` VARCHAR(255) NOT NULL UNIQUE,
  `Medida min` INT NOT NULL,
  `Medida max` INT NOT NULL,
  `Info` TEXT,
  PRIMARY KEY(`Nombre`)
);

CREATE TABLE IF NOT EXISTS `Medidas` (
  `ID` INT NOT NULL AUTO_INCREMENT,
  `Gas` VARCHAR(255),  -- Usamos VARCHAR para permitir el uso en claves foráneas
  `Lugar` TEXT,
  `Hora` DATETIME,
  `Valor` INT,
  `Sensor` INT,
  PRIMARY KEY(`ID`),
  FOREIGN KEY(`Gas`) REFERENCES `Gases`(`Nombre`),
  FOREIGN KEY(`Sensor`) REFERENCES `Sensor`(`ID`)
);
