

// funcionesPUT.js

//------------------------------------------------------------------
// Funciones auxiliares para operaciones de actualización (PUT) 
// relacionadas con los usuarios y sensores en la base de datos.
//
// Requiere conexión a la base de datos (pool) y bcrypt para manejo
// de contraseñas seguras.
//------------------------------------------------------------------

import bcrypt from "bcryptjs"; // Librería para manejo de contraseñas seguras.
import { Criterios } from "../rutas/Ayudas.js"; // Función para validar contraseñas según criterios establecidos.

/**
 * @brief Actualiza los datos personales de un usuario.
 *
 * Esta función actualiza el nombre, apellidos y teléfono de un usuario en la base de datos
 * en función de su correo electrónico.
 *
 * @param {Object} pool - Pool de conexiones a la base de datos.
 * @param {Object} datosUsuario - Objeto con los datos del usuario.
 * @param {string} datosUsuario.Correo - Correo electrónico del usuario.
 * @param {string} datosUsuario.Nombre - Nuevo nombre del usuario.
 * @param {string} datosUsuario.Apellidos - Nuevos apellidos del usuario.
 * @param {string} datosUsuario.Telefono - Nuevo teléfono del usuario.
 * @returns {Object} - Mensaje de éxito si la operación fue exitosa.
 */

//--------------------------------------
// OBJ -> actualizarUsuario() -> OBJ
//--------------------------------------
export const actualizarUsuario = async (pool, { Correo, Nombre, Apellidos, Telefono }) => {
  try {
    const [result] = await pool.query(
      "UPDATE Usuarios SET Nombre = ?, Apellidos = ?, Telefono = ? WHERE Correo = ?",
      [Nombre, Apellidos, Telefono, Correo]
    );

    if (result.affectedRows === 0) {
      throw new Error("Usuario no encontrado"); // Si no se afectaron filas, el usuario no existe.
    }

    return { message: "Usuario actualizado correctamente" };
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw new Error("Error al actualizar usuario"); // Lanzar un error generalizado.
  }
};

/**
 * @brief Cambia la contraseña de un usuario.
 *
 * Valida la contraseña actual del usuario, verifica que cumpla los criterios 
 * establecidos para contraseñas nuevas y actualiza la contraseña en la base de datos.
 *
 * @param {Object} pool - Pool de conexiones a la base de datos.
 * @param {string} correo - Correo electrónico del usuario.
 * @param {string} contrasenaActual - Contraseña actual del usuario.
 * @param {string} contrasenaNueva - Nueva contraseña a establecer.
 * @returns {Object} - Mensaje de éxito si la operación fue exitosa.
 */

//--------------------------------------
// string, string, string -> cambiarContrasena() -> OBJ
//--------------------------------------
export const cambiarContrasena = async (pool, correo, contrasenaActual, contrasenaNueva) => {
  try {
    // Buscar la contraseña actual del usuario.
    const [usuario] = await pool.query(
      "SELECT Contrasenya FROM Usuarios WHERE Correo = ?",
      [correo]
    );

    if (usuario.length === 0) {
      throw new Error("Usuario no encontrado"); // Si no hay resultados, el usuario no existe.
    }

    // Comparar la contraseña actual proporcionada con la almacenada.
    const match = await bcrypt.compare(contrasenaActual, usuario[0].Contrasenya);
    if (!match) {
      throw new Error("La contraseña actual es incorrecta");
    }

    // Validar la nueva contraseña según los criterios establecidos.
    Criterios(contrasenaNueva);

    // Generar el hash de la nueva contraseña.
    const hashedNewPassword = await bcrypt.hash(contrasenaNueva, 10);

    // Actualizar la contraseña en la base de datos.
    await pool.query(
      "UPDATE Usuarios SET Contrasenya = ? WHERE Correo = ?",
      [hashedNewPassword, correo]
    );

    return { message: "Contraseña actualizada correctamente" };
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    throw new Error(error.message || "Error al cambiar la contraseña");
  }
};

/**
 * @brief Asigna un sensor a un usuario específico.
 *
 * Actualiza el sensor en la base de datos para asignarlo a un usuario identificado
 * por su ID. Se utiliza la etiqueta del sensor para identificarlo.
 *
 * @param {Object} pool - Pool de conexiones a la base de datos.
 * @param {string} etiqueta - Etiqueta única del sensor.
 * @param {number} id_usuario - ID del usuario al que se asignará el sensor.
 * @returns {Object} - Mensaje de éxito y detalles de la asignación.
 */

//--------------------------------------
// string, int -> asignarSensor() -> OBJ
//--------------------------------------
export const asignarSensor = async (pool, etiqueta, id_usuario) => {
  try {
    if (!id_usuario) {
      throw new Error("El campo id_usuario es requerido"); // Validar que el ID del usuario se haya proporcionado.
    }

    // Actualizar el sensor con el ID del usuario proporcionado.
    const [result] = await pool.query(
      "UPDATE Sensor SET Usuario = ? WHERE Etiqueta = ?",
      [id_usuario, etiqueta]
    );

    if (result.affectedRows === 0) {
      throw new Error("Sensor no encontrado o no se pudo actualizar"); // Verificar si se afectaron filas.
    }

    return {
      message: "Usuario asignado al sensor exitosamente",
      etiqueta,
      id_usuario,
    };
  } catch (error) {
    console.error("Error al asignar el usuario al sensor:", error);
    throw new Error("Error al asignar el usuario al sensor en la base de datos");
  }
};
