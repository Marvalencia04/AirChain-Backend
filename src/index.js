import express from "express";
import { createPool } from "mysql2/promise";
import { config } from "dotenv";
import cors from "cors";
import apiRoutes from "../rutas/api.js"; // Importar las rutas desde api.js

// Cargar las variables de entorno desde el archivo .env
config();

/**
 * @brief Crea y configura una aplicación Express.
 *
 * Esta función crea una instancia de una aplicación Express,
 * configurando el pool de conexiones a la base de datos y las rutas necesarias.
 * 
 * param: (Object? pool) -> createApp() -> express.Application
 * param: (number? port=3000) -> createApp() -> express.Application
 *
 * @param {Object} [pool] - El pool de conexiones a la base de datos (opcional).
 * @param {number} [port=3000] - El puerto en el que la aplicación escuchará.
 * @returns {express.Application} La aplicación Express configurada.
 */
const createApp = (pool = null, port = process.env.NODE_DOCKER_PORT || 3000) => {
  // Si no hay un pool proporcionado, se creará un nuevo pool.
  if (!pool) {
    pool = createPool({
      host: process.env.MYSQLDB_HOST,
      user: "root",
      password: process.env.MYSQLDB_ROOT_PASSWORD,
      port: process.env.MYSQLDB_PORT || 3306, // Cambia esto si tienes un puerto diferente para MySQL
      database: process.env.MYSQLDB_DATABASE,
    });
    console.log("Conexión a la base de datos exitosa");
  }

  const app = express(); // Crear una nueva aplicación Express

  // Middleware para habilitar CORS
  app.use(cors());
  app.use(express.static("public")); // Middleware para servir archivos estáticos como HTML
  app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes JSON

  // Usar las rutas de la API
  app.use("/api/gases", apiRoutes(pool));

  console.log("Iniciando servidor en el puerto:", port);
  // Iniciar el servidor en el puerto especificado
  app.listen(port, () => {
    console.log("Server is running on port", port);
  });

  return app; // Asegúrate de devolver la app
};

// Crear y configurar la aplicación, usando el puerto por defecto
/**
 * @brief Crea y configura la aplicación Express por defecto.
 *
 * Este método crea una instancia de la aplicación utilizando el pool y el puerto por defecto.
 *
 * param: () -> app -> express.Application
 * @returns {express.Application}
 */
const app = createApp(); // Cambiar según el entorno
export default createApp;
