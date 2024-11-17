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

  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiPOSTRoutes;

