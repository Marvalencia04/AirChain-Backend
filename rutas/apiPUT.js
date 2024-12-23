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
import { Criterios } from '../rutas/Ayudas.js';
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
// Ruta para actualizar los datos del usuario
router.put("/usuario", async (req, res) => {
  const { Correo, Nombre, Apellidos, Telefono } = req.body;

  try {
      const [result] = await pool.query(
          "UPDATE Usuarios SET Nombre = ?, Apellidos = ?, Telefono = ? WHERE Correo = ?",
          [Nombre, Apellidos, Telefono, Correo]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

      res.status(200).json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
      console.error("Error al actualizar usuario:", error);
      res.status(500).json({ error: "Error al actualizar usuario" });
  }
});
//------------------------------------------------------------------------------------------------
/**
 * @brief Endpoint para cambiar la contraseña de un usuario.
 * 
 * Este endpoint permite a un usuario actualizar su contraseña. Primero verifica 
 * que la contraseña actual proporcionada sea correcta, valida la nueva contraseña 
 * según criterios específicos y luego la actualiza en la base de datos.
 * 
 * @route PUT /usuario/:correo/cambiar-contrasena
 * @async
 * 
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {string} req.params.correo - Correo electrónico del usuario cuya contraseña será cambiada.
 * @param {Object} req.body - Contiene la contraseña actual y la nueva.
 * @param {string} req.body.contrasenaActual - Contraseña actual proporcionada por el usuario.
 * @param {string} req.body.contrasenaNueva - Nueva contraseña a establecer.
 * @param {Object} res - Objeto de respuesta HTTP.
 * 
 * @returns {Object} - Retorna un mensaje de éxito si la contraseña se actualizó correctamente o un mensaje de error si hubo un problema.
 * 
 * @throws {Error} - Retorna un código de estado 404 si el usuario no existe, 401 si la contraseña actual no coincide, 
 * o 500 si ocurre un error inesperado.
 */
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
      Criterios(contrasenaNueva);
      
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
/**
 * @brief Ruta para asignar un sensor a un usuario utilizando la etiqueta del sensor.
 *
 * Esta ruta maneja las solicitudes PUT a "/sensor/asignar" y permite asignar
 * el sensor especificado por su etiqueta al usuario indicado.
 *
 * @param {Object} req Cuerpo de la solicitud que contiene la etiqueta del sensor y el ID del usuario.
 * @param {string} req.body.etiqueta La etiqueta única del sensor.
 * @param {number} req.body.id_usuario El ID del usuario al cual se asignará el sensor.
 * @param {Response} res Objeto de respuesta de Express para enviar la respuesta al cliente.
 * @returns {void}
 * @throws {Error} Si hay un problema al asignar el sensor al usuario en la base de datos.
 */
router.put('/sensor/:etiqueta', async (req, res) => {
    const { etiqueta } = req.params; // Obtener la etiqueta del sensor desde los parámetros de la ruta
    const { id_usuario } = req.body; // Obtener el ID del usuario desde el cuerpo de la solicitud
  
    try {
      // Validar que el id_usuario esté presente en el cuerpo de la solicitud
      if (!id_usuario) {
        return res.status(400).json({ error: 'El campo id_usuario es requerido' });
      }
  
      // Actualizar el sensor para asignarle el id_usuario basándose en la etiqueta
      const [result] = await pool.query(
        'UPDATE Sensor SET Usuario = ? WHERE Etiqueta = ?',
        [id_usuario, etiqueta]
      );
  
      // Comprobar si se actualizó alguna fila
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Sensor no encontrado o no se pudo actualizar' });
      }
  
      // Responder con éxito si el sensor fue actualizado
      res.status(200).json({
        message: 'Usuario asignado al sensor exitosamente',
        etiqueta,
        id_usuario
      });
    } catch (error) {
      console.error('Error al asignar el usuario al sensor:', error);
      res.status(500).json({
        error: 'Error al asignar el usuario al sensor en la base de datos',
        details: error.message
      });
    }
  });
  
  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiPUTRoutes;


