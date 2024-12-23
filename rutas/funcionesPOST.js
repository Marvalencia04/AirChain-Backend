

import bcrypt from "bcryptjs";


/**
 * Inserta una nueva medida de gas en la base de datos.
 * @param {Object} pool - Conexión a la base de datos.
 * @param {Object} data - Datos de la medida.
 * @param {string} data.gas - Nombre del gas.
 * @param {number} data.valor - Valor del gas.
 * @param {string} data.hora - Hora de la medida.
 * @param {number} data.latitud - Latitud del sensor.
 * @param {number} data.longitud - Longitud del sensor.
 * @param {string} data.sensor - Identificador del sensor.
 * @returns {Object} Datos de la medida insertada.
 */

//--------------------------------------
// OBJ -> insertarMedida() -> OBJ
//--------------------------------------
export async function insertarMedida(pool, { gas, valor, hora, latitud, longitud, sensor }) {
  const [result] = await pool.query(
    "INSERT INTO Medidas (Gas, Valor, Hora, Latitud, Longitud, Sensor) VALUES (?, ?, ?, ?, ?, ?)",
    [gas, valor, hora, latitud, longitud, sensor]
  );

  return {
    id: result.insertId,
    gas,
    valor,
    hora,
    latitud,
    longitud,
    sensor,
  };
}

/**
 * Registra un nuevo usuario en la base de datos.
 * @param {Object} pool - Conexión a la base de datos.
 * @param {Object} data - Datos del usuario.
 * @param {string} data.nombre - Nombre del usuario.
 * @param {string} data.apellidos - Apellidos del usuario.
 * @param {string} data.correo - Correo electrónico.
 * @param {string} data.contrasenya - Contraseña sin cifrar.
 * @param {string} data.telefono - Teléfono del usuario.
 * @returns {Object} Datos del usuario registrado.
 */

//--------------------------------------
// OBJ -> registrarUsuario() -> OBJ
//--------------------------------------
export async function registrarUsuario(pool, emailService, { nombre, apellidos, correo, contrasenya, telefono }) {
  const hashedPassword = await bcrypt.hash(contrasenya, 10);

  const [result] = await pool.query(
    "INSERT INTO Usuarios (Nombre, Apellidos, Correo, Contrasenya, Telefono, Distancia, Verificado) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [nombre, apellidos, correo, hashedPassword, telefono, 0, 0]
  );

  const userId = result.insertId;

  await emailService.enviarCorreo(correo, nombre, userId);

  return {
    id: userId,
    nombre,
    apellidos,
    correo,
    telefono,
    verificado: 0,
  };
}

/**
 * Crea un nuevo sensor en la base de datos con una etiqueta única.
 * @param {Object} pool - Conexión a la base de datos.
 * @returns {Object} Datos del sensor creado.
 */

//--------------------------------------
// crearSensor() -> OBJ
//--------------------------------------
export async function crearSensor(pool) {
  let etiqueta;
  let insertado = false;
  let result;

  while (!insertado) {
    etiqueta = Array.from({ length: 8 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(
        Math.floor(Math.random() * 62)
      )
    ).join("");

    try {
      [result] = await pool.query(
        "INSERT INTO Sensor (Etiqueta, Usuario) VALUES (?, NULL)",
        [etiqueta]
      );
      insertado = true;
    } catch (error) {
      if (error.code !== "ER_DUP_ENTRY") throw error;
    }
  }

  return { id_sensor: result.insertId, etiqueta };
}

/**
 * Asocia un identificador biométrico a un usuario existente.
 * @param {Object} pool - Conexión a la base de datos.
 * @param {Object} data - Datos del registro.
 * @param {string} data.Correo - Correo del usuario.
 * @param {string} data.ID_Biometrico - Identificador biométrico.
 * @returns {void}
 */

//--------------------------------------
// OBJ -> registrarBiometrico() -> OBJ
//--------------------------------------
export async function registrarBiometrico(pool, { Correo, ID_Biometrico }) {
  const [result] = await pool.query(
    "UPDATE Usuarios SET ID_Biometrico = ? WHERE Correo = ?",
    [ID_Biometrico, Correo]
  );

  if (result.affectedRows === 0) {
    throw new Error("Usuario no encontrado");
  }
}

/**
 * Actualiza la distancia recorrida por un usuario.
 * @param {Object} pool - Conexión a la base de datos.
 * @param {Object} data - Datos de la distancia.
 * @param {number} data.ID_Usuarios - ID del usuario.
 * @param {number} data.distancia - Distancia recorrida.
 * @returns {number} Nueva distancia acumulada.
 */
//--------------------------------------
// OBJ -> actualizarDistancia() -> OBJ
//--------------------------------------
export async function actualizarDistancia(pool, { ID_Usuarios, distancia }) {
  const [rows] = await pool.query(
    "SELECT total_distance_today, last_updated FROM Usuarios WHERE ID_Usuarios = ?",
    [ID_Usuarios]
  );

  if (rows.length === 0) {
    throw new Error("Usuario no encontrado");
  }

  const usuario = rows[0];
  const hoy = new Date().toISOString().split("T")[0];
  const ultimaActualizacion = usuario.last_updated
    ? new Date(usuario.last_updated).toISOString().split("T")[0]
    : null;

  let nuevaDistancia = parseFloat(usuario.total_distance_today);
  if (ultimaActualizacion !== hoy) {
    nuevaDistancia = 0;
  }

  nuevaDistancia += parseFloat(distancia);

  await pool.query(
    "UPDATE Usuarios SET total_distance_today = ?, last_updated = ? WHERE ID_Usuarios = ?",
    [nuevaDistancia, hoy, ID_Usuarios]
  );

  return nuevaDistancia;
}
