// api.js

//------------------------------------------------------------------
//
// Emilio Sánchez Granado
// Marcos Martinez Yuste
// 28/10/24
//
//-------------------------------------------------------------------


import { Router } from "express";
import bcrypt from 'bcryptjs';// Para cifrar contraseñas
import EmailService from "../src/EmailService.js";

/**
 * @brief Crea las rutas relacionadas con la API de gases.
 *
 * @param {Pool} pool El pool de conexiones a la base de datos.
 * @returns {Router} El enrutador configurado.
 * param: (Pool) -> apiRoutes() -> Router
 */
const apiRoutes = (pool) => {
  const router = Router();
  // Crear una instancia de EmailService
  const emailService = new EmailService();
  
//------------------------------------------------------------------------------------------------  
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
  router.get("/medidas", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM Medidas"); // Ejecutar la consulta
      res.json(rows); // Enviar la respuesta con los datos obtenidos
    } catch (error) {
      console.error("Error en la consulta de gases:", error);
      res.status(500).send("Error retrieving data"); // Enviar error si la consulta falla
    }
  });

//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------

    /**
   * @brief Ruta de prueba para obtener datos de usuarios desde la base de datos.
   * 
   * @returns {void}
   * @throws {Error} Si hay un problema en la consulta de la base de datos.
   */
  router.get("/prueba", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM Usuarios"); // Ejecutar la consulta
      res.json(rows); // Enviar la respuesta con los datos obtenidos
    } catch (error) {
      console.error("Error en la consulta de gases:", error);
      res.status(500).send("Error retrieving data"); // Enviar error si la consulta falla
    }
  });
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
  /**
   * @brief Ruta para verificar credenciales de usuario y autenticación.
   *
   * Filtra por correo electrónico y compara la contraseña con la cifrada en la base de datos.
   * 
   * @param {Object} req Objeto de solicitud con las credenciales.
   * @param {string} req.query.Correo Correo del usuario.
   * @param {string} req.query.Contrasenya Contraseña del usuario.
   * @returns {Object} Objeto JSON con los datos del usuario o un mensaje de error.
   * @throws {Error} Si las credenciales no son correctas o hay problemas de consulta.
   */
  router.get("/usuarios", async (req, res) => {
    const { Correo, Contrasenya } = req.query; // Obtener correo y contraseña desde la solicitud

    try {
        const [rows] = await pool.query(
            "SELECT ID_Usuarios, Nombre, Apellidos, Correo, Contrasenya, Telefono, Verificado FROM Usuarios WHERE Correo = ?",
            [Correo]
        ); // Filtrar solo por correo

        if (rows.length === 0) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }
        
        // Verificar la contraseña
        const usuario = rows[0];
        
        // Aquí deberías comparar la contraseña hasheada
        const match = await bcrypt.compare(Contrasenya, usuario.Contrasenya);
        
        if (!match) {
            return res.status(401).json({ error: "Credenciales incorrectas" });
        }

        // Verificar si el usuario está verificado
        if (usuario.Verificado === 0) {
            return res.status(403).json({ error: "Cuenta no verificada. Por favor verifica tu cuenta antes de iniciar sesión." });
        }
        
        // Si todo es correcto, enviar solo el usuario encontrado
        res.json(usuario); // Enviar solo el usuario encontrado
    } catch (error) {
        console.error("Error en la consulta de usuario:", error);
        res.status(500).send("Error retrieving user data");
    }
});
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
/**
 * @brief Ruta para obtener los datos del usuario por su correo electrónico.
 * @param {string} req.params.correo - El correo del usuario a buscar en la base de datos.
 * @returns {Object} JSON con los datos del usuario si se encuentra en la base de datos.
 * @throws Retorna un código de error 404 si el usuario no se encuentra, 
 *         o 500 si ocurre un error de servidor durante la operación.
 */
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
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * @brief Ruta para actualizar el nombre y los apellidos del usuario.
 * @param {string} req.body.Correo - El correo del usuario para identificarlo en la base de datos.
 * @param {string} req.body.Nombre - El nuevo nombre del usuario.
 * @param {string} req.body.Apellidos - Los nuevos apellidos del usuario.
 * @returns {Object} JSON con un mensaje de éxito si el usuario es actualizado correctamente.
 * @throws Retorna un código de error 500 si ocurre un problema en el servidor.
 */
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
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * @brief Ruta para actualizar el número de teléfono del usuario según su correo electrónico.
 * @param {string} req.params.correo - El correo del usuario a actualizar.
 * @param {string} req.body.Telefono - El nuevo número de teléfono del usuario.
 * @returns {Object} JSON con un mensaje de éxito si el teléfono es actualizado correctamente.
 * @throws Retorna un código de error 404 si el usuario no se encuentra, 
 *         o 500 si ocurre un problema en el servidor.
 */
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
//------------------------------------------------------------------------------------------------

//------------------------------------------------------------------------------------------------
/**
 * @brief Ruta para cambiar la contraseña del usuario.
 * @param {string} req.params.correo - El correo del usuario para identificarlo en la base de datos.
 * @param {string} req.body.contrasenaActual - La contraseña actual del usuario para la verificación.
 * @param {string} req.body.contrasenaNueva - La nueva contraseña del usuario a establecer.
 * @returns {Object} JSON con un mensaje de éxito si la contraseña es cambiada correctamente.
 * @throws Retorna un código de error 404 si el usuario no se encuentra, 
 *         401 si la contraseña actual no es correcta, o 500 si ocurre un problema en el servidor.
 */
// Ruta para cambiar la contraseña del usuario
router.put("/usuario/:correo/cambiar-contrasena", async (req, res) => {
  const { correo } = req.params;
  const { contrasenaActual, contrasenaNueva } = req.body;

  try {
      // Verificar si la contraseña actual es correcta
      const [usuario] = await pool.query(
          "SELECT Contrasenya FROM Usuarios WHERE Correo = ?",
          [correo]
      );

      if (usuario.length === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Comparar la contraseña actual con la contraseña en la base de datos
      const match = await bcrypt.compare(contrasenaActual, usuario[0].Contrasenya);
      if (!match) {
          return res.status(401).json({ error: "La contraseña actual es incorrecta" });
      }
      // Validar la contraseña
      Criterios(contrasenya);
      
      // Encriptar la nueva contraseña
      const hashedNewPassword = await bcrypt.hash(contrasenaNueva, 10);

      // Actualizar la contraseña en la base de datos
      await pool.query(
          "UPDATE Usuarios SET Contrasenya = ? WHERE Correo = ?",
          [hashedNewPassword, correo]
      );

      res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      res.status(500).json({ error: "Error al cambiar la contraseña" });
  }
});
//------------------------------------------------------------------------------------------------



//------------------------------------------------------------------------------------------------
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
  // Endpoint para insertar una nueva medida de gas
router.post("/medidas", async (req, res) => {
  // Desestructuramos los nuevos parámetros de la solicitud
  const { gas, valor, hora, latitud, longitud, sensor } = req.body;

  try {
    // Validar que todos los campos requeridos estén presentes
    if (!gas || !valor || !hora || latitud == null || longitud == null || !sensor) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    // Insertar la nueva medida en la base de datos
    const [result] = await pool.query(
      "INSERT INTO Medidas (Gas, Valor, Hora, Latitud, Longitud, Sensor) VALUES (?, ?, ?, ?, ?, ?)",
      [gas, valor, hora, latitud, longitud, sensor]
    );

    res.status(201).json({
      id: result.insertId,
      gas,
      valor,
      hora,
      latitud,
      longitud,
      sensor,
    });
  } catch (error) {
    console.error("Error al insertar medida:", error);
    res.status(500).json({
      error: "Error al insertar medida",
      details: error.message,
    });
  }
});
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
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
    const { nombre, apellidos, correo, contrasenya, telefono } = req.body;
  
    console.log("Datos recibidos:", req.body);
  
    try {
      // Validar que todos los campos estén presentes
      if (!nombre || !apellidos || !correo || !contrasenya || !telefono) { 
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }
     // Validar la contraseña
    Criterios(contrasenya);
      // Cifrar la contraseña antes de insertarla
      const hashedPassword = await bcrypt.hash(contrasenya, 10);
  
      // Insertar el nuevo usuario en la base de datos
      const [result] = await pool.query(
        "INSERT INTO Usuarios (Nombre, Apellidos, Correo, Contrasenya, Telefono, Distancia, Verificado) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [nombre, apellidos, correo, hashedPassword, telefono, 0, 0] // Se inserta 0 en Distancia y Verificado por defecto
      );
  
      const userId = result.insertId; // Obtener el ID del usuario insertado
  
      // Enviar el correo de verificación
      try {
        await emailService.enviarCorreo(correo, nombre, userId);
      } catch (error) {
        console.error("Error al enviar el correo:", error.message);
        return res.status(500).json({ error: "Error al enviar el correo de confirmación" });
      }
  
      res.status(201).json({
        id: userId,
        nombre,
        apellidos,
        correo,
        telefono,
        verificado: 0,
      });
  
    } catch (error) {
      console.error("Error al registrar el usuario:", error);
      res.status(500).json({
        error: "Error al registrar el usuario",
        details: error.message,
      });
    }
  });
//------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
/**
 * @brief Ruta para verificar la cuenta del usuario, cambiando su estado de verificación en la base de datos.
 * @param {string} req.params.userId - El ID del usuario a verificar en la base de datos.
 * @returns {Object|string} Mensaje de éxito si la cuenta es verificada correctamente. También se puede redirigir a una página de éxito.
 * @throws Retorna un código de error 404 si el usuario no se encuentra en la base de datos, 
 *         o 500 si ocurre un problema en el servidor durante la operación.
 */
  // Ruta para verificar la cuenta del usuario
  router.get("/usuarios/verify/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
      // Actualizar el estado de verificación del usuario
      const [result] = await pool.query(
        "UPDATE Usuarios SET Verificado = 1 WHERE ID_Usuarios = ?",
        [userId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Redirigir a una página de éxito o enviar un mensaje de confirmación
      res.send("¡Cuenta verificada exitosamente!"); // Redirigir a una página si tienes frontend
    } catch (error) {
      console.error("Error al verificar el usuario:", error);
      res.status(500).json({
        error: "Error al verificar el usuario",
        details: error.message,
      });
    }
  });
//------------------------------------------------------------------------------------------------




router.get("/usuariosMovil", async (req, res) => {
  const { Correo } = req.query;
  try {
    if (Correo) {
      const [rows] = await pool.query("SELECT * FROM Usuarios WHERE Correo = ?", [Correo]);
      if (rows.length === 0) {
        res.status(404).json({ error: "Usuario no encontrado" });
      } else {
        res.json(rows[0]);
      }
    } else {
      const [rows] = await pool.query("SELECT * FROM Usuarios");
      res.json(rows);
    }
  } catch (error) {
    console.error('Error en la consulta de usuarios:', error);
    res.status(500).send("Error retrieving user");
  }
});


router.put("/usuariosMovil", async (req, res) => {
  const { Nombre, Apellidos, Correo, Contrasenya, Telefono } = req.body;

  try {
    let hashedPassword = null;

    // Si se proporciona una nueva contraseña, encriptarla
    if (Contrasenya) {
      hashedPassword = await bcrypt.hash(Contrasenya, 10);
    }

    // Actualizar el usuario en la base de datos, incluyendo la contraseña si fue proporcionada
    const query = hashedPassword
      ? "UPDATE Usuarios SET Nombre = ?, Apellidos = ?, Contrasenya = ?, Telefono = ? WHERE Correo = ?"
      : "UPDATE Usuarios SET Nombre = ?, Apellidos = ?, Telefono = ? WHERE Correo = ?";
    const params = hashedPassword
      ? [Nombre, Apellidos, hashedPassword, Correo, Telefono]
      : [Nombre, Apellidos, Correo, Telefono];

    const [result] = await pool.query(query, params);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Usuario actualizado correctamente" });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).send("Error actualizando los datos");
  }
});


  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiRoutes;

function Criterios(password) {
  if (
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  ) {
    throw new Error("La contraseña debe tener al menos 8 caracteres, incluyendo letras mayúsculas, minúsculas, números y caracteres especiales.");
  }
  return true;
}


