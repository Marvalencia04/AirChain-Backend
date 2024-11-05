// Función para generar una etiqueta aleatoria
function generarEtiquetaAleatoria(longitud = 8) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let etiqueta = '';
    for (let i = 0; i < longitud; i++) {
      etiqueta += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return etiqueta;
  }
  
  // Función para intentar insertar un sensor con etiqueta única
  async function insertarSensorConEtiquetaUnica() {
    let etiqueta;
    let insertado = false;
    let result;
  
    while (!insertado) {
      etiqueta = generarEtiquetaAleatoria(); // Genera una etiqueta
      try {
        // Intenta insertar el sensor
        [result] = await db.query(
          'INSERT INTO Sensor (Etiqueta, Usuario) VALUES (?, NULL)',
          [etiqueta]
        );
        insertado = true; // Si se inserta correctamente, cambiamos el estado
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`Conflicto de etiqueta: ${etiqueta} ya existe, generando una nueva...`);
          // Si ocurre un error de duplicado, genera una nueva etiqueta y reintenta
        } else {
          throw error; // Si es otro tipo de error, lo lanzamos
        }
      }
    }
  
    return { id_sensor: result.insertId, etiqueta };
  }
  
  // Endpoint para crear un nuevo sensor sin usuario asignado
  router.post('/sensor', async (req, res) => {
    try {
      const { id_sensor, etiqueta } = await insertarSensorConEtiquetaUnica();
      res.status(201).json({ message: 'Sensor creado exitosamente', id_sensor, etiqueta });
    } catch (error) {
      console.error('Error al crear el sensor:', error);
      res.status(500).json({ error: 'Error al crear el sensor en la base de datos' });
    }
  });