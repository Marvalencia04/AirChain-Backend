import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    // Configurar el transporter de nodemailer para enviar correos
    this.transporter = nodemailer.createTransport({
      service: "gmail", // Puedes cambiar el servicio si usas otro SMTP
      auth: {
        user: process.env.EMAIL_USER || "autonest30@gmail.com", // Utiliza variables de entorno
        pass: process.env.EMAIL_PASS || "Autonest30AhoraEsPeronsal", // Cambia a variables de entorno para mayor seguridad
      },
    });

    // Verificar si la configuración de SMTP es correcta
    this.transporter.verify((error, success) => {
      if (error) {
        console.error("Error en la configuración de nodemailer:", error);
      } else {
        console.log("Servidor de correo listo para enviar mensajes.");
      }
    });
  }

  /**
   * @brief Envía un correo de confirmación al nuevo usuario registrado con un enlace de verificación.
   *
   * @param {string} destinatario El correo electrónico del destinatario.
   * @param {string} nombre El nombre del usuario.
   * @param {string} userId El ID del usuario registrado (usado para el enlace de verificación).
   * @returns {Promise<void>} Una promesa que se resuelve cuando el correo es enviado.
   * @throws {Error} Si hay un problema al enviar el correo.
   */
  async enviarCorreo(destinatario, nombre, userId) {
    const verificationLink = `http://localhost:3000/api/usuarios/verify/${userId}`; // Enlace de verificación

    const mailOptions = {
      from: "autonest30@gmail.com", // Cambia esto por tu correo
      to: destinatario, // Destinatario
      subject: "Verifica tu cuenta", // Asunto del correo
      text: `Hola ${nombre}, ¡gracias por registrarte! Por favor, verifica tu cuenta haciendo clic en el siguiente enlace: ${verificationLink}`, // Texto plano
      html: `<p>Hola <b>${nombre}</b>, ¡gracias por registrarte!</p>
             <p>Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:</p>
             <a href="${verificationLink}">Verificar cuenta</a>`, // HTML con enlace
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Correo enviado correctamente a:", destinatario);
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      throw new Error("No se pudo enviar el correo.");
    }
  }
}

export default EmailService;
