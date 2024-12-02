// apiPOST.js

//------------------------------------------------------------------
//
// Emilio Sánchez Granado
// Marcos Martinez Yuste
// 28/10/24
//
//-------------------------------------------------------------------

import { Router } from "express";
import bcrypt from 'bcryptjs'; // Para cifrar contraseñas
import EmailService from "../src/EmailService.js";
import { Criterios } from '../rutas/Ayudas.js';
/**
 * @brief Crea las rutas relacionadas con la API de gases.
 *
 * @param {Pool} pool El pool de conexiones a la base de datos.
 * @returns {Router} El enrutador configurado.
 * param: (Pool) -> apiRoutes() -> Router
 */
const apiPOSTRoutes = (pool) => {
  const router = Router();
  // Crear una instancia de EmailService
  const emailService = new EmailService();
  
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
/**
 * @brief Ruta para crear un nuevo sensor en la base de datos sin usuario asignado.
 *
 * Esta ruta maneja las solicitudes POST a "/sensor" y genera una etiqueta
 * única para cada sensor antes de insertarlo en la base de datos.
 *
 * @param {Object} req Cuerpo vacío de la solicitud.
 * @param {Response} res Objeto de respuesta de Express para enviar la respuesta al cliente.
 * @returns {void}
 * @throws {Error} Si hay un problema al crear el sensor en la base de datos.
 */
router.post('/sensor', async (req, res) => {
    try {
      let etiqueta;
      let insertado = false;
      let result;
  
      // Bucle para intentar insertar un sensor con etiqueta única
      while (!insertado) {
        // Generar una etiqueta aleatoria
        etiqueta = Array.from({ length: 8 }, () =>
          'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt(
            Math.floor(Math.random() * 62)
          )
        ).join('');
  
        try {
          // Intentar insertar el sensor en la base de datos
          [result] = await pool.query(
            'INSERT INTO Sensor (Etiqueta, Usuario) VALUES (?, NULL)', // Usa el marcador de parámetro ?
            [etiqueta] // Pasa la etiqueta como un valor de parámetro
          );
          insertado = true; // Si la inserción es exitosa, marcar como insertado
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`Conflicto de etiqueta: ${etiqueta} ya existe, generando una nueva...`);
            // Si la etiqueta ya existe, el ciclo se repetirá para generar una nueva
          } else {
            throw error; // Si es otro tipo de error, lanzarlo
          }
        }
      }
  
      // Responder con éxito y la información del sensor
      res.status(201).json({
        message: 'Sensor creado exitosamente',
        id_sensor: result.insertId,
        etiqueta
      });
    } catch (error) {
      console.error('Error al crear el sensor:', error);
      res.status(500).json({ error: 'Error al crear el sensor en la base de datos' });
    }
  });
  
  /**
 * @brief Ruta para registrar el identificador biométrico de un usuario.
 * 
 * @param {string} req.body.Correo - El correo del usuario.
 * @param {string} req.body.ID_Biometrico - El identificador biométrico generado.
 * @returns {Object} JSON indicando éxito o error.
 */
router.post("/usuarios/biometrico", async (req, res) => {
  const { Correo, ID_Biometrico } = req.body;

  if (!Correo || !ID_Biometrico) {
    return res.status(400).json({ error: "Correo e ID_Biometrico son requeridos" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE Usuarios SET ID_Biometrico = ? WHERE Correo = ?",
      [ID_Biometrico, Correo]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "ID biométrico registrado con éxito" });
  } catch (error) {
    console.error("Error al registrar ID biométrico:", error);
    res.status(500).json({ error: "Error al registrar ID biométrico" });
  }
});  
  
  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiPOSTRoutes;

