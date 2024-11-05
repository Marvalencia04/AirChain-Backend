/**
 * @brief Función para validar criterios de entrada.
 *
 * Esta función verifica si los datos de entrada cumplen con ciertos criterios.
 *
 * @param {Object} password  - La contraseña a validar.
 * @returns {Object} Resultado de la validación, incluyendo un flag de validez y un mensaje.
 */
export function Criterios(password) {
    if (
      password.length < 8 ||
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      throw new Error("La contraseña debe tener al menos 8 caracteres, incluyendo letras mayúsculas, minúsculas, números y caracteres especiales.");
    }
    return true;
}