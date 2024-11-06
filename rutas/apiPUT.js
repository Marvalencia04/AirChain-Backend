// apiPUT.js

//------------------------------------------------------------------
//
// Emilio Sánchez Granado
// Marcos Martinez Yuste
// 28/10/24
//
//-------------------------------------------------------------------

import { Router } from "express";
import bcrypt from 'bcryptjs'; // Para cifrar contraseñas
import { Criterios } from './Ayudas.js';
/**
 * @brief Crea las rutas relacionadas con la API de gases.
 *
 * @param {Pool} pool El pool de conexiones a la base de datos.
 * @returns {Router} El enrutador configurado.
 * param: (Pool) -> apiRoutes() -> Router
 */
const apiPUTRoutes = (pool) => {
  const router = Router();
  
//------------------------------------------------------------------------------------------------

  /**
   * @brief Ruta para actualizar los datos de un usuario en la base de datos.
   *
   * Esta ruta maneja las solicitudes PUT a "/usuarios/:id",
   * extrayendo los parámetros del cuerpo de la solicitud y el
   * ID del usuario de los parámetros de la ruta.
   *
   * @param {Object} req Cuerpo de la solicitud que contiene los nuevos datos del usuario.
   * @param {number} req.params.id El ID del usuario a actualizar.
   * @param {string} req.body.nombre El nuevo nombre del usuario.
   * @param {string} req.body.apellidos Los nuevos apellidos del usuario.
   * @param {string} req.body.email El nuevo correo electrónico del usuario.
   * @param {string} req.body.contrasenya La nueva contraseña del usuario.
   * @param {Response} res Objeto de respuesta de Express para enviar la respuesta al cliente.
   * @returns {void}
   * @throws {Error} Si hay un problema al actualizar el usuario en la base de datos.
   */
  router.put("/usuarios/:id", async (req, res) => {
    const { id } = req.params; // Obtener el ID del usuario
    const { nombre, apellidos, correo, contrasenya, telefono } = req.body;

    try {
      // Validar que al menos un campo a actualizar esté presente
      if (!nombre && !apellidos && !correo && !contrasenya && !telefono) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }

      // Construir la consulta de actualización
      const updates = [];
      const values = [];

      if (nombre) {
        updates.push("Nombre = ?");
        values.push(nombre);
      }
      if (apellidos) {
        updates.push("Apellidos = ?");
        values.push(apellidos);
      }
      if (correo) {
        updates.push("Correo = ?");
        values.push(correo);
      }
      if (contrasenya) {
        Criterios(contrasenya); // Validar la nueva contraseña
        const hashedPassword = await bcrypt.hash(contrasenya, 10);
        updates.push("Contrasenya = ?");
        values.push(hashedPassword);
      }
      if (telefono) {
        updates.push("Telefono = ?");
        values.push(telefono);
      }

      // Añadir el ID al final de los valores
      values.push(id);

      // Ejecutar la consulta de actualización
      const query = `UPDATE Usuarios SET ${updates.join(", ")} WHERE ID_Usuarios = ?`;
      const [result] = await pool.query(query, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.status(200).json({
        id,
        nombre,
        apellidos,
        correo,
        telefono,
      });

    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({
        error: "Error al actualizar el usuario",
        details: error.message,
      });
    }
  });
//------------------------------------------------------------------------------------------------

  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiPUTRoutes;


