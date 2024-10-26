import { Router } from "express";

/**
 * @brief Crea las rutas relacionadas con la API de gases.
 *
 * @param {Pool} pool El pool de conexiones a la base de datos.
 * @returns {Router} El enrutador configurado.
 * param: (Pool) -> apiRoutes() -> Router
 */
const apiRoutes = (pool) => {
  const router = Router();

  /**
   * @brief Ruta para obtener datos de gases desde la base de datos.
   *
   * Esta ruta maneja las solicitudes GET a "/", ejecutando una consulta
   * a la base de datos para obtener la lista de gases y enviándola como respuesta.
   *
   * @returns {void}
   * @throws {Error} Si hay un problema con la consulta a la base de datos.
   * param: () -> GET /api/gases() -> void
   */
  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM Gases"); // Ejecutar la consulta
      res.json(rows); // Enviar la respuesta con los datos obtenidos
    } catch (error) {
      console.error("Error en la consulta de gases:", error);
      res.status(500).send("Error retrieving data"); // Enviar error si la consulta falla
    }
  });

  /*router.get("/usuarios", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM Usuarios"); // Ejecutar la consulta
      res.json(rows); // Enviar la respuesta con los datos obtenidos
    } catch (error) {
      console.error("Error en la consulta de gases:", error);
      res.status(500).send("Error retrieving data"); // Enviar error si la consulta falla
    }
  });*/

  // En tu archivo de rutas de la API (e.g., apiRoutes.js)
router.get("/usuarios", async (req, res) => {
  const { Correo, Contrasenya } = req.query; // Obtener correo y contraseña desde la solicitud

  try {
      const [rows] = await pool.query(
          "SELECT * FROM Usuarios WHERE Correo = ? AND Contrasenya = ?",
          [Correo, Contrasenya]
      ); // Filtrar por correo y contraseña

      if (rows.length === 0) {
          return res.status(401).json({ error: "Credenciales incorrectas" });
      }
      
      res.json(rows[0]); // Enviar solo el usuario encontrado
  } catch (error) {
      console.error("Error en la consulta de usuario:", error);
      res.status(500).send("Error retrieving user data");
  }
});



  // Ruta para obtener los datos del usuario por su correo
router.get("/usuario/:correo", async (req, res) => {
  const { correo } = req.params;
  try {
      const [rows] = await pool.query("SELECT * FROM Usuarios WHERE Correo = ?", [correo]);
      if (rows.length === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json(rows[0]); // Retorna el primer usuario encontrado
  } catch (error) {
      console.error("Error al obtener el perfil del usuario:", error);
      res.status(500).json({ error: "Error al obtener el perfil del usuario" });
  }
});

// Ruta para actualizar los datos del usuario
router.put("/usuarios", async (req, res) => {
  const { correo } = req.params;
  const { Nombre, Apellidos, Telefono, Contrasenya } = req.body;

  try {
      const [result] = await pool.query(
          "UPDATE Usuarios SET Nombre = ?, Apellidos = ?, Telefono = ?, Contrasenya = ? WHERE Correo = ?",
          [Nombre, Apellidos, Telefono, Contrasenya, correo]
      );
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      res.status(500).json({ error: "Error al actualizar el perfil" });
  }
});

// Agregar en apiRoutes (por ejemplo, en apiRoutes.js)

router.put("/usuario", async (req, res) => {
  const { Correo, Nombre, Apellidos, } = req.body;

  try {
      const [result] = await pool.query(
          "UPDATE Usuarios SET Nombre = ?, Apellidos = ? WHERE Correo = ?",
          [Nombre, Apellidos, Correo]
      );

      res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
      console.error("Error al actualizar usuario:", error);
      res.status(500).json({ error: "Error al actualizar usuario" });
  }
});


// En apiRoutes.js
router.put("/usuario/telefono/:correo", async (req, res) => {
  const { correo } = req.params;
  const { Telefono } = req.body;

  try {
      const [result] = await pool.query(
          "UPDATE Usuarios SET Telefono = ? WHERE Correo = ?",
          [Telefono, correo]
      );

      if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({ message: "Teléfono actualizado correctamente" });
  } catch (error) {
      console.error("Error al actualizar el teléfono:", error);
      res.status(500).json({ error: "Error al actualizar el teléfono" });
  }
});


// Ruta para cambiar la contraseña del usuario
router.put("/usuario/:correo/cambiar-contrasena", async (req, res) => {
  const { correo } = req.params;
  const { contrasenaActual, contrasenaNueva } = req.body;

  try {
      // Primero, verifica si la contraseña actual es correcta
      const [usuario] = await pool.query(
          "SELECT Contrasenya FROM Usuarios WHERE Correo = ?",
          [correo]
      );

      if (usuario.length === 0 || usuario[0].Contrasenya !== contrasenaActual) {
          return res.status(401).json({ error: "La contraseña actual es incorrecta" });
      }

      // Si la contraseña actual es correcta, actualiza a la nueva
      await pool.query(
          "UPDATE Usuarios SET Contrasenya = ? WHERE Correo = ?",
          [contrasenaNueva, correo]
      );

      res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      res.status(500).json({ error: "Error al cambiar la contraseña" });
  }
});




  /**
   * @brief Ruta para insertar un nuevo gas en la base de datos.
   *
   * Esta ruta maneja las solicitudes POST a "/",
   * extrayendo los parámetros del cuerpo de la solicitud e
   * insertando un nuevo registro en la base de datos.
   *
   * @param {Object} req Cuerpo de la solicitud que contiene los parámetros para el gas.
   * @param {string} req.body.gas El nombre del gas.
   * @param {number} req.body.valor El valor asociado al gas.
   * @param {string} req.body.hora La hora en que se mide el gas.
   * @param {string} req.body.lugar El lugar donde se mide el gas.
   * @param {Response} res Objeto de respuesta de Express para enviar la respuesta al cliente.
   * @returns {void}
   * @throws {Error} Si hay un problema al insertar el gas en la base de datos.
   * param: () -> POST /api/gases() -> void
   */
  router.post("/", async (req, res) => {
    const { gas, valor, hora, lugar } = req.body;

    try {
      const [result] = await pool.query(
        "INSERT INTO Medidas.Gases (gas, valor, hora, lugar) VALUES (?, ?, ?, ?)",
        [gas, valor, hora, lugar] // Pasar los parámetros recibidos a la consulta
      );

      res.status(201).json({
        id: result.insertId, // Incluir el ID del nuevo gas insertado
        gas,
        valor,
        hora,
        lugar,
      });
    } catch (error) {
      console.error("Error al insertar medida:", error);
      res.status(500).json({
        error: "Error al insertar medida",
        details: error.message, // Incluir detalles del error en la respuesta
      });
    }
  });


    /**
   * @brief Ruta para registrar un nuevo usuario en la base de datos.
   *
   * Esta ruta maneja las solicitudes POST a "/usuarios",
   * extrayendo los parámetros del cuerpo de la solicitud e
   * insertando un nuevo usuario en la base de datos.
   *
   * @param {Object} req Cuerpo de la solicitud que contiene los datos del usuario.
   * @param {string} req.body.nombre El nombre del usuario.
   * @param {string} req.body.apellidos Los apellidos del usuario.
   * @param {string} req.body.email El correo electrónico del usuario.
   * @param {string} req.body.contrasenya La contraseña del usuario.
   * @param {Response} res Objeto de respuesta de Express para enviar la respuesta al cliente.
   * @returns {void}
   * @throws {Error} Si hay un problema al insertar el usuario en la base de datos.
   */
    router.post("/usuarios", async (req, res) => {
      const { nombre, apellidos, correo, contrasenya , telefono} = req.body;
  
      console.log("Datos recibidos:", req.body); // Log para verificar los datos recibidos
  
      try {
          // Asegúrate de que todos los datos estén presentes
          if (!nombre || !apellidos || !correo || !contrasenya || !telefono) {
              return res.status(400).json({ error: "Faltan datos requeridos" });
          }
  
          // Insertar el nuevo usuario en la base de datos
          const [result] = await pool.query(
              "INSERT INTO Usuarios (Nombre, Apellidos, Correo, Contrasenya, Telefono) VALUES (?, ?, ?, ?, ?)",
              [nombre, apellidos, correo, contrasenya, telefono] // Se inserta 0 en Verificado por defecto
          );
  
          res.status(201).json({
              id: result.insertId, // ID del nuevo usuario insertado
              nombre,
              apellidos,
              correo,
              telefono, 
          });
      } catch (error) {
          console.error("Error al registrar el usuario:", error);
          res.status(500).json({
              error: "Error al registrar el usuario",
              details: error.message,
          });
      }
  });
  


  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiRoutes; 
