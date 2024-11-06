// apiGET.js

//------------------------------------------------------------------
//
// Emilio Sánchez Granado
// Marcos Martinez Yuste
// 28/10/24
//
//-------------------------------------------------------------------

import { Router } from "express";
import bcrypt from 'bcryptjs';// Para cifrar contraseñas

/**
 * @brief Crea las rutas relacionadas con la API de gases.
 *
 * @param {Pool} pool El pool de conexiones a la base de datos.
 * @returns {Router} El enrutador configurado.
 * param: (Pool) -> apiRoutes() -> Router
 */
const apiGETRoutes = (pool) => {
  const router = Router();
  
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
  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiGETRoutes;
