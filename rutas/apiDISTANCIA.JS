// Importar las dependencias necesarias
import { Router } from "express";
import cron from "node-cron";

/**
 * @brief Crea las rutas relacionadas con la API de distancia.
 *
 * @param {Pool} pool El pool de conexiones a la base de datos.
 * @returns {Router} El enrutador configurado.
 * param: (Pool) -> apiRoutes() -> Router
 */
const apiRoutes = (pool) => {
  const router = Router();

  //------------------------------------------------------------------------------------------
  /**
   * @brief Ruta para añadir la distancia recorrida a la base de datos.
   *
   * Esta ruta maneja las solicitudes POST a "/distancia",
   * agregando la distancia al total diario y actualizando la base de datos.
   *
   * @param {Object} req Cuerpo de la solicitud que contiene el ID del usuario y la distancia.
   * @param {number} req.body.userId El ID del usuario.
   * @param {number} req.body.distancia La distancia recorrida a añadir al total diario.
   * @param {Response} res Objeto de respuesta de Express para enviar la respuesta al cliente.
   * @returns {void}
   * @throws {Error} Si hay un problema al actualizar la distancia en la base de datos.
   */
  router.post("/distancia", async (req, res) => {
    const { userId, distancia } = req.body;

    try {
      // Validar que todos los campos requeridos estén presentes
      if (!userId || distancia == null) {
        return res.status(400).json({ error: "Faltan datos requeridos" });
      }

      // Buscar al usuario en la base de datos
      const [rows] = await pool.query(
        "SELECT total_distance_today, last_updated FROM user_distance WHERE user_id = ?",
        [userId]
      );

      if (rows.length === 0) {
        // Si no existe registro del usuario en user_distance, crear uno nuevo
        await pool.query(
          "INSERT INTO user_distance (user_id, total_distance_today, last_updated) VALUES (?, ?, CURRENT_DATE)",
          [userId, distancia]
        );
        return res.status(201).json({ message: "Distancia añadida correctamente", nuevaDistancia: distancia });
      }

      const usuario = rows[0];
      const hoy = new Date().toISOString().split("T")[0];
      const ultimaActualizacion = usuario.last_updated ? new Date(usuario.last_updated).toISOString().split("T")[0] : null;

      // Si不是今天, reiniciar la distancia
      let nuevaDistancia = usuario.total_distance_today;
      if (ultimaActualizacion !== hoy) {
        nuevaDistancia = 0;
      }

      // Sumar la distancia nueva
      nuevaDistancia += distancia;

      // Actualizar la distancia en la base de datos
      await pool.query(
        "UPDATE user_distance SET total_distance_today = ?, last_updated = ? WHERE user_id = ?",
        [nuevaDistancia, hoy, userId]
      );

      res.status(200).json({ message: "Distancia actualizada correctamente", nuevaDistancia });
    } catch (error) {
      console.error("Error al actualizar la distancia:", error);
      res.status(500).json({ error: "Error al actualizar la distancia" });
    }
  });

  //------------------------------------------------------------------------------------------
  /**
   * @brief Tarea programada para restablecer la distancia diaria de todos los usuarios a medianoche.
   *
   * Utiliza node-cron para ejecutar la tarea cada día a medianoche (00:00).
   *
   * @returns {void}
   */
  cron.schedule("0 0 0 * * *", async () => {
    try {
      // Reiniciar la distancia de todos los usuarios en la base de datos
      await pool.query("UPDATE user_distance SET total_distance_today = 0, last_updated = CURRENT_DATE");
      console.log("Distancia diaria restablecida para todos los usuarios a medianoche");
    } catch (error) {
      console.error("Error al restablecer la distancia diaria:", error);
    }
  });

  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiRoutes;
