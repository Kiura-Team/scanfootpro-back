import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import Config from "../config";
import { Attachment } from "nodemailer/lib/mailer";

// const link = Config.urlFront;
const transporter = nodemailer.createTransport({
  host: Config.hostMail,
  port: Config.portMail,
  secure: true,
  auth: {
    user: Config.userMail,
    pass: Config.passwordMail,
  },
});

const createEmail = async <A extends object>(
  file: string,
  info: A
): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(
      `${__dirname}/../${file}`,
      { encoding: "utf-8" },
      function (err, html) {
        if (err) {
          return reject(err);
        } else {
          const template = handlebars.compile(html);
          const htmlToSend = template({ ...info });
          return resolve(htmlToSend);
        }
      }
    );
  });
};

/** parametriza el correo que será enviado */
// eslint-disable-next-line @typescript-eslint/ban-types
const sendCustomEmail = async <R extends object>(
  subject: string,
  destinatario: string[],
  file: string,
  replacements: R,
  attachments?: Attachment[] | undefined
) => {
  try {
    const content = await createEmail(file, replacements);

    const info = await transporter.sendMail({
      from: Config.userMail,
      to: destinatario,
      subject,
      html: content,
      attachments,
    });

    if (info.rejected.length > 0) {
      return {
        message: `Los siguientes destinatarios no recibieron la notificación: ${info.rejected.toString()}`,
      };
    }

    return { message: "Notificación enviada." };
  } catch (error) {
    console.error(`Error al enviar email:`, error);
  }
};

export default sendCustomEmail;
