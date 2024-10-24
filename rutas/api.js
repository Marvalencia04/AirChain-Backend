import { Router } from "express";
import bcrypt from "bcrypt"; // Para cifrar contraseñas
import EmailService from "./src/EmailService.js";

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

  router.get("/usuarios", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT * FROM Usuarios"); // Ejecutar la consulta
      res.json(rows); // Enviar la respuesta con los datos obtenidos
    } catch (error) {
      console.error("Error en la consulta de gases:", error);
      res.status(500).send("Error retrieving data"); // Enviar error si la consulta falla
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
  // Ruta para registrar un nuevo usuario
  router.post("/usuarios", async (req, res) => {
    const { nombre, apellidos, correo, contrasenya } = req.body;

    console.log("Datos recibidos:", req.body);

    try {
      // Validar que todos los campos estén presentes
      if (!nombre || !apellidos || !correo || !contrasenya) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }

      // Cifrar la contraseña antes de insertarla
      const hashedPassword = await bcrypt.hash(contrasenya, 10);

      // Insertar el nuevo usuario en la base de datos
      const [result] = await pool.query(
        "INSERT INTO Usuarios (Nombre, Apellidos, Correo, Contrasenya, Verificado) VALUES (?, ?, ?, ?, ?)",
        [nombre, apellidos, correo, hashedPassword, 0] // Insertar la contraseña cifrada
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

  // Ruta para verificar la cuenta del usuario
  router.get("/usuarios/verify/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
      // Actualizar el estado de verificación del usuario
      const [result] = await pool.query(
        "UPDATE Usuarios SET Verificado = 1 WHERE ID = ?",
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

  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiRoutes; 
