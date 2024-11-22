import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    // Configurar el transporter de nodemailer para enviar correos
    this.transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "6ad817685651b0",

        pass: "51bc5a46a28e79",
      }
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
    console.log("Enviando correo a:", userId);
    const verificationLink = `http://localhost:4000/api/gases/usuarios/verify/${userId}`; // Enlace de verificación

    const mailOptions = {
      from: "Airchain@gmail.com", // Cambia esto por tu correo
      to: destinatario, // Destinatario
      subject: "Verifica tu cuenta", // Asunto del correo
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #ffffff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding: 10px 0;
            }
            .header img {
              max-width: 150px;
            }
            .content {
              text-align: center;
              color: #333333;
            }
            .content h1 {
              color: #2c3e50;
            }
            .button {
              display: inline-block;
              margin: 20px auto;
              padding: 10px 20px;
              background-color: #3498db;
              color: #ffffff;
              text-decoration: none;
              font-size: 16px;
              border-radius: 5px;
              transition: background-color 0.3s;
            }
            .button:hover {
              background-color: #2980b9;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #aaaaaa;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
            </div>
            <div class="content">
              <h1>¡Hola ${nombre}!</h1>
              <p>¡Gracias por registrarte en Airchain!</p>
              <p>Por favor, verifica tu cuenta haciendo clic en el siguiente botón:</p>
              <a href="${verificationLink}" class="button">Verificar cuenta</a>
              <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
            </div>
            <div class="footer">
              <p>© 2024 Airchain. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
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
