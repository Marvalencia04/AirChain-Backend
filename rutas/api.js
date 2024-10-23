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

  return router; // Retornar el enrutador con las rutas configuradas
};

export default apiRoutes; 
