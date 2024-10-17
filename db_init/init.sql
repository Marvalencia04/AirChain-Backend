CREATE TABLE IF NOT EXISTS Gases (
  id INT AUTO_INCREMENT PRIMARY KEY,  -- Identificador único para cada medida
  gas VARCHAR(50) NOT NULL,  -- Tipo de gas (ejemplo: CO2, CH4, etc.)
  valor DECIMAL(10, 2) NOT NULL,  -- Valor de la medida del gas
  hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Hora de la medida, por defecto la hora actual
  lugar VARCHAR(100) NOT NULL  -- Lugar donde se tomó la medida
);

