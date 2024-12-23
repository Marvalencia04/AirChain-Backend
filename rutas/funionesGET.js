/**
 * @brief Recupera todas las medidas almacenadas en la base de datos.
 * @returns {Promise<Array>} Lista de todas las medidas en la base de datos.
 * @throws {Error} Error si la consulta a la base de datos falla.
 */

//--------------------------------------
// getMedidas() -> Array
//--------------------------------------
const getMedidas = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM Medidas"); /**< Consulta para obtener todas las medidas. */
        return rows; /**< Retorna las medidas obtenidas. */
    } catch (error) {
        console.error("Error en la consulta de medidas:", error);
        throw new Error("Error retrieving data"); /**< Lanza un error en caso de fallo. */
    }
};

/**
 * @brief Obtiene información administrativa de los sensores.
 * @details Incluye información como el propietario del sensor, última medida registrada y valores de gases medidos.
 * @returns {Promise<Array>} Lista con los datos administrativos de los sensores.
 * @throws {Error} Error si la consulta a la base de datos falla.
 */

//--------------------------------------
// getDatosAdmin() -> Array
//--------------------------------------
const getDatosAdmin = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT s.ID_Sensor, u.Nombre AS Propietario, MAX(m.Hora) AS Ultima_Medida,
            MAX(CASE WHEN m.Gas = 'Ozono' THEN m.Valor END) AS Ozono,
            MAX(CASE WHEN m.Gas = 'Dióxido de Nitrógeno' THEN m.Valor END) AS Dioxido_Nitrogeno,
            MAX(CASE WHEN m.Gas = 'Monóxido de Carbono' THEN m.Valor END) AS Monoxido_Carbono
            FROM Sensor s
            LEFT JOIN Usuarios u ON s.Usuario = u.ID_Usuarios
            LEFT JOIN Medidas m ON s.ID_Sensor = m.Sensor
            GROUP BY s.ID_Sensor, u.Nombre;
        `); /**< Consulta para obtener datos administrativos de sensores. */
        return rows; /**< Retorna los datos administrativos. */
    } catch (error) {
        console.error("Error en datosAdmin:", error);
        throw new Error("Error retrieving admin data"); /**< Lanza un error en caso de fallo. */
    }
};

/**
 * @brief Recupera todos los usuarios almacenados en la base de datos.
 * @returns {Promise<Array>} Lista de todos los usuarios.
 * @throws {Error} Error si la consulta a la base de datos falla.
 */

//--------------------------------------
// getUsuarios() -> Array
//--------------------------------------
const getUsuarios = async () => {
    try {
        const [rows] = await pool.query("SELECT * FROM Usuarios"); /**< Consulta para obtener todos los usuarios. */
        return rows; /**< Retorna los usuarios obtenidos. */
    } catch (error) {
        console.error("Error en la consulta de usuarios:", error);
        throw new Error("Error retrieving data"); /**< Lanza un error en caso de fallo. */
    }
};

/**
 * @brief Obtiene un usuario por su correo electrónico.
 * @param {string} Correo El correo electrónico del usuario.
 * @returns {Promise<Array>} Información del usuario correspondiente al correo proporcionado.
 */

//--------------------------------------
// string -> getUsuarioPorCorreo() -> Array
//--------------------------------------
const getUsuarioPorCorreo = async (Correo) => {
    const [rows] = await pool.query(
        "SELECT ID_Usuarios, Nombre, Apellidos, Correo, Contrasenya, Telefono, Verificado FROM Usuarios WHERE Correo = ?",
        [Correo]
    ); /**< Consulta para obtener un usuario por correo. */
    return rows; /**< Retorna la información del usuario. */
};

/**
 * @brief Verifica si la contraseña proporcionada coincide con la almacenada en la base de datos.
 * @param {string} contrasenaIngresada La contraseña ingresada por el usuario.
 * @param {string} contrasenaGuardada La contraseña almacenada en la base de datos.
 * @returns {Promise<boolean>} Verdadero si las contraseñas coinciden, falso de lo contrario.
 */

//--------------------------------------
// string, string -> verificarContrasena() -> V/F
//--------------------------------------
const verificarContrasena = async (contrasenaIngresada, contrasenaGuardada) => {
    return bcrypt.compare(contrasenaIngresada, contrasenaGuardada); /**< Compara las contraseñas utilizando bcrypt. */
};

/**
 * @brief Obtiene un usuario utilizando su ID biométrico.
 * @param {string} ID_Biometrico El ID biométrico del usuario.
 * @returns {Promise<Array>} Información del usuario correspondiente al ID biométrico.
 */

//--------------------------------------
// string -> getUsuarioPorBiometrico() -> Array
//--------------------------------------
const getUsuarioPorBiometrico = async (ID_Biometrico) => {
    const [rows] = await pool.query(
        "SELECT ID_Usuarios, Nombre, Apellidos, Correo, Telefono, Verificado FROM Usuarios WHERE ID_Biometrico = ?",
        [ID_Biometrico]
    ); /**< Consulta para obtener un usuario por ID biométrico. */
    return rows; /**< Retorna la información del usuario. */
};

/**
 * @brief Obtiene todos los sensores asignados a un usuario específico.
 * @param {number} id_usuario El ID del usuario.
 * @returns {Promise<Array>} Lista de sensores asignados al usuario.
 */

//--------------------------------------
// int -> getSensoresPorUsuario() -> Array
//--------------------------------------
const getSensoresPorUsuario = async (id_usuario) => {
    const [sensores] = await pool.query(
        "SELECT * FROM Sensor WHERE Usuario = ?",
        [id_usuario]
    ); /**< Consulta para obtener los sensores por usuario. */
    return sensores; /**< Retorna los sensores asignados. */
};

/**
 * @brief Marca a un usuario como verificado en la base de datos.
 * @param {number} userId El ID del usuario.
 * @returns {Promise<Object>} Resultado de la operación de actualización.
 */

//--------------------------------------
// int -> verificarUsuario() -> OBJ
//--------------------------------------
const verificarUsuario = async (userId) => {
    const [result] = await pool.query(
        "UPDATE Usuarios SET Verificado = 1 WHERE ID_Usuarios = ?",
        [userId]
    ); /**< Consulta para verificar al usuario. */
    return result; /**< Retorna el resultado de la operación. */
};

/**
 * @brief Recupera la distancia diaria acumulada para un usuario específico.
 * @param {number} ID_Usuarios El ID del usuario.
 * @returns {Promise<Array>} Distancia acumulada diaria del usuario.
 */

//--------------------------------------
// int -> ID_Usuarios() -> Array
//--------------------------------------
const getDistancia = async (ID_Usuarios) => {
    const [rows] = await pool.query(
        "SELECT total_distance_today FROM Usuarios WHERE ID_Usuarios = ?",
        [ID_Usuarios]
    ); /**< Consulta para obtener la distancia diaria acumulada. */
    return rows; /**< Retorna la distancia acumulada. */
};
